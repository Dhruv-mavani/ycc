"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import {
  Trophy,
  Users,
  Shuffle,
  Phone,
  DoorOpen,
  Lock,
  Eye,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { QUESTION_TIERS, LEVELS_PER_TIER, TOTAL_LEVELS, type QuizQuestion } from "@/lib/quiz-game-questions";

// ---------------------------------------------------------------------------
// This is a HOST-DRIVEN party game, not a scored/anti-cheat quiz backend and
// not a prize/money ladder — the host decides real-world prizes offline. One
// volunteer opens this page (usually on their own phone), reads the question
// aloud to a seated group, and taps through the flow themselves — including
// manually judging "correct" vs "wrong" after Reveal. There is no server, no
// auth, no per-participant accounts: all state lives in this one component
// for the duration of the live session.
//
// Only 10 of the 50-question bank get played per game: 2 questions drawn
// randomly (no repeats within a game) from each of the 5 difficulty tiers,
// so escalating difficulty is preserved but the exact questions vary across
// playthroughs.
// ---------------------------------------------------------------------------

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const PHONE_A_FRIEND_SECONDS = 60;

// Royalty-free, attribution-not-required sound effects from Mixkit
// (https://mixkit.co/license/ — Sound Effects Free License).
const SFX = {
  correct: "/quiz-game/sounds/correct.mp3",
  wrong: "/quiz-game/sounds/wrong.mp3",
  applause: "/quiz-game/sounds/applause.mp3",
  tick: "/quiz-game/sounds/tick.mp3",
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

// Precomputes every level's question for a whole game up front: shuffle each
// tier's pool and take the first LEVELS_PER_TIER indices, so the 2 levels
// sharing a tier never draw the same question in one playthrough.
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

type Phase = "start" | "playing" | "won" | "lost" | "ended-early";

interface GameState {
  phase: Phase;
  levelIndex: number;
  assignedIndexByLevel: Record<number, number>;
  optionOrder: number[];
  selected: number | null;
  locked: boolean;
  revealed: boolean;
  hiddenOptions: number[];
  lifelinesUsed: { fiftyFifty: boolean; audiencePoll: boolean; phoneAFriend: boolean; flip: boolean };
  audiencePoll: number[] | null;
  phoneAFriendOpen: boolean;
  questionsCorrect: number;
}

type Action =
  | { type: "START" }
  | { type: "SELECT"; index: number }
  | { type: "LOCK" }
  | { type: "REVEAL" }
  | { type: "MARK_CORRECT" }
  | { type: "MARK_WRONG" }
  | { type: "END_EARLY" }
  | { type: "USE_FIFTY_FIFTY" }
  | { type: "USE_AUDIENCE_POLL" }
  | { type: "CLOSE_AUDIENCE_POLL" }
  | { type: "USE_PHONE_A_FRIEND" }
  | { type: "CLOSE_PHONE_A_FRIEND" }
  | { type: "USE_FLIP" }
  | { type: "RESTART" };

function shuffledOptionOrder(): number[] {
  return [0, 1, 2, 3].sort(() => Math.random() - 0.5);
}

function initialState(): GameState {
  return {
    phase: "start",
    levelIndex: 0,
    assignedIndexByLevel: {},
    optionOrder: [0, 1, 2, 3],
    selected: null,
    locked: false,
    revealed: false,
    hiddenOptions: [],
    lifelinesUsed: { fiftyFifty: false, audiencePoll: false, phoneAFriend: false, flip: false },
    audiencePoll: null,
    phoneAFriendOpen: false,
    questionsCorrect: 0,
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
      return state.locked ? state : { ...state, selected: action.index };
    case "LOCK":
      return state.selected === null || state.locked ? state : { ...state, locked: true };
    case "REVEAL":
      return state.locked ? { ...state, revealed: true } : state;
    case "MARK_CORRECT": {
      if (!state.revealed) return state;
      const nextLevelIndex = state.levelIndex + 1;
      const questionsCorrect = state.questionsCorrect + 1;
      if (nextLevelIndex >= TOTAL_LEVELS) {
        return { ...state, phase: "won", questionsCorrect };
      }
      return {
        ...state,
        levelIndex: nextLevelIndex,
        selected: null,
        locked: false,
        revealed: false,
        hiddenOptions: [],
        audiencePoll: null,
        questionsCorrect,
      };
    }
    case "MARK_WRONG":
      return state.revealed ? { ...state, phase: "lost" } : state;
    case "END_EARLY":
      return state.locked ? state : { ...state, phase: "ended-early" };
    case "USE_FIFTY_FIFTY": {
      if (state.lifelinesUsed.fiftyFifty || state.locked) return state;
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
      if (state.lifelinesUsed.audiencePoll || state.locked) return state;
      return {
        ...state,
        audiencePoll: generateAudiencePoll(currentQuestion(state).correctIndex, state.hiddenOptions),
        lifelinesUsed: { ...state.lifelinesUsed, audiencePoll: true },
      };
    }
    case "CLOSE_AUDIENCE_POLL":
      return { ...state, audiencePoll: null };
    case "USE_PHONE_A_FRIEND":
      if (state.lifelinesUsed.phoneAFriend || state.locked) return state;
      return {
        ...state,
        phoneAFriendOpen: true,
        lifelinesUsed: { ...state.lifelinesUsed, phoneAFriend: true },
      };
    case "CLOSE_PHONE_A_FRIEND":
      return { ...state, phoneAFriendOpen: false };
    case "USE_FLIP": {
      if (state.lifelinesUsed.flip || state.locked) return state;
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
        lifelinesUsed: { ...state.lifelinesUsed, flip: true },
      };
    }
    case "RESTART":
      return initialState();
    default:
      return state;
  }
}

