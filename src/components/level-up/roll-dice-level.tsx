"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Confetti from "react-confetti";
import { Trophy, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickTrain, playNotes, type ActiveSound } from "@/lib/synth-sfx";
import type { GameTeamSelection } from "@/components/games/team-player-gate";

// ---------------------------------------------------------------------------
// Level 2 of Level Up (/level-up) — Roll a Dice, adapted from the former
// standalone /roll-a-dice game (same mechanics, odds, 3D dice and sound) to
// run as the second level of the flow instead of its own page: `selection`
// comes from the parent (resolved once, before Level 1), mute is lifted to
// the parent, and there's no "start"/gate phase — this mounts straight into
// "pick". On win or lose it calls `onDone` — the parent then shows the
// two-level summary screen. See spin-wheel-level.tsx for Level 1.
//
// The roll itself is two stages, not one: "shuffle" (hand + both dice, held
// small and offset near the hand, shake together on the identical
// dice-shuffle keyframe — same relative motion on every element, so they
// visibly move as one unit) then "throw" (the hand flings/fades via its own
// keyframe while each die's position wrapper transitions, CSS transition
// not keyframe, from its hand offset back to its resting spot — "flying
// out of the hand" — as its inner cube starts the rotateX/rotateY tumble).
// Three nested elements per die keep this composable: a position wrapper
// (transition-driven hand->rest), a jitter wrapper (the shuffle keyframe),
// and the 3D cube itself (the tumble) — see DieCube below for why a
// keyframe and a differing per-die inline transform can't safely share one
// element (the animation would just override the inline value outright).
// ---------------------------------------------------------------------------

const MIN_SUM = 2;
const MAX_SUM = 12;
const SUM_COUNT = MAX_SUM - MIN_SUM + 1;

const PICKED_WIN_CHANCE = 0.000000000001;

const DIE_SIZE = 76;
const HALF = DIE_SIZE / 2;

const SHUFFLE_MS = 640; // hand+dice shake together before the throw — must match the dice-shuffle keyframe's total duration (globals.css)
const SPIN_MS = 2600; // dice tumble duration, after the throw releases them
const READ_MS = 700; // pause on the landed faces before the result screen

const DIE_EXTRA_TURNS = [
  { x: 3, y: 5 },
  { x: 4, y: 3 },
] as const;

// Where each die sits during the shuffle — offset + tilted + shrunk toward
// a shared point just above the hand emoji, so both dice visibly sit
// "in" the hand while it shakes them, then transition back to their
// resting flex-row spot (translate 0, scale 1) the instant the throw
// releases them. Chosen to roughly converge at the hand's position
// regardless of viewport width — not pixel-exact (the dice row's real gap
// is responsive), just close enough to read as "held together".
const DIE_HAND_OFFSET = [
  { x: 46, y: 34, rotate: -12 },
  { x: -46, y: 34, rotate: 14 },
] as const;

const DICE_SFX = {
  roll: (): ActiveSound =>
    playClickTrain({
      count: 26,
      startGap: 0.05,
      endGap: 0.32,
      freq: 900,
      dur: 0.035,
      type: "triangle",
      gain: 0.16,
    }),
  win: (): ActiveSound =>
    playNotes([
      { freq: 440.0, start: 0, dur: 0.12, type: "square", gain: 0.22 },
      { freq: 554.37, start: 0.1, dur: 0.12, type: "square", gain: 0.22 },
      { freq: 659.25, start: 0.2, dur: 0.12, type: "square", gain: 0.22 },
      { freq: 880.0, start: 0.32, dur: 0.32, type: "square", gain: 0.28 },
    ]),
  lose: (): ActiveSound =>
    playNotes([
      { freq: 220.0, start: 0, dur: 0.22, type: "sine", gain: 0.16 },
      { freq: 174.61, start: 0.18, dur: 0.32, type: "sine", gain: 0.14 },
    ]),
};

function drawSum(picked: number): number {
  if (Math.random() < PICKED_WIN_CHANCE) return picked;
  const offset = 1 + Math.floor(Math.random() * (SUM_COUNT - 1));
  return MIN_SUM + ((picked - MIN_SUM + offset) % SUM_COUNT);
}

