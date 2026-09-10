"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Confetti from "react-confetti";
import { Gift, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mystery Box — a solo, self-serve number-draw game (/mystry-box). The player
// picks a number from 1 to 50, then opens the box: it shakes, the lid flies
// off, and a slot-machine reel spins through numbers and decelerates onto the
// drawn one. Match = win (a flat 1-in-50), otherwise lose.
//
// Animations are plain CSS (keyframes in globals.css + a runtime-value
// translateY transition on the reel), not framer-motion — the same setup
// caveat the quiz games document (see solo-quiz-game.tsx): framer-motion's
// initial -> animate froze at the initial frame under Next 16 Turbopack +
// React 19 here, so CSS-only is the reliable path.
//
// The spin lives in its own <SpinningBox> that mounts only while the box is
// opening, so its "has the reel started moving" state starts fresh every
// round with no reset effect (which would trip react-hooks/set-state-in-effect).
//
// Audio files are copies of the ones the quiz games use, kept in this game's
// own folder (public/mystry-box/audio/) so it stays self-contained.
// ---------------------------------------------------------------------------

const MAX_NUMBER = 50;
const CELL_HEIGHT = 88; // px — one reel cell, and the box's viewing window
const REEL_LENGTH = 44; // cells the reel travels through before it lands
const SPIN_MS = 4200; // must match the transition duration set on the reel
const SHAKE_MS = 1000; // box shake before the lid comes off (2x the 0.5s keyframe)
const READ_MS = 650; // beat on the landed number before the result screen

const SFX = {
  spin: "/mystry-box/audio/spin.mp3",
  win: "/mystry-box/audio/win.mp3",
  lose: "/mystry-box/audio/lose.mp3",
};

function randomNumber() {
  return 1 + Math.floor(Math.random() * MAX_NUMBER);
}

function buildReel(landing: number): number[] {
  const reel: number[] = [];
  for (let i = 0; i < REEL_LENGTH - 1; i++) {
    let n = randomNumber();
    // Keep the cell right before the landing cell different, so the stop
    // reads as a stop rather than a stutter on the same number.
    if (i === REEL_LENGTH - 2 && n === landing) n = (n % MAX_NUMBER) + 1;
    reel.push(n);
  }
  reel.push(landing);
  return reel;
}

type Phase = "start" | "pick" | "spinning" | "won" | "lost";

interface GameState {
  phase: Phase;
  picked: number | null;
  drawn: number | null;
  reel: number[];
}

type Action =
  | { type: "START" }
  | { type: "PICK"; n: number }
  | { type: "OPEN" }
  | { type: "SETTLE" }
  | { type: "RESTART" };

function initialState(): GameState {
  return { phase: "start", picked: null, drawn: null, reel: [] };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return { ...initialState(), phase: "pick" };
    case "PICK":
      return state.phase === "pick" ? { ...state, picked: action.n } : state;
    case "OPEN": {
      if (state.phase !== "pick" || state.picked === null) return state;
      const drawn = randomNumber();
      return { ...state, phase: "spinning", drawn, reel: buildReel(drawn) };
    }
    case "SETTLE":
      if (state.phase !== "spinning") return state;
      return { ...state, phase: state.picked === state.drawn ? "won" : "lost" };
    case "RESTART":
      return { ...initialState(), phase: "pick" };
    default:
      return state;
  }
}

