"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Confetti from "react-confetti";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickTrain, playNotes, type ActiveSound } from "@/lib/synth-sfx";

// ---------------------------------------------------------------------------
// Spin the Wheel — a solo, self-serve prize-wheel game (/spin-wheel). The
// player picks a number from 1 to 10, then spins an 11-section wheel: ten
// sections hold the numbers 1-10, the eleventh holds "Goa Trip with Gang
// (free to all)". Two ways to win: the wheel lands on the player's own
// number, or it lands on the Goa Trip section.
//
// Win odds are deliberately real, if tiny: landing on the player's own
// number and landing on Goa Trip are each an explicit, independent 0.0001%
// (1-in-1,000,000) draw — set exactly, not simulated to look small while
// secretly being zero. The remaining ~99.9998% is spread evenly across the
// other nine number sections (whichever the player didn't pick), which are
// always losing outcomes for that spin. There is no real prize behind the
// Goa Trip section — it's flavor, same as the rest of this game family.
//
// Same lessons as the sibling games (see mystery-box-game.tsx):
//  - All spin timing is setTimeout, never requestAnimationFrame — rAF is
//    paused on a backgrounded tab, which would strand the wheel mid-spin.
//  - The wheel's CSS `transition` is always present so flipping its target
//    rotation animates reliably against an already-painted 0deg state,
//    with no rAF paint-sync needed.
//  - <SpinningWheel> mounts only while spinning, so its "has it started
//    turning" state is fresh every round with no reset effect.
//  - Exactly one sound effect is tracked and stopped on the next cue, on
//    mute, and on unmount, so a clip can't outlive the page.
//
// Sound effects are synthesized (src/lib/synth-sfx.ts), not audio files —
// a crisp ratchet-click spin, a fanfare win, and a gentle-descent loss, all
// distinct in pitch and timbre from Mystery Box's warmer box-rattle sounds.
// ---------------------------------------------------------------------------

const NUM_COUNT = 10;
const GOA_INDEX = 10; // the 11th section, index 10
// The Goa Trip section is deliberately much wider than the number sections —
// pure visual real estate for its label to be as big and legible as
// possible. Slice width has no bearing on odds (those are the explicit
// PICKED_WIN_CHANCE / GOA_WIN_CHANCE draws below); it's purely cosmetic.
const GOA_SLICE_DEG = 90;
const NUM_SLICE_DEG = (360 - GOA_SLICE_DEG) / NUM_COUNT;

const PICKED_WIN_CHANCE = 0.000001; // 0.0001% — lands on the player's own number
const GOA_WIN_CHANCE = 0.000001; // 0.0001% — lands on Goa Trip with Gang

const SPIN_MS = 4500; // must match the transition duration set on the wheel
const PRESPIN_MS = 300; // short beat between the click and the wheel moving
const READ_MS = 700; // pause on the landed section before the result screen
const EXTRA_SPINS = 6; // full rotations before the wheel settles

const SLICE_COLORS = [
  "#fb923c",
  "#0e7490",
  "#fb923c",
  "#0e7490",
  "#fb923c",
  "#0e7490",
  "#fb923c",
  "#0e7490",
  "#fb923c",
  "#0e7490",
  "#facc15",
] as const;

// Start/end angle of section i (clockwise from the top / 12 o'clock,
// matching conic-gradient's own "from 0deg" convention). Sections 0-9 are
// the equal-width number slices; section 10 (Goa Trip) takes the remaining,
// much wider, slice.
function sectionStart(index: number): number {
  return index < NUM_COUNT ? index * NUM_SLICE_DEG : NUM_COUNT * NUM_SLICE_DEG;
}
function sectionEnd(index: number): number {
  return index < NUM_COUNT ? (index + 1) * NUM_SLICE_DEG : 360;
}

function buildConicGradient(colors: readonly string[]): string {
  const stops = colors
    .map((c, i) => `${c} ${sectionStart(i).toFixed(4)}deg ${sectionEnd(i).toFixed(4)}deg`)
    .join(", ");
  return `conic-gradient(from 0deg, ${stops})`;
}
const WHEEL_BACKGROUND = buildConicGradient(SLICE_COLORS);