function facesForSum(sum: number): [number, number] {
  const options: [number, number][] = [];
  for (let a = 1; a <= 6; a++) {
    const b = sum - a;
    if (b >= 1 && b <= 6) options.push([a, b]);
  }
  return options[Math.floor(Math.random() * options.length)];
}

type Phase = "pick" | "rolling" | "won" | "lost";

interface GameState {
  phase: Phase;
  picked: number | null;
  drawnSum: number | null;
  dieFaces: [number, number] | null;
}

type Action = { type: "PICK"; n: number } | { type: "ROLL" } | { type: "SETTLE" };

function initialState(): GameState {
  return { phase: "pick", picked: null, drawnSum: null, dieFaces: null };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "PICK":
      return state.phase === "pick" ? { ...state, picked: action.n } : state;
    case "ROLL": {
      if (state.phase !== "pick" || state.picked === null) return state;
      const drawnSum = drawSum(state.picked);
      return { ...state, phase: "rolling", drawnSum, dieFaces: facesForSum(drawnSum) };
    }
    case "SETTLE":
      if (state.phase !== "rolling" || state.drawnSum === null) return state;
      return { ...state, phase: state.picked === state.drawnSum ? "won" : "lost" };
    default:
      return state;
  }
}

export function RollDiceLevel({
  selection,
  muted,
  onToggleMute,
  onDone,
}: {
  selection: GameTeamSelection;
  muted: boolean;
  onToggleMute: () => void;
  onDone: (result: "won" | "lost") => void;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const sfxRef = useRef<ActiveSound | null>(null);
  const stopSfx = useCallback(() => {
    sfxRef.current?.stop();
    sfxRef.current = null;
  }, []);
  const play = useCallback(
    (kind: keyof typeof DICE_SFX) => {
      stopSfx();
      if (mutedRef.current) return;
      sfxRef.current = DICE_SFX[kind]();
    },
    [stopSfx],
  );
  useEffect(() => stopSfx, [stopSfx]);

  useEffect(() => {
    if (state.phase !== "won" && state.phase !== "lost") return;
    play(state.phase === "won" ? "win" : "lose");
    try {
      navigator.vibrate?.(state.phase === "won" ? [60, 40, 60, 40, 120] : [50]);
    } catch {
      // Nice-to-have only — never worth failing the round over.
    }
  }, [state.phase, play]);

  // Reports Level 2's outcome once it settles. Guarded by a ref (not
  // state) so StrictMode's double-invoke can't fire this twice.
  const recordedRef = useRef(false);
  useEffect(() => {
    if (state.phase !== "won" && state.phase !== "lost") return;
    if (recordedRef.current) return;
    recordedRef.current = true;

    fetch("/api/games/record-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameSlug: "roll-a-dice",
        source: selection.source,
        teamRefId: selection.teamRefId,
        playerRefId: selection.playerRefId,
        result: state.phase,
        detail: { picked: state.picked, drawnSum: state.drawnSum, dieFaces: state.dieFaces },
      }),
    }).catch(() => {});
  }, [state.phase, state.picked, state.drawnSum, state.dieFaces, selection]);

  const muteButton = (
    <button
      type="button"
      onClick={onToggleMute}
      aria-label={muted ? "Unmute" : "Mute"}
      className="absolute right-4 top-4 z-10 text-white/70 hover:text-white"
    >
      {muted ? (
        <VolumeX className="size-7 md:size-8" />
      ) : (
        <Volume2 className="size-7 md:size-8" />
      )}
    </button>
  );

  if (state.phase === "pick") {
    return (
      <div className="relative flex min-h-screen flex-col items-center px-4 py-14">
        {muteButton}
        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-emerald-300 sm:mt-0">
          Level 2 of 2
        </p>
        <h1 className="mt-2 text-center text-xl font-black sm:text-2xl md:text-4xl">
          Pick your total
        </h1>
        <p className="mt-2 text-center text-xs text-white/70 sm:text-sm md:text-base">
          {state.picked === null
            ? `Choose any total from ${MIN_SUM} to ${MAX_SUM}.`
            : `You picked ${state.picked}. Roll when you're ready.`}
        </p>

        <div className="mt-8 grid w-full max-w-md grid-cols-4 gap-2 sm:grid-cols-6">
          {Array.from({ length: SUM_COUNT }, (_, i) => MIN_SUM + i).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => dispatch({ type: "PICK", n })}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border text-base font-bold transition-all duration-300 sm:text-lg",
                state.picked === n
                  ? "scale-110 border-emerald-300 bg-gradient-to-br from-emerald-300 to-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.55)] z-10"
                  : "border-white/10 bg-white/5 text-white backdrop-blur-sm hover:scale-110 hover:border-white/30 hover:bg-white/20 hover:shadow-lg z-0",
              )}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={state.picked === null}
          onClick={() => dispatch({ type: "ROLL" })}
          className={cn(
            "mt-10 rounded-xl px-6 py-2.5 text-base font-bold shadow-lg transition-all duration-300 sm:px-10 sm:py-3 sm:text-xl md:text-2xl",
            state.picked === null
              ? "cursor-not-allowed bg-white/5 border border-white/10 text-white/40"
              : "bg-gradient-to-r from-emerald-400 to-emerald-500 text-black shadow-xl shadow-emerald-500/20 hover:scale-105 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-emerald-500/40 border border-transparent",
          )}
        >
          Roll the Dice
        </button>
      </div>
    );
  }

  if (state.phase === "rolling") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        {muteButton}
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-300">
          Your total: {state.picked}
        </p>
        <p className="mb-10 text-lg font-medium text-white/80 md:text-xl">
          Rolling…
        </p>
        <RollingDice
          dieFaces={state.dieFaces ?? [1, 1]}
          play={play}
          stopSfx={stopSfx}
          onSettle={() => dispatch({ type: "SETTLE" })}
        />
      </div>
    );
  }

  const won = state.phase === "won";
  const [die1, die2] = state.dieFaces ?? [1, 1];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      {muteButton}
      {won ? <ResultConfetti /> : null}

      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
        Level 2 of 2
      </p>
      <div className="animate-mystery-box-pop text-6xl sm:text-7xl md:text-8xl">
        {won ? "🎉" : "🎲"}
      </div>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
        {won ? "You nailed it!" : "Not this time"}
      </h1>
      <p className="mt-4 max-w-sm text-sm text-white/80 sm:text-base md:text-lg">
        {won ? (
          <>
            The dice landed on{" "}
            <span className="font-bold text-emerald-300">
              {die1} + {die2} = {state.drawnSum}
            </span>{" "}
            — your exact total.
          </>
        ) : (
          <>
            You picked <span className="font-bold">{state.picked}</span>. The
            dice landed on{" "}
            <span className="font-bold text-emerald-300">
              {die1} + {die2} = {state.drawnSum}
            </span>
            .
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => onDone(state.phase as "won" | "lost")}
        className="mt-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-2.5 text-base font-bold text-black shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-105 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-emerald-500/40 sm:px-8 sm:py-3 sm:text-xl"
      >
        <Trophy className="size-5" />
        See Results
      </button>
    </div>
  );
}