export function MysteryBoxGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Exactly one SFX is ever in flight (spin, then win/lose). Hold it so it can
  // be cut the instant it's unwanted — on the next cue, on mute, and above all
  // on unmount: `new Audio()` keeps playing after React tears the component
  // down, so without this the spin tick outlives the closed game.
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const stopSfx = useCallback(() => {
    const audio = sfxRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      sfxRef.current = null;
    }
  }, []);
  const play = useCallback(
    (src: string) => {
      stopSfx();
      if (mutedRef.current) return;
      const audio = new Audio(src);
      sfxRef.current = audio;
      audio.play().catch(() => {});
    },
    [stopSfx],
  );

  // Kill any lingering sound when the game unmounts (e.g. the back link).
  useEffect(() => stopSfx, [stopSfx]);

  useEffect(() => {
    if (state.phase === "won") play(SFX.win);
    if (state.phase === "lost") play(SFX.lose);
  }, [state.phase, play]);

  function toggleMute() {
    setMuted((m) => {
      if (!m) stopSfx(); // switching mute on — cut whatever's playing now
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
        <div className="animate-mystery-box-glow absolute -z-10 size-52 rounded-full bg-amber-400/40 blur-3xl sm:size-72" />
        <Gift className="size-14 text-amber-300 sm:size-16 md:size-20" />
        <h1 className="mt-6 text-3xl font-black sm:text-4xl md:text-6xl">
          Mystery Box
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
          Pick a number from 1 to {MAX_NUMBER}, then open the Mystery Box. It
          shakes, the lid flies off, and a reel spins through the numbers before
          it lands on one. Match your number and you win — a one-in-{MAX_NUMBER}{" "}
          shot. No login, no stakes, just luck.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: "START" })}
          className="mt-10 rounded-xl bg-amber-400 px-8 py-2.5 text-lg font-bold text-black shadow-lg transition-colors hover:bg-amber-300 sm:px-10 sm:py-3 sm:text-xl md:text-2xl"
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
            ? `Choose any number from 1 to ${MAX_NUMBER}.`
            : `You picked ${state.picked}. Open the box when you're ready.`}
        </p>

        <div className="mt-8 grid w-full max-w-xl grid-cols-6 gap-1 sm:grid-cols-10 sm:gap-2">
          {Array.from({ length: MAX_NUMBER }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => dispatch({ type: "PICK", n })}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border text-xs font-bold transition-all sm:text-base",
                state.picked === n
                  ? "scale-105 border-amber-300 bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.55)]"
                  : "border-white/10 bg-white/5 text-white hover:bg-white/15",
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
            "mt-10 rounded-xl px-6 py-2.5 text-base font-bold shadow-lg transition-colors sm:px-10 sm:py-3 sm:text-xl md:text-2xl",
            state.picked === null
              ? "cursor-not-allowed bg-white/10 text-white/40"
              : "bg-amber-400 text-black hover:bg-amber-300",
          )}
        >
          Open the Mystery Box
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
        <p className="mb-12 text-lg font-medium text-white/80 md:text-xl">
          Opening the box…
        </p>
        <SpinningBox
          reel={state.reel}
          play={play}
          stopSfx={stopSfx}
          onSettle={() => dispatch({ type: "SETTLE" })}
        />
      </div>
    );
  }

  const won = state.phase === "won";
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      {muteButton}
      {won ? <ResultConfetti /> : null}

      <div className="animate-mystery-box-pop text-6xl sm:text-7xl md:text-8xl">
        {won ? "🎉" : "📦"}
      </div>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
        {won ? "You nailed it!" : "Not this time"}
      </h1>
      <p className="mt-4 max-w-sm text-sm text-white/80 sm:text-base md:text-lg">
        {won ? (
          <>
            The box landed on{" "}
            <span className="font-bold text-amber-300">{state.drawn}</span> — your
            exact number.
          </>
        ) : (
          <>
            You picked <span className="font-bold">{state.picked}</span>. The box
            landed on{" "}
            <span className="font-bold text-amber-300">{state.drawn}</span>.
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => dispatch({ type: "RESTART" })}
        className="mt-10 flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-base font-bold text-black shadow-lg transition-colors hover:bg-amber-300 sm:px-8 sm:py-3 sm:text-xl"
      >
        <RotateCcw className="size-5" />
        Play again
      </button>
    </div>
  );
}

