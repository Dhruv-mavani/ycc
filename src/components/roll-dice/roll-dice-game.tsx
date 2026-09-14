"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Confetti from "react-confetti";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickTrain, playNotes, type ActiveSound } from "@/lib/synth-sfx";
import { TeamPlayerGate, type GameTeamSelection } from "@/components/games/team-player-gate";

// ---------------------------------------------------------------------------
// Roll a Dice — a solo, self-serve dice game (/roll-a-dice). The player
// picks a total from 2 to 12 (the real range of two six-sided dice — a
// single die can never show 0, so the lowest possible total is 1+1=2), then
// rolls: a hand flicks the dice into motion, and two independently
// animated 3D cubes tumble through real rotateX/rotateY space before
// settling on their landed faces. Match the total shown = win.
//
// Win odds are deliberately real, if vanishingly tiny — same convention as
// the sibling games (see mystery-box-game.tsx, spin-wheel-game.tsx):
// landing on the player's own picked total is an explicit 0.0000000001%
// (1-in-1,000,000,000,000) draw, not the "naturally" uneven distribution
// real 2d6 combinatorics would give (a true roll makes 7 far likelier than
// 2 or 12 — deliberately not modeled here, so every pickable total gets
// the exact same odds). Losing totals are drawn uniformly from the other
// ten. There is no real prize — same "just for fun" flavor throughout.
//
// The 3D dice: each cube is a plain CSS 3D transform (six faces placed via
// translateZ + a 90°-aligned rotateX/rotateY, `transform-style:
// preserve-3d`), not a canvas/WebGL library — six real DOM faces with pip
// layouts, exactly like a physical die, so "landing" on a value is just
// rotating the whole cube to bring that already-fixed face to the front.
// The tumble is a runtime-computed rotateX/rotateY transition (several
// extra full turns per axis + the landing correction), set inline and
// animated via CSS transition — the exact same technique Spin the Wheel
// uses for its wheel rotation (see rotationFor/EXTRA_SPINS there): the
// transition is always present so flipping the target rotation animates
// reliably against an already-painted identity transform, no rAF
// paint-sync needed. A short hand-emoji "throw" keyframe (globals.css)
// plays first, then the dice pop to full size and tumble.
//
// Sound effects are synthesized (src/lib/synth-sfx.ts) — a woodier, more
// percussive click train than Mystery Box's rattle or Spin the Wheel's
// ratchet, giving this game its own third distinct identity.
// ---------------------------------------------------------------------------

const MIN_SUM = 2;
const MAX_SUM = 12;
const SUM_COUNT = MAX_SUM - MIN_SUM + 1; // 11 pickable totals

const PICKED_WIN_CHANCE = 0.000000000001; // 0.0000000001% — dice land on the player's own total

const DIE_SIZE = 76; // px cube edge
const HALF = DIE_SIZE / 2;

const HAND_MS = 550; // hand-throw flourish before the dice start tumbling
const SPIN_MS = 2600; // must match the transition duration set on each die
const READ_MS = 700; // pause on the landed faces before the result screen

// Each die spins a different number of extra full turns per axis — purely
// cosmetic (see the header comment on drawSum/facesForSum: multiples of
// 360° never change which face ends up at the front), just so the two
// dice don't tumble in lockstep.
const DIE_EXTRA_TURNS = [
  { x: 3, y: 5 },
  { x: 4, y: 3 },
] as const;

const DICE_SFX = {
  // A woodier, more percussive click train than the sibling games' —
  // mimics dice clattering across a table, decelerating as they settle.
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

// Draws the total the dice land on. `picked` is the player's chosen total
// (2-12); matching it is an explicit PICKED_WIN_CHANCE draw, not the
// naturally uneven 2d6 distribution. Everything else falls back to a
// uniform pick among the other ten (losing) totals via a modular shift —
// the same "sample the others, skip picked" trick mystery-box-game.tsx
// uses, generalized to a range that doesn't start at 1.
function drawSum(picked: number): number {
  if (Math.random() < PICKED_WIN_CHANCE) return picked;
  const offset = 1 + Math.floor(Math.random() * (SUM_COUNT - 1)); // 1..10
  return MIN_SUM + ((picked - MIN_SUM + offset) % SUM_COUNT);
}

// Picks a real (die1, die2) face pair — each 1-6 — that sums to `sum`, so
// the two 3D dice always show faces that genuinely add up to the result
// (not just an abstract number). Several valid pairs exist for most sums;
// one is picked at random each round for visual variety.
function facesForSum(sum: number): [number, number] {
  const options: [number, number][] = [];
  for (let a = 1; a <= 6; a++) {
    const b = sum - a;
    if (b >= 1 && b <= 6) options.push([a, b]);
  }
  return options[Math.floor(Math.random() * options.length)];
}

type Phase = "start" | "pick" | "rolling" | "won" | "lost";

interface GameState {
  phase: Phase;
  picked: number | null;
  drawnSum: number | null;
  dieFaces: [number, number] | null;
}

type Action =
  | { type: "START" }
  | { type: "PICK"; n: number }
  | { type: "ROLL" }
  | { type: "SETTLE" }
  | { type: "RESTART" };

function initialState(): GameState {
  return { phase: "start", picked: null, drawnSum: null, dieFaces: null };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return { ...initialState(), phase: "pick" };
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
    case "RESTART":
      return { ...initialState(), phase: "pick" };
    default:
      return state;
  }
}