const WHEEL_SFX = {
  // A crisp ratchet-peg click train, roughly matching the spin's length and
  // decelerating with it.
  spin: (): ActiveSound =>
    playClickTrain({
      count: 36,
      startGap: 0.045,
      endGap: 0.34,
      freq: 1500,
      dur: 0.02,
      type: "square",
      gain: 0.12,
    }),
  // A short five-note fanfare, ending on a sustained high note.
  win: (): ActiveSound =>
    playNotes([
      { freq: 392.0, start: 0, dur: 0.12, type: "square", gain: 0.18 },
      { freq: 523.25, start: 0.1, dur: 0.12, type: "square", gain: 0.18 },
      { freq: 659.25, start: 0.2, dur: 0.12, type: "square", gain: 0.18 },
      { freq: 783.99, start: 0.3, dur: 0.12, type: "square", gain: 0.18 },
      { freq: 1046.5, start: 0.42, dur: 0.35, type: "square", gain: 0.26 },
    ]),
  // A gentle two-note descent — same shape as Mystery Box's loss cue but a
  // different interval and a slower fade, so it doesn't sound identical.
  lose: (): ActiveSound =>
    playNotes([
      { freq: 246.94, start: 0, dur: 0.24, type: "sine", gain: 0.17 },
      { freq: 196.0, start: 0.2, dur: 0.38, type: "sine", gain: 0.15 },
    ]),
};

// Center angle of section i, measured clockwise from the top (matches the
// conic-gradient's own "from 0deg" convention, i.e. 0 = top = 12 o'clock).
function sectionCenterAngle(index: number): number {
  return (sectionStart(index) + sectionEnd(index)) / 2;
}

// Total clockwise rotation so section `index`'s center ends up under the
// fixed pointer at the top, after `spins` extra full turns for effect.
function rotationFor(index: number, spins: number): number {
  const base = (360 - sectionCenterAngle(index)) % 360;
  return spins * 360 + base;
}

// Draws which section the wheel lands on for this spin. `picked` is the
// player's chosen number (1-10). Both win paths are explicit, independent
// draws at PICKED_WIN_CHANCE / GOA_WIN_CHANCE; everything else falls back to
// a uniform pick among the other nine (losing) number sections.
function drawSection(picked: number): number {
  const pickedIndex = picked - 1;
  const r = Math.random();
  if (r < PICKED_WIN_CHANCE) return pickedIndex;
  if (r < PICKED_WIN_CHANCE + GOA_WIN_CHANCE) return GOA_INDEX;
  const losingIndexes = Array.from({ length: NUM_COUNT }, (_, i) => i).filter(
    (i) => i !== pickedIndex,
  );
  return losingIndexes[Math.floor(Math.random() * losingIndexes.length)];
}

type Phase = "start" | "pick" | "spinning" | "won" | "lost";

interface GameState {
  phase: Phase;
  picked: number | null;
  landedIndex: number | null;
}

type Action =
  | { type: "START" }
  | { type: "PICK"; n: number }
  | { type: "OPEN" }
  | { type: "SETTLE" }
  | { type: "RESTART" };

function initialState(): GameState {
  return { phase: "start", picked: null, landedIndex: null };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return { ...initialState(), phase: "pick" };
    case "PICK":
      return state.phase === "pick" ? { ...state, picked: action.n } : state;
    case "OPEN": {
      if (state.phase !== "pick" || state.picked === null) return state;
      return { ...state, phase: "spinning", landedIndex: drawSection(state.picked) };
    }
    case "SETTLE": {
      if (state.phase !== "spinning" || state.landedIndex === null || state.picked === null)
        return state;
      const won = state.landedIndex === GOA_INDEX || state.landedIndex === state.picked - 1;
      return { ...state, phase: won ? "won" : "lost" };
    }
    case "RESTART":
      return { ...initialState(), phase: "pick" };
    default:
      return state;
  }
}

