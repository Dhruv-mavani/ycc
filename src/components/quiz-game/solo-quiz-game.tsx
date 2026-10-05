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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TeamPlayerGate, type GameTeamSelection } from "@/components/games/team-player-gate";

// ---------------------------------------------------------------------------
// Solo, self-serve quiz styled to match https://github.com/devxprite/kbc as
// closely as reasonable: dark violet theme, gradient question/answer tiles,
// circular lifeline buttons, a countdown timer per question, and a fully
// automatic answer -> reveal -> advance sequence (no manual "Lock"/"Reveal"
// buttons — a single click starts the sequence, same as the reference).
// No money ladder is shown anywhere (YCC prizes, when there are any, are
// handled outside the app).
//
// This component holds NO question content and NO correctness logic —
// every question (text, 4 options already shuffled into display order) and
// every correctness check comes from /api/games/quiz/* (backed by
// src/lib/games/quiz-session.ts). The old fully-client-side version
// imported the whole question bank — including every correctIndex —
// straight into the browser bundle, readable via devtools regardless of
// what any network request said; this version's client never has the
// answer to anything it hasn't already been told. See quiz-session.ts's
// header comment for the full session-token design.
//
// Entrance animations use tw-animate-css utility classes (and the
// .animate-quiz-answer-flip-in / .animate-quiz-selected-blink globals
// below) rather than framer-motion: framer-motion's
// initial->animate transitions reliably froze at their initial state for
// any element mounted after the first render, in this Next.js 16 Turbopack
// + React 19 setup specifically — reproduced directly via the DOM's own
// inline style (stuck at `opacity: 0` indefinitely), so it wasn't just a
// timing/observation issue. CSS-only animations sidestep it entirely.
// ---------------------------------------------------------------------------

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const TIMER_SECONDS = 30;
const TOTAL_LEVELS = 10; // mirrors the server's own TOTAL_LEVELS (quiz-game-questions.ts) — just a display fact, not a secret, so it's simplest to keep this one small constant duplicated here rather than import anything from the now server-only question bank.

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

interface QuizQuestionView {
  text: string;
  options: [string, string, string, string];
}

type Lifeline = "fiftyFifty" | "audiencePoll" | "askGenius" | "flip";

type PendingOutcome =
  | { correct: true; gameOver: false; token: string; levelIndex: number; question: QuizQuestionView }
  | { correct: true; gameOver: true; questionsCorrect: number }
  | { correct: false; gameOver: true; questionsCorrect: number; correctSlot: number; correctAnswerText: string };

type Phase = "start" | "requesting" | "playing" | "won" | "lost";
// idle: waiting for a click. selected: answer chosen, awaiting the server's
// verdict. revealed: verdict known, colors showing, about to auto-advance/end.
type Stage = "idle" | "selected" | "revealed";

interface GameState {
  phase: Phase;
  stage: Stage;
  token: string | null;
  levelIndex: number;
  question: QuizQuestionView | null;
  selected: number | null;
  hiddenSlots: number[];
  lifelinesUsed: { fiftyFifty: boolean; audiencePoll: boolean; askGenius: boolean; flip: boolean };
  audiencePoll: number[] | null;
  geniusPhrase: string | null;
  timer: number;
  pendingOutcome: PendingOutcome | null;
  // Only meaningful once phase is "won"/"lost" — set from the server's
  // terminal response at CONTINUE time.
  finalQuestionsCorrect: number;
  finalCorrectAnswerText: string | null;
}

type Action =
  | { type: "START_REQUEST" }
  | { type: "START_FAILED" }
  | { type: "START_OK"; token: string; levelIndex: number; question: QuizQuestionView }
  | { type: "SELECT"; slot: number }
  | { type: "TIMEOUT" }
  | { type: "ANSWER_FAILED" }
  | { type: "REVEAL"; outcome: PendingOutcome }
  | { type: "CONTINUE" }
  | { type: "LIFELINE_OK"; lifeline: "fiftyFifty"; token: string; hiddenSlots: number[] }
  | { type: "LIFELINE_OK"; lifeline: "audiencePoll"; token: string; poll: number[] }
  | { type: "LIFELINE_OK"; lifeline: "askGenius"; token: string; phrase: string }
  | { type: "LIFELINE_OK"; lifeline: "flip"; token: string; question: QuizQuestionView }
  | { type: "CLOSE_AUDIENCE_POLL" }
  | { type: "CLOSE_ASK_GENIUS" }
  | { type: "RESTART" }
  | { type: "ABANDON" };