export function RollDiceGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [muted, setMuted] = useState(false);
  const [selection, setSelection] = useState<GameTeamSelection | null>(null);
  const selectionRef = useRef(selection);
  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Exactly one SFX in flight at a time — see the header comment on the
  // sibling games for why (a synthesized sound keeps playing on its own
  // schedule after React tears the component down, so this is held to be
  // cut the instant it's unwanted).
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

  // Reports the round's outcome once it settles. Guarded by a ref (not
  // state) so StrictMode's double-invoke and any re-render mid-phase can't
  // fire this twice for the same round; it re-arms on the next "pick".
  const recordedRef = useRef(false);
  useEffect(() => {
    if (state.phase === "pick") {
      recordedRef.current = false;
      return;
    }
    if (state.phase !== "won" && state.phase !== "lost") return;
    if (recordedRef.current) return;
    recordedRef.current = true;

    const sel = selectionRef.current;
    if (!sel) return;
    fetch("/api/games/record-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameSlug: "roll-a-dice",
        source: sel.source,
        teamRefId: sel.teamRefId,
        playerRefId: sel.playerRefId,
        result: state.phase,
        detail: { picked: state.picked, drawnSum: state.drawnSum, dieFaces: state.dieFaces },
      }),
    }).catch(() => {});
  }, [state.phase, state.picked, state.drawnSum, state.dieFaces]);

  function toggleMute() {
    setMuted((m) => {
      if (!m) stopSfx();
      return !m;
    });
  }

  const muteButton = (
    <button
      type="button"
      onClick={toggleMute}
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

  if (state.phase === "start") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        {muteButton}
        <div className="animate-mystery-box-glow absolute -z-10 size-52 rounded-full bg-emerald-400/30 blur-3xl sm:size-72" />
        <span className="text-5xl sm:text-6xl">🎲</span>
        <h1 className="mt-6 text-3xl font-black sm:text-4xl md:text-6xl">
          Roll a Dice
        </h1>
        <div className="mt-6 max-w-xl text-left text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
          <p className="mb-3 text-center text-base font-bold text-white sm:text-lg">
            How to Play
          </p>
          <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-emerald-300">
            <li>Choose any total from {MIN_SUM} to {MAX_SUM}.</li>
            <li>Roll two dice — watch them tumble through real 3D space.</li>
            <li>Match your total — win!</li>
          </ol>
        </div>

        <TeamPlayerGate onSelectionChange={setSelection} />

        <button
          type="button"
          disabled={!selection}
          onClick={() => dispatch({ type: "START" })}
          className={cn(
            "mt-8 rounded-xl px-8 py-2.5 text-lg font-bold shadow-xl transition-all duration-300 sm:px-10 sm:py-3 sm:text-xl md:text-2xl",
            selection
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-black shadow-emerald-500/20 hover:scale-105 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-emerald-500/40"
              : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40",
          )}
        >
          Play
        </button>
      </div>
    );
  }

  if (state.phase === "pick") {
    return (
      <div className="relative flex min-h-screen flex-col items-center px-4 py-14">
        {muteButton}
        <h1 className="mt-8 text-center text-xl font-black sm:mt-0 sm:text-2xl md:text-4xl">
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
        onClick={() => dispatch({ type: "RESTART" })}
        className="mt-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-2.5 text-base font-bold text-black shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-105 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-emerald-500/40 sm:px-8 sm:py-3 sm:text-xl"
      >
        <RotateCcw className="size-5" />
        Play again
      </button>
    </div>
  );
}