export function SpinWheelGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Exactly one SFX in flight at a time — see the header comment.
  const sfxRef = useRef<ActiveSound | null>(null);
  const stopSfx = useCallback(() => {
    sfxRef.current?.stop();
    sfxRef.current = null;
  }, []);
  const play = useCallback(
    (kind: keyof typeof WHEEL_SFX) => {
      stopSfx();
      if (mutedRef.current) return;
      sfxRef.current = WHEEL_SFX[kind]();
    },
    [stopSfx],
  );
  useEffect(() => stopSfx, [stopSfx]);

  useEffect(() => {
    if (state.phase === "won") play("win");
    if (state.phase === "lost") play("lose");
  }, [state.phase, play]);

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
        <div className="animate-mystery-box-glow absolute -z-10 size-52 rounded-full bg-amber-400/30 blur-3xl sm:size-72" />
        <span className="text-5xl sm:text-6xl">🎡</span>
        <h1 className="mt-6 text-3xl font-black sm:text-4xl md:text-6xl">
          Spin the Wheel
        </h1>
        <div className="mt-6 max-w-xl text-left text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
          <p className="mb-3 text-center text-base font-bold text-white sm:text-lg">
            How to Play
          </p>
          <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-amber-300">
            <li>Choose any number from 1 to {NUM_COUNT}.</li>
            <li>
              Spin the wheel featuring {NUM_COUNT} numbered boxes + 1 GOA box.
            </li>
            <li>Hit your number or GOA — win a Goa Trip with Gang!</li>
          </ol>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "START" })}
          className="mt-10 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-2.5 text-lg font-bold text-black shadow-xl shadow-amber-500/20 transition-all duration-300 hover:scale-105 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40 sm:px-10 sm:py-3 sm:text-xl md:text-2xl"
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
          Pick your number
        </h1>
        <p className="mt-2 text-center text-xs text-white/70 sm:text-sm md:text-base">
          {state.picked === null
            ? `Choose any number from 1 to ${NUM_COUNT}.`
            : `You picked ${state.picked}. Spin when you're ready.`}
        </p>

        <div className="mt-8 grid w-full max-w-sm grid-cols-5 gap-2">
          {Array.from({ length: NUM_COUNT }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => dispatch({ type: "PICK", n })}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border text-base font-bold transition-all duration-300 sm:text-lg",
                state.picked === n
                  ? "scale-110 border-amber-300 bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.55)] z-10"
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
          onClick={() => dispatch({ type: "OPEN" })}
          className={cn(
            "mt-10 rounded-xl px-6 py-2.5 text-base font-bold shadow-lg transition-all duration-300 sm:px-10 sm:py-3 sm:text-xl md:text-2xl",
            state.picked === null
              ? "cursor-not-allowed bg-white/5 border border-white/10 text-white/40"
              : "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xl shadow-amber-500/20 hover:scale-105 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40 border border-transparent",
          )}
        >
          Spin the Wheel
        </button>
      </div>
    );
  }

  if (state.phase === "spinning") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        {muteButton}
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-300">
          Your number: {state.picked}
        </p>
        <p className="mb-10 text-lg font-medium text-white/80 md:text-xl">
          Spinning…
        </p>
        <SpinningWheel
          landedIndex={state.landedIndex ?? 0}
          play={play}
          stopSfx={stopSfx}
          onSettle={() => dispatch({ type: "SETTLE" })}
        />
      </div>
    );
  }

  const won = state.phase === "won";
  const wonViaGoa = won && state.landedIndex === GOA_INDEX;
  const landedLabel =
    state.landedIndex === GOA_INDEX
      ? "Goa Trip with Gang (free to all)"
      : String((state.landedIndex ?? 0) + 1);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      {muteButton}
      {won ? <ResultConfetti /> : null}

      <div className="animate-mystery-box-pop text-6xl sm:text-7xl md:text-8xl">
        {won ? (wonViaGoa ? "🏖️" : "🎉") : "🎡"}
      </div>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
        {won ? (wonViaGoa ? "Jackpot!" : "You nailed it!") : "Not this time"}
      </h1>
      <p className="mt-4 max-w-sm text-sm text-white/80 sm:text-base md:text-lg">
        {won ? (
          wonViaGoa ? (
            <>
              The wheel landed on{" "}
              <span className="font-bold text-amber-300">
                Goa Trip with Gang (free to all)
              </span>{" "}
              — just for fun, no real trip, but what a spin.
            </>
          ) : (
            <>
              The wheel landed on{" "}
              <span className="font-bold text-amber-300">{state.picked}</span> — your
              exact number.
            </>
          )
        ) : (
          <>
            You picked <span className="font-bold">{state.picked}</span>. The wheel
            landed on <span className="font-bold text-amber-300">{landedLabel}</span>.
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => dispatch({ type: "RESTART" })}
        className="mt-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 text-base font-bold text-black shadow-xl shadow-amber-500/20 transition-all duration-300 hover:scale-105 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40 sm:px-8 sm:py-3 sm:text-xl"
      >
        <RotateCcw className="size-5" />
        Play again
      </button>
    </div>
  );
}