function initialState(): GameState {
  return {
    phase: "start",
    stage: "idle",
    token: null,
    levelIndex: 0,
    question: null,
    selected: null,
    hiddenSlots: [],
    lifelinesUsed: { fiftyFifty: false, audiencePoll: false, askGenius: false, flip: false },
    audiencePoll: null,
    geniusPhrase: null,
    timer: TIMER_SECONDS,
    pendingOutcome: null,
    finalQuestionsCorrect: 0,
    finalCorrectAnswerText: null,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_REQUEST":
      return state.phase === "start" ? { ...state, phase: "requesting" } : state;
    case "START_FAILED":
      return state.phase === "requesting" ? { ...state, phase: "start" } : state;
    case "START_OK":
      return {
        ...initialState(),
        phase: "playing",
        token: action.token,
        levelIndex: action.levelIndex,
        question: action.question,
      };
    case "SELECT":
      return state.stage === "idle" ? { ...state, selected: action.slot, stage: "selected" } : state;
    // Timing out with nothing selected goes through the same "selected"
    // stage (selected stays null) as an intentional pick — the effect
    // watching that stage submits it to the server the same way either way.
    case "TIMEOUT":
      return state.stage === "idle" ? { ...state, selected: null, stage: "selected" } : state;
    case "ANSWER_FAILED":
      return state.stage === "selected" ? { ...state, stage: "idle", selected: null } : state;
    case "REVEAL":
      return state.stage === "selected" ? { ...state, stage: "revealed", pendingOutcome: action.outcome } : state;
    case "CONTINUE": {
      if (state.stage !== "revealed" || !state.pendingOutcome) return state;
      const outcome = state.pendingOutcome;
      if (!outcome.gameOver) {
        return {
          ...state,
          stage: "idle",
          token: outcome.token,
          levelIndex: outcome.levelIndex,
          question: outcome.question,
          selected: null,
          hiddenSlots: [],
          audiencePoll: null,
          geniusPhrase: null,
          pendingOutcome: null,
          timer: TIMER_SECONDS,
        };
      }
      if (outcome.correct) {
        return { ...state, phase: "won", pendingOutcome: null, finalQuestionsCorrect: outcome.questionsCorrect };
      }
      return {
        ...state,
        phase: "lost",
        pendingOutcome: null,
        finalQuestionsCorrect: outcome.questionsCorrect,
        finalCorrectAnswerText: outcome.correctAnswerText,
      };
    }
    case "LIFELINE_OK": {
      const lifelinesUsed = { ...state.lifelinesUsed, [action.lifeline]: true };
      if (action.lifeline === "fiftyFifty") {
        return { ...state, token: action.token, lifelinesUsed, hiddenSlots: action.hiddenSlots };
      }
      if (action.lifeline === "audiencePoll") {
        return { ...state, token: action.token, lifelinesUsed, audiencePoll: action.poll };
      }
      if (action.lifeline === "askGenius") {
        return { ...state, token: action.token, lifelinesUsed, geniusPhrase: action.phrase };
      }
      // flip
      return {
        ...state,
        token: action.token,
        lifelinesUsed,
        question: action.question,
        selected: null,
        hiddenSlots: [],
        audiencePoll: null,
        geniusPhrase: null,
        timer: TIMER_SECONDS,
        stage: "idle",
      };
    }
    case "CLOSE_AUDIENCE_POLL":
      return { ...state, audiencePoll: null };
    case "CLOSE_ASK_GENIUS":
      return { ...state, geniusPhrase: null };
    case "RESTART":
      return initialState();
    case "ABANDON":
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

  // Who's playing — resolved via TeamPlayerGate on the start screen, same
  // pattern as Mystery Box. Kept outside the reducer (and outlives RESTART)
  // so a replay doesn't need the code re-entered.
  const [selection, setSelection] = useState<GameTeamSelection | null>(null);

  function play(src: string) {
    if (!mutedRef.current) playSound(src);
  }

  // Asks the server to start a new run — picks (and shuffles) the first
  // question, mints the signed session token. See quiz-session.ts.
  const startingRef = useRef(false);
  async function startGame() {
    if (startingRef.current || !selection) return;
    startingRef.current = true;
    dispatch({ type: "START_REQUEST" });
    try {
      const res = await fetch("/api/games/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: selection.source,
          teamRefId: selection.teamRefId,
          playerRefId: selection.playerRefId,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        toast.error(data?.error ?? "Could not start the quiz — please try again.");
        dispatch({ type: "START_FAILED" });
        return;
      }
      dispatch({ type: "START_OK", token: data.token, levelIndex: data.levelIndex, question: data.question });
    } catch {
      toast.error("Network error — please try again.");
      dispatch({ type: "START_FAILED" });
    } finally {
      startingRef.current = false;
    }
  }

  // Submits the player's pick (or a timeout, selectedSlot: null) to the
  // server, which is the only place that ever knows or checks the correct
  // slot. A fixed 500ms minimum keeps the same suspenseful "selected" beat
  // the old fully-local version had, regardless of how fast the network
  // actually responds.
  const submittingRef = useRef(false);
  async function submitAnswer(slot: number | null) {
    if (submittingRef.current || !state.token) return;
    submittingRef.current = true;
    try {
      const [res] = await Promise.all([
        fetch("/api/games/quiz/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: state.token, selectedSlot: slot }),
        }),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        toast.error(data?.error ?? "Could not submit your answer — please try again.");
        dispatch({ type: "ANSWER_FAILED" });
        return;
      }
      dispatch({ type: "REVEAL", outcome: data as PendingOutcome });
    } catch {
      toast.error("Network error — please try again.");
      dispatch({ type: "ANSWER_FAILED" });
    } finally {
      submittingRef.current = false;
    }
  }

  const lifelineBusyRef = useRef(false);
  async function requestLifeline(lifeline: Lifeline) {
    if (lifelineBusyRef.current || !state.token) return;
    lifelineBusyRef.current = true;
    try {
      const res = await fetch("/api/games/quiz/lifeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: state.token, lifeline }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        toast.error(data?.error ?? "Could not use that lifeline — please try again.");
        return;
      }
      if (lifeline === "fiftyFifty") {
        dispatch({ type: "LIFELINE_OK", lifeline, token: data.token, hiddenSlots: data.fiftyFifty.hiddenSlots });
      } else if (lifeline === "audiencePoll") {
        dispatch({ type: "LIFELINE_OK", lifeline, token: data.token, poll: data.audiencePoll.poll });
      } else if (lifeline === "askGenius") {
        const template = GENIUS_PHRASES[Math.floor(Math.random() * GENIUS_PHRASES.length)];
        const phrase = template.replace("{answer}", data.askGenius.correctLabel);
        dispatch({ type: "LIFELINE_OK", lifeline, token: data.token, phrase });
      } else {
        dispatch({ type: "LIFELINE_OK", lifeline, token: data.token, question: data.flip.question });
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      lifelineBusyRef.current = false;
    }
  }

  // "Let's play" cue on every new question, matching the reference's own
  // effect keyed on the question changing.
  useEffect(() => {
    if (state.phase !== "playing") return;
    play(SFX.letsPlay);
  }, [state.phase, state.levelIndex]);

  // The moment a pick (or timeout) lands, submit it — the 500ms minimum
  // suspense beat lives inside submitAnswer itself now, not a local timer,
  // since the actual colors can't be known until the server replies.
  useEffect(() => {
    if (state.phase !== "playing") return;
    if (state.stage !== "selected") return;
    submitAnswer(state.selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage]);

  // Once the verdict is in, play the matching cue and hold on the reveal
  // for a readable beat before auto-advancing — same 2500ms as before.
  useEffect(() => {
    if (state.phase !== "playing") return;
    if (state.stage !== "revealed" || !state.pendingOutcome) return;
    const isCorrect = state.pendingOutcome.correct;
    play(isCorrect ? SFX.correct : state.selected === null ? SFX.timeout : SFX.wrong);
    const id = setTimeout(() => dispatch({ type: "CONTINUE" }), 2500);
    return () => clearTimeout(id);
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
    const id = setTimeout(() => dispatch({ type: "TICK" as never }), 1000);
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

  // Leaving the tab at any point during an active run ends it outright —
  // same rationale and behavior as Level Up/Mystery Box's handlers. A
  // result is only ever recorded server-side at the moment an answer is
  // actually submitted (see quiz-session.ts), so there's nothing to dodge
  // by leaving mid-reveal; this just stops the run from silently
  // continuing (or being resumed by someone else at a shared booth).
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "hidden") return;
      if (state.phase !== "playing" && state.phase !== "requesting") return;
      toast.error("You left the game, so this run has ended — enter your code again to start a new one.");
      dispatch({ type: "ABANDON" });
      setSelection(null);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [state.phase]);

  if (state.phase === "start" || state.phase === "requesting") {
    return (
      <StartScreen
        onStart={startGame}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        canStart={!!selection && state.phase === "start"}
        busy={state.phase === "requesting"}
        onSelectionChange={setSelection}
      />
    );
  }
  if (state.phase === "won" || state.phase === "lost") {
    return (
      <EndScreen
        phase={state.phase}
        questionsCorrect={state.finalQuestionsCorrect}
        totalQuestions={TOTAL_LEVELS}
        correctAnswer={state.finalCorrectAnswerText}
        showCorrectAnswer={state.phase === "lost"}
        onRestart={() => dispatch({ type: "RESTART" })}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />
    );
  }

  if (!state.question) return null; // unreachable in practice — phase "playing" always carries a question

  const outcome = state.pendingOutcome;
  const revealed = state.stage === "revealed" && outcome !== null;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-10 pt-16">
      <CheatDisclaimerWatermark />
      <MuteButton muted={muted} onToggle={() => setMuted((m) => !m)} />

      <AudiencePollDialog
        poll={state.audiencePoll}
        onClose={() => dispatch({ type: "CLOSE_AUDIENCE_POLL" })}
        hidden={state.hiddenSlots}
      />
      <AskGeniusDialog
        phrase={state.geniusPhrase}
        onClose={() => dispatch({ type: "CLOSE_ASK_GENIUS" })}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-orange-400">
          Question {state.levelIndex + 1} of {TOTAL_LEVELS}
        </p>

        <TimerRing seconds={state.timer} running={!timerPaused} />

        <QuestionBox text={state.question.text} questionKey={state.levelIndex} />
        <p className="mx-auto mt-3 max-w-xl text-center text-sm font-bold uppercase tracking-wide text-yellow-300 md:text-base">
          AI assistance is not allowed during this quiz — answer it yourself.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-x-16 md:gap-y-6">
          {state.question.options.map((text, slot) => {
            const isHidden = state.hiddenSlots.includes(slot);
            const isSelected = state.selected === slot;
            const isCorrectSlot = revealed && outcome
              ? outcome.correct
                ? slot === state.selected
                : slot === outcome.correctSlot
              : false;

            let tone = "from-violet-700 to-violet-950 border-white/10";
            if (isHidden) {
              tone = "from-violet-950 to-violet-950 border-white/5 opacity-20";
            } else if (revealed) {
              if (isCorrectSlot) tone = "from-emerald-500 to-emerald-800 border-emerald-300";
              else if (isSelected) tone = "from-red-500 to-red-800 border-red-400";
              else tone = "from-violet-950 to-violet-950 border-white/5 opacity-40";
            } else if (isSelected) {
              tone = "from-amber-500 to-amber-700 border-amber-400";
            }

            return (
              <button
                key={`${state.levelIndex}-${slot}`}
                type="button"
                disabled={isHidden || state.stage !== "idle"}
                onClick={() => dispatch({ type: "SELECT", slot })}
                style={{ animationDelay: `${slot * 120}ms` }}
                className={cn(
                  "animate-quiz-answer-flip-in relative rounded-lg border-2 bg-gradient-to-b px-4 py-3 text-left text-base font-medium text-white shadow-lg transition-colors md:text-xl",
                  "disabled:cursor-not-allowed",
                  isSelected && state.stage === "selected" && "animate-quiz-selected-blink",
                  tone,
                )}
              >
                <span className="mr-1 font-bold">{OPTION_LABELS[slot]}:</span>
                {text}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-center text-sm font-bold uppercase tracking-wide text-yellow-300 md:text-base">
          Answer honestly — no AI, no outside help.
        </p>

        <Lifelines
          lifelinesUsed={state.lifelinesUsed}
          disabled={state.stage !== "idle"}
          onFiftyFifty={() => requestLifeline("fiftyFifty")}
          onAudiencePoll={() => requestLifeline("audiencePoll")}
          onAskGenius={() => requestLifeline("askGenius")}
          onFlip={() => requestLifeline("flip")}
        />
      </div>
    </div>
  );
}

// Large, low-opacity, tiled background text behind the whole question
// screen — purely a deterrent nudge, not an actual anti-cheat mechanism
// (there's no way for a web page to detect or block someone photographing
// the screen for a second device). pointer-events-none + aria-hidden so it
// never interferes with clicking real options or with screen readers.
function CheatDisclaimerWatermark() {
  const repeats = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
      <div className="absolute inset-0 flex -rotate-12 flex-wrap content-center items-center justify-center gap-x-10 gap-y-6 opacity-[0.05]">
        {repeats.map((i) => (
          <span key={i} className="whitespace-nowrap text-3xl font-black uppercase tracking-widest md:text-5xl">
            AI is not allowed here
          </span>
        ))}
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
  canStart,
  busy,
  onSelectionChange,
}: {
  onStart: () => void;
  muted: boolean;
  onToggleMute: () => void;
  canStart: boolean;
  busy: boolean;
  onSelectionChange: (selection: GameTeamSelection | null) => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <MuteButton muted={muted} onToggle={onToggleMute} />
      <div className="animate-mystery-box-glow absolute -z-10 size-52 rounded-full bg-violet-400/30 blur-3xl sm:size-72" />
      <span className="text-5xl sm:text-6xl">🧠</span>
      <h1 className="mt-6 tw-animate-in tw-fade-in tw-slide-in-from-bottom-8 tw-duration-1000 text-4xl font-black md:text-6xl">
        Welcome to Quiz Champion
      </h1>
      <ul
        style={{ animationDelay: "400ms" }}
        className="tw-animate-in tw-fade-in tw-slide-in-from-bottom-4 tw-duration-1000 tw-fill-mode-both mt-8 max-w-2xl list-disc space-y-3 px-2 text-left text-base leading-relaxed text-white/80 marker:text-amber-400 md:text-lg"
      >
        <li>
          {`${TOTAL_LEVELS} thrilling questions — cricket trivia, general knowledge, and riddles — each one a little tougher than the last.`}
        </li>
        <li>{`${TIMER_SECONDS} seconds per question, four options (A, B, C, D) every time.`}</li>
        <li>
          Four lifelines are here to help:
          <ul className="mt-2 list-[circle] space-y-1.5 pl-5 marker:text-amber-300/70">
            <li>
              <b>Audience Poll</b> — taps into the wisdom of the crowd
            </li>
            <li>
              <b>Ask a Genius</b> — gives you an expert opinion
            </li>
            <li>
              <b>Fifty-Fifty</b> — removes two wrong options
            </li>
            <li>
              <b>Flip Question</b> — trades the current question for a new one
            </li>
          </ul>
        </li>
        <li>
          Enter your code below to confirm who&apos;s playing, then it&apos;s
          just you against the quiz. Ready to become Quiz Champion?
        </li>
      </ul>

      <TeamPlayerGate onSelectionChange={onSelectionChange} />

      <button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        style={{ animationDelay: "900ms" }}
        className={cn(
          "tw-animate-in tw-fade-in tw-zoom-in-50 tw-duration-1000 tw-fill-mode-both mt-8 rounded-lg px-10 py-3 text-xl font-bold shadow-lg transition-colors md:text-2xl",
          canStart
            ? "bg-violet-700 hover:bg-violet-600"
            : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40",
        )}
      >
        {busy ? "Starting…" : "Start New Game"}
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
  correctAnswer: string | null;
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
      {showCorrectAnswer && correctAnswer ? (
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
  // mount — a plain CSS transition, since the target height is a runtime
  // value tw-animate-css's fixed keyframes can't express.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // poll is already indexed by display slot (0-3) — the server builds it
  // that way directly (see generateAudiencePoll in quiz-session.ts), since
  // this client never has a separate "true option index" space to
  // translate from in the first place.
  return (
    <div className="grid grid-cols-4 items-end justify-items-center gap-2 py-4">
      {poll.map((percent, slot) =>
        hidden.includes(slot) ? (
          <div key={slot} />
        ) : (
          <div key={slot} className="flex h-40 w-full flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold text-white/70">{percent}%</span>
            <div className="flex h-full w-8 items-end overflow-hidden rounded-t-md bg-white/10 md:w-12">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-amber-300 transition-[height] duration-1000 ease-out"
                style={{ height: grown ? `${percent}%` : "4%" }}
              />
            </div>
            <span className="text-sm font-black">{OPTION_LABELS[slot]}</span>
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