// Mounts only while the box is opening, so `reelMoving` (has the reel started
// its run?) is fresh false on every open with no reset effect needed. The
// timeline — shake, then reel travel, then SETTLE — is driven entirely from
// timers inside a mount-once effect; callers reach in via refs so the effect
// keeps empty deps.
function SpinningBox({
  reel,
  play,
  stopSfx,
  onSettle,
}: {
  reel: number[];
  play: (src: string) => void;
  stopSfx: () => void;
  onSettle: () => void;
}) {
  const [reelMoving, setReelMoving] = useState(false);
  const onSettleRef = useRef(onSettle);
  const playRef = useRef(play);
  const stopSfxRef = useRef(stopSfx);
  useEffect(() => {
    onSettleRef.current = onSettle;
    playRef.current = play;
    stopSfxRef.current = stopSfx;
  });

  useEffect(() => {
    // All timing is setTimeout-based, never requestAnimationFrame: rAF is
    // paused while the tab is backgrounded, which would strand the game on
    // "Opening the box…" forever. The reel has already painted at
    // translateY(0) throughout the shake, so flipping `reelMoving` now
    // transitions smoothly to its final offset without any rAF paint-sync.
    let settleTimer = 0;
    const shakeTimer = window.setTimeout(() => {
      setReelMoving(true);
      playRef.current(SFX.spin);
      settleTimer = window.setTimeout(
        () => onSettleRef.current(),
        SPIN_MS + READ_MS,
      );
    }, SHAKE_MS);
    return () => {
      window.clearTimeout(shakeTimer);
      window.clearTimeout(settleTimer);
      // Stop the spin tick if we leave mid-spin (settle -> result, or the
      // back link). On a normal settle the parent then plays win/lose.
      stopSfxRef.current();
    };
  }, []);

  const travel = (reel.length - 1) * CELL_HEIGHT;

  return (
    <div className={cn("relative", !reelMoving && "animate-mystery-box-shake")}>
      <div className="animate-mystery-box-glow absolute inset-0 -z-10 rounded-full bg-amber-400/50 blur-2xl" />

      {/* Lid — flies off once the reel starts moving. */}
      <div
        className={cn(
          "absolute -top-3 left-1/2 z-20 h-12 w-56 -translate-x-1/2 rounded-lg border-4 border-amber-800/50 bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg sm:h-14 sm:w-[17rem]",
          reelMoving && "animate-mystery-box-lid",
        )}
      >
        <div className="absolute left-1/2 top-1/2 h-3 w-24 -translate-x-1/2 -translate-y-1/2 rounded bg-amber-800/30" />
      </div>

      {/* Box body with the reel window cut into it. */}
      <div className="relative h-44 w-52 overflow-hidden rounded-xl border-4 border-amber-800/50 bg-gradient-to-b from-amber-500 to-amber-700 shadow-2xl sm:h-56 sm:w-64">
        <div className="absolute left-1/2 top-0 h-full w-6 -translate-x-1/2 bg-amber-800/25 sm:w-8" />
        <div className="absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 bg-amber-800/25 sm:h-8" />

        <div className="absolute left-1/2 top-1/2 h-[88px] w-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border-2 border-amber-200/80 bg-[#100a22] shadow-inner">
          <div
            // Transition is always present so flipping `reelMoving` only
            // changes the transform value — a change against an
            // already-painted state, which the browser reliably animates
            // (no rAF paint-sync needed).
            style={{
              transform: reelMoving ? `translateY(-${travel}px)` : "translateY(0)",
              transition: `transform ${SPIN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
          >
            {reel.map((n, i) => (
              <div
                key={i}
                className="flex items-center justify-center text-5xl font-black text-amber-300"
                style={{ height: CELL_HEIGHT }}
              >
                {n}
              </div>
            ))}
          </div>
          {/* depth fade, top and bottom */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#100a22] via-transparent to-[#100a22]" />
        </div>
      </div>

      <Sparkles className="absolute -right-3 -top-3 size-6 animate-pulse text-amber-200 sm:-right-6 sm:-top-6 sm:size-8" />
      <Sparkles className="absolute -bottom-2 -left-3 size-5 animate-pulse text-amber-200 sm:-bottom-4 sm:-left-6 sm:size-6" />
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