// Mounts only while spinning, so `spinning` (has the wheel started turning?)
// is fresh false every round with no reset effect. The timeline — a short
// beat, then the spin, then a pause on the landed section, then SETTLE — is
// driven entirely by timers in a mount-once effect; callers are reached
// through refs so that effect keeps empty deps.
function SpinningWheel({
  landedIndex,
  play,
  stopSfx,
  onSettle,
}: {
  landedIndex: number;
  play: (kind: keyof typeof WHEEL_SFX) => void;
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
    const startTimer = window.setTimeout(() => {
      setSpinning(true);
      playRef.current("spin");
      settleTimer = window.setTimeout(() => onSettleRef.current(), SPIN_MS + READ_MS);
    }, PRESPIN_MS);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(settleTimer);
      // Stop the spin tick if we leave mid-spin (settle -> result, or the
      // back link). On a normal settle the parent then plays win/lose.
      stopSfxRef.current();
    };
  }, []);

  const rotationDeg = spinning ? rotationFor(landedIndex, EXTRA_SPINS) : 0;

  return (
    <div className="relative flex flex-col items-center">
      <div className="animate-mystery-box-glow absolute inset-0 -z-10 rounded-full bg-amber-400/40 blur-2xl" />

      {/* Pointer — fixed, does not rotate with the wheel. */}
      <div
        className="z-30 h-4 w-5 bg-white shadow-md sm:h-5 sm:w-6"
        style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
      />

      <div className="relative -mt-px size-56 rounded-full border-[6px] border-white/90 shadow-2xl sm:size-80">
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            // Transition is always present so flipping `spinning` only
            // changes the rotation value — a change against an
            // already-painted state, which the browser reliably animates
            // (no rAF paint-sync needed).
            className="absolute inset-0"
            style={{
              background: WHEEL_BACKGROUND,
              transform: `rotate(${rotationDeg}deg)`,
              transition: `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.67, 0.15, 1)`,
            }}
          >
            {SLICE_COLORS.map((_, i) => {
              const spokeRotation = sectionCenterAngle(i) - 90;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-0 w-1/2 origin-left"
                  style={{ transform: `rotate(${spokeRotation}deg)` }}
                >
                  <div className="absolute right-[8%] top-1/2 flex -translate-y-1/2 flex-col items-center leading-[0.85] whitespace-nowrap">
                    {i === GOA_INDEX ? (
                      <>
                        <span className="text-[12px] font-black text-slate-900 sm:text-[18px] tracking-tighter">
                          GOA TRIP
                        </span>
                        <span className="text-[11px] font-black text-slate-900 sm:text-[16px] tracking-tighter">
                          WITH GANG
                        </span>
                        <span className="text-[8px] font-black text-slate-900 sm:text-[12px] tracking-tighter">
                          (FREE TO ALL)
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-black text-white sm:text-xl">{i + 1}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 z-20 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow ring-4 ring-black/10 sm:size-10" />
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
