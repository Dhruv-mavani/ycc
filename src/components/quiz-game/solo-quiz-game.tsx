"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Confetti from "react-confetti";
import {
  Users,
  Shuffle,
  Brain,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { QUESTION_TIERS, LEVELS_PER_TIER, TOTAL_LEVELS, type QuizQuestion } from "@/lib/quiz-game-questions";

// ---------------------------------------------------------------------------
// Solo, self-serve quiz styled to match https://github.com/devxprite/kbc as
// closely as reasonable: dark violet theme, gradient question/answer tiles,
// circular lifeline buttons, a countdown timer per question, and a fully
// automatic answer -> reveal -> advance sequence (no manual "Lock"/"Reveal"
// buttons — a single click starts the sequence, same as the reference).
// No money ladder is shown anywhere (YCC prizes, when there are any, are
// handled outside the app) — otherwise the game logic (question bank,
// lifelines, tiers) is the same as KbcGame (src/components/quiz-game/
// kbc-game.tsx), our host-driven sibling game.
//
// Entrance animations use tw-animate-css utility classes (and the same
// .animate-quiz-answer-flip-in / .animate-quiz-selected-blink globals
// KbcGame already relies on) rather than framer-motion: framer-motion's
// initial->animate transitions reliably froze at their initial state for
// any element mounted after the first render, in this Next.js 16 Turbopack
// + React 19 setup specifically — reproduced directly via the DOM's own
// inline style (stuck at `opacity: 0` indefinitely), so it wasn't just a
// timing/observation issue. CSS-only animations sidestep it entirely.
// ---------------------------------------------------------------------------

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const TIMER_SECONDS = 40;

const GENIUS_PHRASES = [
  "Haha, I don't know... but try option {answer}!",
  "I'm no expert, but my gut says option {answer}.",
  "Honestly? No clue. Going with option {answer} anyway.",
  "Genius mode activated. The answer is option {answer}, trust me.",
  "I skipped class that day, but I'm pretty sure it's option {answer}.",
  "Let me consult my crystal ball... it says option {answer}.",
  "Ask a genius, get a genius answer: option {answer}.",
  "I googled it in my head. Option {answer}, final answer.",
];

// Same sound files and trigger points as devxprite/kbc (public/quiz-game2/
// audio/ — added by the project owner, who owns the redistribution call
// on these). "letsPlay" fires on every new question, "tick" loops while
// the timer runs, "timeout" is distinct from "wrong" (times out vs an
// intentional wrong pick), and "theme" plays on the end screen either way.
const SFX = {
  letsPlay: "/quiz-game2/audio/lets_play.mp3",
  correct: "/quiz-game2/audio/correct_answer.mp3",
  wrong: "/quiz-game2/audio/wrong_answer.mp3",
  timeout: "/quiz-game2/audio/timeout.mp3",
  tick: "/quiz-game2/audio/clock.mp3",
  theme: "/quiz-game2/audio/theme.mp3",
};

function playSound(src: string) {
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

function tierForLevel(levelIndex: number): number {
  return Math.floor(levelIndex / LEVELS_PER_TIER);
}

function currentQuestion(state: GameState): QuizQuestion {
  const tier = QUESTION_TIERS[tierForLevel(state.levelIndex)];
  const poolIndex = state.assignedIndexByLevel[state.levelIndex] ?? 0;
  return tier.questions[poolIndex];
}

function pickIndexExcluding(poolLength: number, exclude: number[]): number {
  const candidates = Array.from({ length: poolLength }, (_, i) => i).filter((i) => !exclude.includes(i));
  const pool = candidates.length > 0 ? candidates : Array.from({ length: poolLength }, (_, i) => i);
  return pool[Math.floor(Math.random() * pool.length)];
}

function assignAllLevels(): Record<number, number> {
  const assigned: Record<number, number> = {};
  QUESTION_TIERS.forEach((tier, tierIdx) => {
    const shuffled = Array.from({ length: tier.questions.length }, (_, i) => i).sort(() => Math.random() - 0.5);
    for (let slot = 0; slot < LEVELS_PER_TIER; slot++) {
      assigned[tierIdx * LEVELS_PER_TIER + slot] = shuffled[slot % shuffled.length];
    }
  });
  return assigned;
}

function generateAudiencePoll(correctIndex: number, hidden: number[]): number[] {
  const visible = [0, 1, 2, 3].filter((i) => !hidden.includes(i));
  const weights = visible.map((i) => (i === correctIndex ? 40 + Math.random() * 35 : Math.random() * 30));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const percentages = new Array(4).fill(0);
  visible.forEach((optionIndex, idx) => {
    percentages[optionIndex] = Math.round((weights[idx] / total) * 100);
  });
  const sum = percentages.reduce((a, b) => a + b, 0);
  if (sum !== 100 && visible.length > 0) {
    const maxIdx = visible.reduce((best, i) => (percentages[i] > percentages[best] ? i : best), visible[0]);
    percentages[maxIdx] += 100 - sum;
  }
  return percentages;
}

function shuffledOptionOrder(): number[] {
  return [0, 1, 2, 3].sort(() => Math.random() - 0.5);
}

type Phase = "start" | "playing" | "won" | "lost";
// idle: waiting for a click. selected: answer chosen, suspense beat before
// colors show. revealed: colors showing, about to auto-advance/end.
type Stage = "idle" | "selected" | "revealed";

interface GameState {
  phase: Phase;
  stage: Stage;
  levelIndex: number;
  assignedIndexByLevel: Record<number, number>;
  optionOrder: number[];
  selected: number | null;
  hiddenOptions: number[];
  lifelinesUsed: { fiftyFifty: boolean; audiencePoll: boolean; askGenius: boolean; flip: boolean };
  audiencePoll: number[] | null;
  geniusPhrase: string | null;
  questionsCorrect: number;
  timer: number;
}

type Action =
  | { type: "START" }
  | { type: "SELECT"; index: number }
  | { type: "REVEAL" }
  | { type: "TIMEOUT" }
  | { type: "CONTINUE" }
  | { type: "TICK" }
  | { type: "USE_FIFTY_FIFTY" }
  | { type: "USE_AUDIENCE_POLL" }
  | { type: "CLOSE_AUDIENCE_POLL" }
  | { type: "USE_ASK_GENIUS" }
  | { type: "CLOSE_ASK_GENIUS" }
  | { type: "USE_FLIP" }
  | { type: "RESTART" };

function initialState(): GameState {
  return {
    phase: "start",
    stage: "idle",
    levelIndex: 0,
    assignedIndexByLevel: {},
    optionOrder: [0, 1, 2, 3],
    selected: null,
    hiddenOptions: [],
    lifelinesUsed: { fiftyFifty: false, audiencePoll: false, askGenius: false, flip: false },
    audiencePoll: null,
    geniusPhrase: null,
    questionsCorrect: 0,
    timer: TIMER_SECONDS,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return {
        ...initialState(),
        phase: "playing",
        assignedIndexByLevel: assignAllLevels(),
        optionOrder: shuffledOptionOrder(),
      };
    case "SELECT":
      return state.stage === "idle" ? { ...state, selected: action.index, stage: "selected" } : state;
    case "REVEAL":
      return state.stage === "selected" ? { ...state, stage: "revealed" } : state;
    // Timing out with nothing selected skips straight to "revealed" (with
    // selected staying null) — same downstream CONTINUE handling as a wrong
    // pick, since selected !== correctIndex is true either way.
    case "TIMEOUT":
      return state.stage === "idle" ? { ...state, stage: "revealed" } : state;
    case "CONTINUE": {
      if (state.stage !== "revealed") return state;
      const isCorrect = state.selected === currentQuestion(state).correctIndex;
      if (!isCorrect) return { ...state, phase: "lost" };
      const nextLevelIndex = state.levelIndex + 1;
      const questionsCorrect = state.questionsCorrect + 1;
      if (nextLevelIndex >= TOTAL_LEVELS) {
        return { ...state, phase: "won", questionsCorrect };
      }
      return {
        ...state,
        levelIndex: nextLevelIndex,
        stage: "idle",
        selected: null,
        hiddenOptions: [],
        audiencePoll: null,
        geniusPhrase: null,
        questionsCorrect,
        timer: TIMER_SECONDS,
      };
    }
    case "TICK":
      return state.timer > 0 ? { ...state, timer: state.timer - 1 } : state;
    case "USE_FIFTY_FIFTY": {
      if (state.lifelinesUsed.fiftyFifty || state.stage !== "idle") return state;
      const correctIndex = currentQuestion(state).correctIndex;
      const wrongIndexes = [0, 1, 2, 3].filter((i) => i !== correctIndex);
      const toHide = [...wrongIndexes].sort(() => Math.random() - 0.5).slice(0, 2);
      return {
        ...state,
        hiddenOptions: toHide,
        lifelinesUsed: { ...state.lifelinesUsed, fiftyFifty: true },
      };
    }
    case "USE_AUDIENCE_POLL": {
      if (state.lifelinesUsed.audiencePoll || state.stage !== "idle") return state;
      return {
        ...state,
        audiencePoll: generateAudiencePoll(currentQuestion(state).correctIndex, state.hiddenOptions),
        lifelinesUsed: { ...state.lifelinesUsed, audiencePoll: true },
      };
    }
    case "CLOSE_AUDIENCE_POLL":
      return { ...state, audiencePoll: null };
    case "USE_ASK_GENIUS": {
      if (state.lifelinesUsed.askGenius || state.stage !== "idle") return state;
      const correctLabel = OPTION_LABELS[state.optionOrder.indexOf(currentQuestion(state).correctIndex)];
      const template = GENIUS_PHRASES[Math.floor(Math.random() * GENIUS_PHRASES.length)];
      return {
        ...state,
        geniusPhrase: template.replace("{answer}", correctLabel),
        lifelinesUsed: { ...state.lifelinesUsed, askGenius: true },
      };
    }
    case "CLOSE_ASK_GENIUS":
      return { ...state, geniusPhrase: null };
    case "USE_FLIP": {
      if (state.lifelinesUsed.flip || state.stage !== "idle") return state;
      const tier = tierForLevel(state.levelIndex);
      const tierStart = tier * LEVELS_PER_TIER;
      const usedIndexesInTier = Array.from({ length: LEVELS_PER_TIER }, (_, i) => state.assignedIndexByLevel[tierStart + i]);
      const newIndex = pickIndexExcluding(QUESTION_TIERS[tier].questions.length, usedIndexesInTier);
      return {
        ...state,
        assignedIndexByLevel: { ...state.assignedIndexByLevel, [state.levelIndex]: newIndex },
        selected: null,
        hiddenOptions: [],
        audiencePoll: null,
        geniusPhrase: null,
        timer: TIMER_SECONDS,
        lifelinesUsed: { ...state.lifelinesUsed, flip: true },
      };
    }
    case "RESTART":
      return initialState();
    default:
      return state;
  }
}

export function SoloQuizGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  function play(src: string) {
    if (!mutedRef.current) playSound(src);
  }

  // "Let's play" cue on every new question, matching the reference's own
  // effect keyed on the question changing.
  useEffect(() => {
    if (state.phase !== "playing") return;
    play(SFX.letsPlay);
  }, [state.phase, state.levelIndex]);

  // Drives the automatic select -> reveal -> continue sequence — the same
  // 500ms / 1000ms / 3000ms beats as the reference's Trivia.jsx handleClick.
  useEffect(() => {
    if (state.phase !== "playing") return;
    if (state.stage === "selected") {
      const id = setTimeout(() => dispatch({ type: "REVEAL" }), 500);
      return () => clearTimeout(id);
    }
    if (state.stage === "revealed") {
      const question = currentQuestion(state);
      const isCorrect = state.selected === question.correctIndex;
      // A timed-out question (nothing selected) gets its own distinct
      // sound from an intentional wrong pick, matching the reference.
      play(isCorrect ? SFX.correct : state.selected === null ? SFX.timeout : SFX.wrong);
      const id = setTimeout(() => dispatch({ type: "CONTINUE" }), 2500);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage]);

  // Countdown timer — paused once an answer is chosen or a lifeline dialog
  // is open, matching the reference's pauseTimer() calls.
  const timerPaused =
    state.stage !== "idle" || state.audiencePoll !== null || state.geniusPhrase !== null;
  useEffect(() => {
    if (state.phase !== "playing" || timerPaused) return;
    if (state.timer === 0) {
      dispatch({ type: "TIMEOUT" });
      return;
    }
    const id = setTimeout(() => dispatch({ type: "TICK" }), 1000);
    return () => clearTimeout(id);
  }, [state.phase, state.timer, timerPaused]);

  // Looping tick sound while the timer is actually running.
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const running = state.phase === "playing" && !timerPaused;
    if (running && !muted) {
      const audio = tickAudioRef.current ?? new Audio(SFX.tick);
      audio.loop = true;
      tickAudioRef.current = audio;
      audio.play().catch(() => {});
    } else {
      tickAudioRef.current?.pause();
    }
    return () => {
      tickAudioRef.current?.pause();
    };
  }, [state.phase, timerPaused, muted]);

  if (state.phase === "start") {
    return <StartScreen onStart={() => dispatch({ type: "START" })} muted={muted} onToggleMute={() => setMuted((m) => !m)} />;
  }
  if (state.phase === "won" || state.phase === "lost") {
    return (
      <EndScreen
        phase={state.phase}
        questionsCorrect={state.questionsCorrect}
        totalQuestions={TOTAL_LEVELS}
        correctAnswer={currentQuestion(state).options[currentQuestion(state).correctIndex]}
        showCorrectAnswer={state.phase === "lost"}
        onRestart={() => dispatch({ type: "RESTART" })}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />
    );
  }

  const question = currentQuestion(state);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-10 pt-16">
      <MuteButton muted={muted} onToggle={() => setMuted((m) => !m)} />

      <AudiencePollDialog
        poll={state.audiencePoll}
        onClose={() => dispatch({ type: "CLOSE_AUDIENCE_POLL" })}
        hidden={state.hiddenOptions}
      />
      <AskGeniusDialog
        phrase={state.geniusPhrase}
        onClose={() => dispatch({ type: "CLOSE_ASK_GENIUS" })}
      />

      <div className="mx-auto w-full max-w-4xl">
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-orange-400">
          Question {state.levelIndex + 1} of {TOTAL_LEVELS}
        </p>

        <TimerRing seconds={state.timer} running={!timerPaused} />

        <QuestionBox text={question.question} questionKey={state.levelIndex} />

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-x-16 md:gap-y-6">
          {state.optionOrder.map((index, displaySlot) => {
            const option = question.options[index];
            const isHidden = state.hiddenOptions.includes(index);
            const isSelected = state.selected === index;
            const isOptionCorrect = index === question.correctIndex;

            let tone = "from-violet-700 to-violet-950 border-white/10";
            if (isHidden) {
              tone = "from-violet-950 to-violet-950 border-white/5 opacity-20";
            } else if (state.stage === "revealed") {
              if (isOptionCorrect) tone = "from-emerald-500 to-emerald-800 border-emerald-300";
              else if (isSelected) tone = "from-red-500 to-red-800 border-red-400";
              else tone = "from-violet-950 to-violet-950 border-white/5 opacity-40";
            } else if (isSelected) {
              tone = "from-amber-500 to-amber-700 border-amber-400";
            }

            return (
              <button
                key={`${state.levelIndex}-${index}`}
                type="button"
                disabled={isHidden || state.stage !== "idle"}
                onClick={() => dispatch({ type: "SELECT", index })}
                style={{ animationDelay: `${displaySlot * 120}ms` }}
                className={cn(
                  "animate-quiz-answer-flip-in relative rounded-lg border-2 bg-gradient-to-b px-4 py-3 text-left text-base font-medium text-white shadow-lg transition-colors md:text-xl",
                  "disabled:cursor-not-allowed",
                  isSelected && state.stage === "selected" && "animate-quiz-selected-blink",
                  tone,
                )}
              >
                <span className="mr-1 font-bold">{OPTION_LABELS[displaySlot]}:</span>
                {option}
              </button>
            );
          })}
        </div>

        <Lifelines
          lifelinesUsed={state.lifelinesUsed}
          disabled={state.stage !== "idle"}
          onFiftyFifty={() => dispatch({ type: "USE_FIFTY_FIFTY" })}
          onAudiencePoll={() => dispatch({ type: "USE_AUDIENCE_POLL" })}
          onAskGenius={() => dispatch({ type: "USE_ASK_GENIUS" })}
          onFlip={() => dispatch({ type: "USE_FLIP" })}
        />
      </div>
    </div>
  );
}