// Static, per-face placement of the six pip layouts inside a cube — face
// "1" sits at the front (identity rotation) when the cube isn't spun,
// exactly like a real die at rest. Opposite faces sum to 7 (1-6, 2-5,
// 3-4), the standard Western die layout.
const FACE_PLACEMENT: Record<number, string> = {
  1: `rotateY(0deg) translateZ(${HALF}px)`,
  2: `rotateY(90deg) translateZ(${HALF}px)`,
  3: `rotateX(90deg) translateZ(${HALF}px)`,
  4: `rotateX(-90deg) translateZ(${HALF}px)`,
  5: `rotateY(-90deg) translateZ(${HALF}px)`,
  6: `rotateY(180deg) translateZ(${HALF}px)`,
};

// Rotation to apply to the whole CUBE (not a face) to bring a given face's
// value to the front — the inverse of that face's own placement above.
// Only ever rotates a single axis per target value (values 1/2/5/6 via Y,
// 3/4 via X), so adding independent extra-360° spins to both axes for the
// tumble (see DIE_EXTRA_TURNS) never disturbs which face ends up landed —
// each axis's own multiple of 360° is a no-op on the final composed
// transform regardless of the other axis's value.
const LANDING_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

// Which of a 3x3 grid's 9 cells (row-major, 0-8) hold a visible pip, per
// face value — the standard dice-pip layout.
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

// One 3D die. `spinning` false = identity transform (face 1 resting at
// the front — no semantic meaning, just the pre-throw pose); true =
// several extra full turns per axis (DIE_EXTRA_TURNS) plus the landing
// correction for `value`, animated via the transition below. The
// transition is always present — flipping `spinning` only changes the
// target rotation, a change against an already-painted state the browser
// reliably animates, no rAF paint-sync needed (same technique as the
// wheel in spin-wheel-game.tsx).
function DieCube({
  value,
  spinning,
  extra,
}: {
  value: number;
  spinning: boolean;
  extra: { x: number; y: number };
}) {
  const landing = LANDING_ROTATION[value];
  const rotateX = spinning ? extra.x * 360 + landing.x : 0;
  const rotateY = spinning ? extra.y * 360 + landing.y : 0;

  return (
    <div style={{ width: DIE_SIZE, height: DIE_SIZE, perspective: 700 }}>
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
  );
}

// Mounts only while rolling, so `spinning` (has the throw released the
// dice yet?) is fresh false every round with no reset effect. Timeline — a
// hand-throw beat, then both cubes tumble, then a pause on the landed
// faces, then SETTLE — is driven entirely by timers in a mount-once
// effect; callers are reached through refs so that effect keeps empty deps
// (same pattern as SpinningBox/SpinningWheel in the sibling games).
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
  const [spinning, setSpinning] = useState(false);
  const onSettleRef = useRef(onSettle);
  const playRef = useRef(play);
  const stopSfxRef = useRef(stopSfx);
  useEffect(() => {
    onSettleRef.current = onSettle;
    playRef.current = play;
    stopSfxRef.current = stopSfx;
  });

  useEffect(() => {
    let settleTimer = 0;
    const throwTimer = window.setTimeout(() => {
      setSpinning(true);
      playRef.current("roll");
      settleTimer = window.setTimeout(() => onSettleRef.current(), SPIN_MS + READ_MS);
    }, HAND_MS);
    return () => {
      window.clearTimeout(throwTimer);
      window.clearTimeout(settleTimer);
      // Stop the roll tick if we leave mid-roll (settle -> result, or the
      // back link). On a normal settle the parent then plays win/lose.
      stopSfxRef.current();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      <div className="animate-mystery-box-glow absolute inset-0 -z-10 rounded-full bg-emerald-400/40 blur-2xl" />

      {/* Hand-throw flourish — plays once, then fades; the dice below start
          tumbling right as it releases. */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-4 text-6xl sm:-bottom-6 sm:text-7xl",
          !spinning && "animate-dice-hand-throw",
          spinning && "opacity-0",
        )}
      >
        🤚
      </div>

      <div className="flex gap-8 sm:gap-12" style={{ perspective: 900 }}>
        <DieCube value={dieFaces[0]} spinning={spinning} extra={DIE_EXTRA_TURNS[0]} />
        <DieCube value={dieFaces[1]} spinning={spinning} extra={DIE_EXTRA_TURNS[1]} />
      </div>
    </div>
  );
}

function ResultConfetti() {
  // Lazy init, not an effect — this only ever mounts client-side, after the
  // reducer moves to a terminal phase post-hydration, so `window` is present.
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