const FACE_PLACEMENT: Record<number, string> = {
  1: `rotateY(0deg) translateZ(${HALF}px)`,
  2: `rotateY(90deg) translateZ(${HALF}px)`,
  3: `rotateX(90deg) translateZ(${HALF}px)`,
  4: `rotateX(-90deg) translateZ(${HALF}px)`,
  5: `rotateY(-90deg) translateZ(${HALF}px)`,
  6: `rotateY(180deg) translateZ(${HALF}px)`,
};

const LANDING_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DieFace({ value, transform }: { value: number; transform: string }) {
  const active = new Set(PIPS[value]);
  return (
    <div
      className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 rounded-xl border-2 border-slate-300 bg-white p-2 shadow-inner"
      style={{
        width: DIE_SIZE,
        height: DIE_SIZE,
        transform,
        backfaceVisibility: "hidden",
      }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="flex items-center justify-center">
          {active.has(i) ? (
            <span className="size-2.5 rounded-full bg-slate-900 sm:size-3" />
          ) : null}
        </span>
      ))}
    </div>
  );
}

// Three nested layers per die, so the shuffle jitter, the hand-to-rest
// throw, and the tumble never fight over the same element's transform:
//  1. (outer, in this function) position wrapper — transitions from the
//     hand offset to identity (0,0, full scale) the instant `spinning`
//     flips true. Never itself animated via keyframe.
//  2. jitter wrapper — the dice-shuffle keyframe lives here, as a small
//     position-agnostic wobble layered on top of whatever (1) placed it
//     at; composes cleanly since it's a different element.
//  3. (inner) the actual 3D cube — rotateX/rotateY tumble, unchanged.
function DieCube({
  value,
  spinning,
  shuffling,
  extra,
  handOffset,
}: {
  value: number;
  spinning: boolean;
  shuffling: boolean;
  extra: { x: number; y: number };
  handOffset: { x: number; y: number; rotate: number };
}) {
  const landing = LANDING_ROTATION[value];
  const rotateX = spinning ? extra.x * 360 + landing.x : 0;
  const rotateY = spinning ? extra.y * 360 + landing.y : 0;
  const positionTransform = spinning
    ? "translate(0px, 0px) rotate(0deg) scale(1)"
    : `translate(${handOffset.x}px, ${handOffset.y}px) rotate(${handOffset.rotate}deg) scale(0.55)`;

  return (
    <div
      style={{
        width: DIE_SIZE,
        height: DIE_SIZE,
        transform: positionTransform,
        transition: "transform 520ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className={cn(shuffling && "animate-dice-shuffle")}
        style={{ width: DIE_SIZE, height: DIE_SIZE, perspective: 700 }}
      >
        <div
          className="relative"
          style={{
            width: DIE_SIZE,
            height: DIE_SIZE,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: `transform ${SPIN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          {([1, 2, 3, 4, 5, 6] as const).map((v) => (
            <DieFace key={v} value={v} transform={FACE_PLACEMENT[v]} />
          ))}
        </div>
      </div>
    </div>
  );
}

type RollStage = "shuffle" | "throw";

function RollingDice({
  dieFaces,
  play,
  stopSfx,
  onSettle,
}: {
  dieFaces: [number, number];
  play: (kind: keyof typeof DICE_SFX) => void;
  stopSfx: () => void;
  onSettle: () => void;
}) {
  const [stage, setStage] = useState<RollStage>("shuffle");
  const onSettleRef = useRef(onSettle);
  const playRef = useRef(play);
  const stopSfxRef = useRef(stopSfx);
  useEffect(() => {
    onSettleRef.current = onSettle;
    playRef.current = play;
    stopSfxRef.current = stopSfx;
  });

  useEffect(() => {
    // Roll rattle starts immediately — the click train's own deceleration
    // (see DICE_SFX.roll) carries naturally across the shuffle and into
    // the tumble, so one sound covers "hand shaking dice" through "dice
    // hit the table".
    playRef.current("roll");
    const throwTimer = window.setTimeout(() => {
      setStage("throw");
    }, SHUFFLE_MS);
    const settleTimer = window.setTimeout(
      () => onSettleRef.current(),
      SHUFFLE_MS + SPIN_MS + READ_MS,
    );
    return () => {
      window.clearTimeout(throwTimer);
      window.clearTimeout(settleTimer);
      // Stop the roll tick if we leave mid-roll (settle -> result, or the
      // back link). On a normal settle the parent then plays win/lose.
      stopSfxRef.current();
    };
  }, []);

  const spinning = stage === "throw";
  const shuffling = stage === "shuffle";

  return (
    <div className="relative flex flex-col items-center">
      <div className="animate-mystery-box-glow absolute inset-0 -z-10 rounded-full bg-emerald-400/40 blur-2xl" />

      {/* Hand — shakes in place with the dice (same keyframe, so the
          motion visibly matches), then flings forward and fades the
          instant it releases them. */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-6 z-10 text-6xl sm:-bottom-8 sm:text-7xl",
          shuffling && "animate-dice-shuffle",
          spinning && "animate-dice-hand-throw",
        )}
      >
        🤚
      </div>

      <div className="flex gap-8 sm:gap-12" style={{ perspective: 900 }}>
        <DieCube
          value={dieFaces[0]}
          spinning={spinning}
          shuffling={shuffling}
          extra={DIE_EXTRA_TURNS[0]}
          handOffset={DIE_HAND_OFFSET[0]}
        />
        <DieCube
          value={dieFaces[1]}
          spinning={spinning}
          shuffling={shuffling}
          extra={DIE_EXTRA_TURNS[1]}
          handOffset={DIE_HAND_OFFSET[1]}
        />
      </div>
    </div>
  );
}

function ResultConfetti() {
  const [dimensions] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={260}
      recycle={false}
    />
  );
}