export function KbcGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  if (state.phase === "start") return <StartScreen onStart={() => dispatch({ type: "START" })} />;
  if (state.phase === "won" || state.phase === "lost" || state.phase === "ended-early") {
    return (
      <EndScreen
        phase={state.phase}
        questionsCorrect={state.questionsCorrect}
        totalQuestions={TOTAL_LEVELS}
        correctAnswer={currentQuestion(state).options[currentQuestion(state).correctIndex]}
        showCorrectAnswer={state.phase === "lost"}
        onRestart={() => dispatch({ type: "RESTART" })}
      />
    );
  }

  const question = currentQuestion(state);

  return (
    <div className="flex min-h-screen flex-col text-slate-900">
      <AudiencePollDialog
        poll={state.audiencePoll}
        onClose={() => dispatch({ type: "CLOSE_AUDIENCE_POLL" })}
        hidden={state.hiddenOptions}
      />

      <PhoneAFriendDialog
        open={state.phoneAFriendOpen}
        onClose={() => dispatch({ type: "CLOSE_PHONE_A_FRIEND" })}
      />

      {/* Top bar */}
      <div className="flex items-center justify-center border-b border-slate-200 bg-white/70 backdrop-blur-sm px-3 py-3 min-[400px]:px-4">
        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
          <Trophy className="size-3.5 min-[380px]:size-4 text-blue-600" />
          <span className="text-xs min-[380px]:text-sm font-bold text-blue-700">
            Question {state.levelIndex + 1} of {TOTAL_LEVELS}
          </span>
        </div>
      </div>

      {/* Main play area */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-3 py-6 min-[400px]:px-5 min-[400px]:gap-6">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 min-[400px]:p-6 shadow-sm">
          <p className="text-center text-base min-[380px]:text-lg min-[480px]:text-xl font-bold leading-snug text-slate-900">
            {question.question}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 min-[400px]:gap-3">
          {state.optionOrder.map((index, displaySlot) => {
            const option = question.options[index];
            const isHidden = state.hiddenOptions.includes(index);
            const isSelected = state.selected === index;
            const isCorrect = index === question.correctIndex;

            let toneClasses = "border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50";
            if (isHidden) {
              toneClasses = "border-slate-100 bg-slate-50 text-slate-300";
            } else if (state.revealed) {
              if (isCorrect) toneClasses = "border-emerald-400 bg-emerald-50 text-emerald-700";
              else if (isSelected) toneClasses = "border-red-400 bg-red-50 text-red-700";
              else toneClasses = "border-slate-200 bg-slate-50 text-slate-400";
            } else if (state.locked && isSelected) {
              toneClasses = "border-blue-500 bg-blue-50 text-blue-700 animate-quiz-selected-blink";
            } else if (isSelected) {
              toneClasses = "border-blue-500 bg-blue-50 text-blue-700";
            }

            return (
              <button
                key={`${state.levelIndex}-${index}`}
                type="button"
                disabled={isHidden || state.locked}
                onClick={() => dispatch({ type: "SELECT", index })}
                style={{ animationDelay: `${displaySlot * 90}ms` }}
                className={cn(
                  "animate-quiz-answer-flip-in flex items-center gap-2.5 min-[400px]:gap-3 rounded-xl border px-3 py-3 min-[400px]:px-4 min-[400px]:py-3.5 text-left text-sm min-[380px]:text-base font-semibold transition-colors disabled:cursor-not-allowed",
                  toneClasses,
                )}
              >
                <span className="flex size-6 min-[400px]:size-7 shrink-0 items-center justify-center rounded-full border border-current/40 text-xs min-[400px]:text-sm font-black">
                  {OPTION_LABELS[displaySlot]}
                </span>
                <span className={cn("min-w-0 break-words", isHidden && "line-through")}>{option}</span>
                {state.revealed && isCorrect ? <Check className="ml-auto size-4 shrink-0" /> : null}
                {state.revealed && isSelected && !isCorrect ? <X className="ml-auto size-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>

        {/* Lifelines */}
        <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-2 min-[400px]:gap-3">
          <LifelineButton
            icon={<span className="text-sm min-[400px]:text-base font-black">50:50</span>}
            label="Fifty-Fifty"
            used={state.lifelinesUsed.fiftyFifty}
            disabled={state.lifelinesUsed.fiftyFifty || state.locked}
            onClick={() => dispatch({ type: "USE_FIFTY_FIFTY" })}
          />
          <LifelineButton
            icon={<Users className="size-4" />}
            label="Audience Poll"
            used={state.lifelinesUsed.audiencePoll}
            disabled={state.lifelinesUsed.audiencePoll || state.locked}
            onClick={() => dispatch({ type: "USE_AUDIENCE_POLL" })}
          />
          <LifelineButton
            icon={<Phone className="size-4" />}
            label="Phone a Friend"
            used={state.lifelinesUsed.phoneAFriend}
            disabled={state.lifelinesUsed.phoneAFriend || state.locked}
            onClick={() => dispatch({ type: "USE_PHONE_A_FRIEND" })}
          />
          <LifelineButton
            icon={<Shuffle className="size-4" />}
            label="Flip Question"
            used={state.lifelinesUsed.flip}
            disabled={state.lifelinesUsed.flip || state.locked}
            onClick={() => dispatch({ type: "USE_FLIP" })}
          />
        </div>

        {/* Host controls */}
        <div className="flex flex-col gap-2.5 min-[400px]:gap-3 pt-1">
          {!state.locked ? (
            <div className="flex flex-col min-[400px]:flex-row gap-2.5 min-[400px]:gap-3">
              <Button
                size="lg"
                disabled={state.selected === null}
                onClick={() => dispatch({ type: "LOCK" })}
                className="min-[400px]:flex-1 h-11 min-[400px]:h-12 rounded-full text-sm min-[400px]:text-base font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md"
              >
                <Lock className="size-4" /> Lock Answer
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => dispatch({ type: "END_EARLY" })}
                className="min-[400px]:flex-none h-11 min-[400px]:h-12 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 gap-2"
              >
                <DoorOpen className="size-4" /> End Game
              </Button>
            </div>
          ) : !state.revealed ? (
            <Button
              size="lg"
              onClick={() => dispatch({ type: "REVEAL" })}
              className="h-11 min-[400px]:h-12 rounded-full text-sm min-[400px]:text-base font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md"
            >
              <Eye className="size-4" /> Reveal Answer
            </Button>
          ) : (
            <div className="flex flex-col min-[400px]:flex-row gap-2.5 min-[400px]:gap-3">
              <Button
                size="lg"
                onClick={() => {
                  playSound(SFX.correct);
                  dispatch({ type: "MARK_CORRECT" });
                }}
                className="min-[400px]:flex-1 h-11 min-[400px]:h-12 rounded-full text-sm min-[400px]:text-base font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Check className="size-4" /> Correct — Next
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  playSound(SFX.wrong);
                  dispatch({ type: "MARK_WRONG" });
                }}
                className="min-[400px]:flex-1 h-11 min-[400px]:h-12 rounded-full text-sm min-[400px]:text-base font-bold gap-2 bg-red-600 hover:bg-red-500 text-white"
              >
                <X className="size-4" /> Wrong — End Game
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LifelineButton({
  icon,
  label,
  used,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  used: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl border px-1.5 py-2 min-[400px]:px-2 min-[400px]:py-2.5 text-center transition-colors",
        used
          ? "border-slate-100 bg-slate-50 text-slate-300"
          : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white",
      )}
    >
      {icon}
      <span className="text-[9px] min-[380px]:text-[10px] min-[480px]:text-xs font-semibold leading-tight">
        {label}
      </span>
    </button>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center text-slate-900">
      <span className="mb-3 text-[10px] min-[380px]:text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
        YCC Presents
      </span>
      <h1 className="mb-4 text-3xl min-[380px]:text-4xl min-[480px]:text-5xl font-black uppercase tracking-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Quiz Champion
        </span>
      </h1>
      <p className="mb-8 max-w-sm text-xs min-[380px]:text-sm text-slate-600 leading-relaxed">
        {TOTAL_LEVELS} questions — cricket trivia, general knowledge, and riddles — plus 4
        lifelines. One host reads each question aloud and taps through the game
        live — no phones, no logins, no scores kept by the app. Prizes are
        entirely up to the host.
      </p>
      <div className="mb-8 w-full max-w-xs rounded-2xl border border-slate-200/60 bg-white p-4 text-left text-xs min-[380px]:text-sm text-slate-600 shadow-sm space-y-1.5">
        <p className="font-bold text-slate-900 mb-1.5">For the host:</p>
        <p>1. Read the question aloud, let them pick an option.</p>
        <p>2. Tap Lock Answer, then Reveal.</p>
        <p>3. Mark Correct or Wrong yourself — you call it.</p>
      </div>
      <Button
        size="lg"
        onClick={onStart}
        className="h-12 min-[400px]:h-14 rounded-full px-8 min-[400px]:px-10 text-base min-[400px]:text-lg font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg"
      >
        <Trophy className="size-5" /> Start Game
      </Button>
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
}: {
  phase: "won" | "lost" | "ended-early";
  questionsCorrect: number;
  totalQuestions: number;
  correctAnswer: string;
  showCorrectAnswer: boolean;
  onRestart: () => void;
}) {
  useEffect(() => {
    if (phase === "won") playSound(SFX.applause);
  }, [phase]);

  const heading =
    phase === "won" ? "🎉 Champion!" : phase === "ended-early" ? "👋 Game Ended" : "Game Over";
  const message =
    phase === "won"
      ? `Answered all ${totalQuestions} questions correctly!`
      : phase === "ended-early"
        ? `Ended after ${questionsCorrect} question${questionsCorrect === 1 ? "" : "s"} answered correctly.`
        : `That one was wrong — got ${questionsCorrect} question${questionsCorrect === 1 ? "" : "s"} correct.`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center text-slate-900">
      <h1 className="mb-3 text-3xl min-[400px]:text-4xl font-black">{heading}</h1>
      <p className="mb-2 max-w-sm text-sm min-[380px]:text-base text-slate-600">{message}</p>
      {showCorrectAnswer ? (
        <p className="mb-6 max-w-sm text-xs min-[380px]:text-sm text-emerald-600">
          Correct answer: <span className="font-bold">{correctAnswer}</span>
        </p>
      ) : (
        <div className="mb-6" />
      )}
      <Button
        size="lg"
        onClick={onRestart}
        className="h-11 min-[400px]:h-12 rounded-full px-6 min-[400px]:px-8 text-sm min-[400px]:text-base font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg"
      >
        <RotateCcw className="size-4" /> Play Again
      </Button>
    </div>
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
    <Dialog open={poll !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Audience Poll Results</DialogTitle>
        </DialogHeader>
        {/* Only mounted while showing results, so the bar-grow transition
            below re-triggers fresh every time (see PhoneAFriendTimer for
            the same "conditional mount instead of reset effect" pattern). */}
        {poll ? <AudiencePollBars poll={poll} hidden={hidden} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function AudiencePollBars({ poll, hidden }: { poll: number[]; hidden: number[] }) {
  // Bars start at a small height and transition up to their final value a
  // beat after mount — a CSS-only stand-in for the reference repo's
  // Framer Motion "bars growing live" effect (App uses framer-motion;
  // we don't have that dependency here, so this reproduces the same feel
  // with a plain CSS transition).
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="grid grid-cols-4 items-end justify-items-center gap-2 py-2 h-40">
      {poll.map((percent, index) =>
        hidden.includes(index) ? (
          <div key={index} />
        ) : (
          <div key={index} className="flex h-full w-full flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold text-slate-600">{percent}%</span>
            <div className="w-6 min-[400px]:w-8 flex-1 flex items-end overflow-hidden rounded-t-md bg-slate-100">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-500 transition-[height] duration-1000 ease-out"
                style={{ height: grown ? `${percent}%` : "4%" }}
              />
            </div>
            <span className="text-sm font-black text-slate-900">{OPTION_LABELS[index]}</span>
          </div>
        ),
      )}
    </div>
  );
}

function PhoneAFriendDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Phone a Friend</DialogTitle>
          <DialogDescription>
            Let them call their friend now. Start the timer the moment the call connects —
            they have 60 seconds to talk before it ends.
          </DialogDescription>
        </DialogHeader>
        {/* Only mounted while the dialog is open, so every fresh call starts
            its own clean timer state without needing a reset effect. */}
        {open ? <PhoneAFriendTimer /> : null}
      </DialogContent>
    </Dialog>
  );
}

function PhoneAFriendTimer() {
  const [secondsLeft, setSecondsLeft] = useState(PHONE_A_FRIEND_SECONDS);
  const [running, setRunning] = useState(false);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, secondsLeft]);

  const timeUp = running && secondsLeft <= 0;

  useEffect(() => {
    if (running && !timeUp) {
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
  }, [running, timeUp]);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className={cn(
          "flex size-28 items-center justify-center rounded-full border-4 text-4xl font-black tabular-nums",
          timeUp ? "border-red-400 bg-red-50 text-red-600" : "border-blue-200 bg-blue-50 text-blue-700",
        )}
      >
        0:{secondsLeft.toString().padStart(2, "0")}
      </div>
      {timeUp ? (
        <p className="text-sm font-bold text-red-600">Time&apos;s up — end the call now!</p>
      ) : !running ? (
        <Button
          size="lg"
          onClick={() => setRunning(true)}
          className="h-11 rounded-full px-6 text-sm font-bold gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500"
        >
          <Phone className="size-4" /> Start Timer
        </Button>
      ) : (
        <p className="text-sm text-slate-500">Call in progress…</p>
      )}
    </div>
  );
}