function QuestionBox({ text, questionKey }: { text: string; questionKey: number }) {
  return (
    <div className="relative mx-auto mt-2 max-w-3xl">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[3px] w-screen -translate-x-1/2 -translate-y-1/2 bg-white/10" />
      {/* Keyed so a new question remounts the element, restarting the
          entrance animation fresh each time — same trick used for the
          audience-poll bars below. */}
      <p
        key={questionKey}
        className="tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-500 rounded-lg border-2 border-white/15 bg-gradient-to-b from-violet-700 to-violet-950 p-4 text-center text-lg font-semibold shadow-2xl md:p-6 md:text-2xl"
      >
        {text}
      </p>
    </div>
  );
}

function TimerRing({ seconds, running }: { seconds: number; running: boolean }) {
  const low = seconds <= 10;
  return (
    <div className="mx-auto mb-6 mt-2 aspect-square w-24 rounded-full bg-gradient-to-br from-white/40 via-white/10 to-white/40 p-1 shadow-lg md:w-40">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-violet-900">
        <span
          className={cn(
            "text-4xl font-black tabular-nums md:text-6xl",
            low ? "text-orange-400" : "text-white",
            running && "animate-pulse",
          )}
        >
          {seconds}
        </span>
      </div>
    </div>
  );
}

function Lifelines({
  lifelinesUsed,
  disabled,
  onFiftyFifty,
  onAudiencePoll,
  onAskGenius,
  onFlip,
}: {
  lifelinesUsed: { fiftyFifty: boolean; audiencePoll: boolean; askGenius: boolean; flip: boolean };
  disabled: boolean;
  onFiftyFifty: () => void;
  onAudiencePoll: () => void;
  onAskGenius: () => void;
  onFlip: () => void;
}) {
  const items = [
    { key: "fiftyFifty", label: "Fifty-Fifty", icon: <span className="text-base font-black md:text-xl">50:50</span>, onClick: onFiftyFifty },
    { key: "audiencePoll", label: "Audience Poll", icon: <Users className="size-5 md:size-7" />, onClick: onAudiencePoll },
    { key: "askGenius", label: "Ask a Genius", icon: <Brain className="size-5 md:size-7" />, onClick: onAskGenius },
    { key: "flip", label: "Flip Question", icon: <Shuffle className="size-5 md:size-7" />, onClick: onFlip },
  ] as const;

  return (
    <div className="mx-auto mt-10 flex max-w-xl items-center justify-around">
      {items.map((item) => {
        const used = lifelinesUsed[item.key];
        return (
          <button
            key={item.key}
            type="button"
            disabled={used || disabled}
            onClick={item.onClick}
            title={item.label}
            className={cn(
              "flex size-14 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-violet-700 to-violet-950 text-white shadow-md transition-all hover:scale-110 md:size-20",
              (used || disabled) && "cursor-not-allowed opacity-40 hover:scale-100",
            )}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
}

function MuteButton({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Unmute" : "Mute"}
      className="absolute right-4 top-4 z-10 text-white/80 hover:text-white"
    >
      {muted ? <VolumeX className="size-7 md:size-9" /> : <Volume2 className="size-7 md:size-9" />}
    </button>
  );
}

function StartScreen({
  onStart,
  muted,
  onToggleMute,
}: {
  onStart: () => void;
  muted: boolean;
  onToggleMute: () => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <MuteButton muted={muted} onToggle={onToggleMute} />
      <h1 className="tw-animate-in tw-fade-in tw-slide-in-from-bottom-8 tw-duration-1000 text-4xl font-black md:text-6xl">
        Welcome to Quiz Champion
      </h1>
      <p
        style={{ animationDelay: "400ms" }}
        className="tw-animate-in tw-fade-in tw-slide-in-from-bottom-4 tw-duration-1000 tw-fill-mode-both mt-8 max-w-2xl px-2 text-base leading-relaxed text-white/80 md:text-lg"
      >
        {`Test your knowledge and nerves as you take on ${TOTAL_LEVELS} thrilling questions — cricket trivia, general knowledge, and riddles. With just ${TIMER_SECONDS} seconds to answer each one, the pressure is on. You'll get four options (A, B, C, D) for each question, and every one gets a little tougher than the last.`}
        <br />
        <br />
        Four lifelines are here to help: <b>Audience Poll</b> taps into the
        wisdom of the crowd, <b>Ask a Genius</b> gives you an expert opinion,{" "}
        <b>Fifty-Fifty</b> removes two wrong options, and <b>Flip Question</b>{" "}
        trades the current question for a new one.
        <br />
        <br />
        No accounts, no logins, no money on the line — just you against the
        quiz. Ready to become Quiz Champion?
      </p>
      <button
        type="button"
        onClick={onStart}
        style={{ animationDelay: "900ms" }}
        className="tw-animate-in tw-fade-in tw-zoom-in-50 tw-duration-1000 tw-fill-mode-both mt-10 rounded-lg bg-violet-700 px-10 py-3 text-xl font-bold shadow-lg transition-colors hover:bg-violet-600 md:text-2xl"
      >
        Start New Game
      </button>
    </div>
  );
}

function EndScreen({
  phase,
  questionsCorrect,
  totalQuestions,
  correctAnswer,
  showCorrectAnswer,
  onRestart,
  muted,
  onToggleMute,
}: {
  phase: "won" | "lost";
  questionsCorrect: number;
  totalQuestions: number;
  correctAnswer: string;
  showCorrectAnswer: boolean;
  onRestart: () => void;
  muted: boolean;
  onToggleMute: () => void;
}) {
  // Lazy initial state, not an effect — this screen is only ever reached
  // client-side (after the reducer transitions phase post-hydration), so
  // `window` is always available whenever this actually mounts.
  const [dimensions] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

  // Reference plays its theme cue on the end screen regardless of outcome.
  useEffect(() => {
    if (!muted) playSound(SFX.theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heading = phase === "won" ? "🎉 Quiz Champion!" : "Game Over";
  const message =
    phase === "won"
      ? `You answered all ${totalQuestions} questions correctly!`
      : `That one was wrong — got ${questionsCorrect} question${questionsCorrect === 1 ? "" : "s"} correct.`;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <MuteButton muted={muted} onToggle={onToggleMute} />
      {phase === "won" && dimensions ? (
        <Confetti width={dimensions.width} height={dimensions.height} numberOfPieces={250} recycle={false} />
      ) : null}
      <h1 className="tw-animate-in tw-fade-in tw-slide-in-from-bottom-8 tw-duration-1000 text-4xl font-black md:text-7xl">
        {heading}
      </h1>
      <p className="mt-4 max-w-sm text-base text-white/80 md:text-lg">{message}</p>
      {showCorrectAnswer ? (
        <p className="mt-2 max-w-sm text-sm text-emerald-400 md:text-base">
          Correct answer: <span className="font-bold">{correctAnswer}</span>
        </p>
      ) : null}
      <button
        type="button"
        onClick={onRestart}
        style={{ animationDelay: "1000ms" }}
        className="tw-animate-in tw-fade-in tw-zoom-in-50 tw-duration-1000 tw-fill-mode-both mt-10 rounded-lg bg-violet-700 px-8 py-3 text-xl font-bold shadow-lg transition-colors hover:bg-violet-600"
      >
        Start New Game
      </button>
    </div>
  );
}

function DialogShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-2 border-violet-500 bg-violet-950 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-white">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function AudiencePollDialog({
  poll,
  hidden,
  onClose,
}: {
  poll: number[] | null;
  hidden: number[];
  onClose: () => void;
}) {
  return (
    <DialogShell open={poll !== null} onClose={onClose} title="Audience Poll Results">
      {poll ? <AudiencePollBars poll={poll} hidden={hidden} /> : null}
    </DialogShell>
  );
}

function AudiencePollBars({ poll, hidden }: { poll: number[]; hidden: number[] }) {
  // Bars start short and transition up to their real value a beat after
  // mount — same plain-CSS-transition technique KbcGame's own audience
  // poll uses (see kbc-game.tsx), since the target height is a runtime
  // value tw-animate-css's fixed keyframes can't express.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="grid grid-cols-4 items-end justify-items-center gap-2 py-4">
      {poll.map((percent, index) =>
        hidden.includes(index) ? (
          <div key={index} />
        ) : (
          <div key={index} className="flex h-40 w-full flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold text-white/70">{percent}%</span>
            <div className="flex h-full w-8 items-end overflow-hidden rounded-t-md bg-white/10 md:w-12">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-amber-300 transition-[height] duration-1000 ease-out"
                style={{ height: grown ? `${percent}%` : "4%" }}
              />
            </div>
            <span className="text-sm font-black">{OPTION_LABELS[index]}</span>
          </div>
        ),
      )}
    </div>
  );
}

function AskGeniusDialog({ phrase, onClose }: { phrase: string | null; onClose: () => void }) {
  return (
    <DialogShell open={phrase !== null} onClose={onClose} title="Ask a Genius">
      <p className="py-2 text-center text-lg font-bold">{phrase}</p>
    </DialogShell>
  );
}
