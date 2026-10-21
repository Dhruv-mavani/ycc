"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Confetti from "react-confetti";
import { Gift, Loader2, RotateCcw, Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { playClickTrain, playNotes, type ActiveSound } from "@/lib/synth-sfx";
import { TeamPlayerGate, type GameTeamSelection } from "@/components/games/team-player-gate";
import { MAX_NUMBER } from "@/lib/games/mystery-box-odds";

// ---------------------------------------------------------------------------
// Mystery Box — a solo, self-serve number-draw game (/mystry-box). The player
// picks a number from 1 to 50, then opens the box: it shakes, the lid flies
// off, and a slot-machine reel spins through numbers and decelerates onto the
// drawn one. Match = win, otherwise lose.
//
// Win odds are deliberately real and exactly set, not simulated to look
// small while secretly being zero: landing on the player's own number is
// a 0.25% (25-in-10,000) draw — tuned so real turnout naturally produces
// about that many winners (see PICKED_WIN_CHANCE's own comment in
// mystery-box-odds.ts), same flat-probability approach Roll a Dice uses.
// The remaining ~99.75% is spread evenly across the other 49 (losing)
// numbers. The actual draw (drawNumber) now lives server-side in
// src/lib/games/mystery-box-odds.ts, called only from rollAndRecordMysteryBoxPlay
// (src/lib/game-plays.ts) — this component never decides or asserts a
// result itself; see requestRoll below for why.
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
// Sound effects are synthesized (src/lib/synth-sfx.ts), not audio files —
// gives this game its own distinct sound identity (a warm, rattly box)
// without shipping/licensing more mp3s. Spin the Wheel gets a different
// timbre/melody for the same reason; Quiz Champion keeps its original KBC
// audio clips as the third distinct identity.
// ---------------------------------------------------------------------------

const CELL_HEIGHT = 88; // px — one reel cell, and the box's viewing window
const REEL_LENGTH = 44; // cells the reel travels through before it lands
const SPIN_MS = 4200; // must match the transition duration set on the reel
const SHAKE_MS = 1000; // box shake before the lid comes off (2x the 0.5s keyframe)
const READ_MS = 650; // beat on the landed number before the result screen

const MYSTERY_SFX = {
  // A warm, rattly click train — mimics the box shaking then the reel
  // clacking through numbers, decelerating as it settles.
  spin: (): ActiveSound =>
    playClickTrain({
      count: 30,
      startGap: 0.055,
      endGap: 0.34,
      freq: 640,
      dur: 0.05,
      type: "triangle",
      gain: 0.16,
    }),
  // Bright ascending arpeggio — a little magical "ta-da".
  win: (): ActiveSound =>
    playNotes([
      { freq: 523.25, start: 0, dur: 0.14, type: "triangle", gain: 0.25 },
      { freq: 659.25, start: 0.12, dur: 0.14, type: "triangle", gain: 0.25 },
      { freq: 783.99, start: 0.24, dur: 0.14, type: "triangle", gain: 0.25 },
      { freq: 1046.5, start: 0.36, dur: 0.32, type: "triangle", gain: 0.3 },
    ]),
  // Soft two-note descent — a gentle "aww", not harsh.
  lose: (): ActiveSound =>
    playNotes([
      { freq: 311.13, start: 0, dur: 0.22, type: "sine", gain: 0.18 },
      { freq: 233.08, start: 0.18, dur: 0.34, type: "sine", gain: 0.16 },
    ]),
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

type Phase = "start" | "pick" | "requesting" | "spinning" | "won" | "lost";

interface GameState {
  phase: Phase;
  picked: number | null;
  drawn: number | null;
  reel: number[];
}

type Action =
  | { type: "START" }
  | { type: "PICK"; n: number }
  | { type: "REQUEST" }
  | { type: "OPEN"; drawn: number }
  | { type: "REQUEST_FAILED" }
  | { type: "SETTLE" }
  | { type: "RESTART" }
  | { type: "ABANDON" };

function initialState(): GameState {
  return { phase: "start", picked: null, drawn: null, reel: [] };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return { ...initialState(), phase: "pick" };
    case "PICK":
      return state.phase === "pick" ? { ...state, picked: action.n } : state;
    case "REQUEST":
      return state.phase === "pick" && state.picked !== null
        ? { ...state, phase: "requesting" }
        : state;
    case "REQUEST_FAILED":
      return state.phase === "requesting" ? { ...state, phase: "pick" } : state;
    case "OPEN": {
      // The server has already decided and recorded the outcome (see
      // mystery-box-roll/route.ts) — `drawn` here is just what number to
      // animate the reel toward, never a value this client computes.
      if (state.phase !== "requesting") return state;
      return { ...state, phase: "spinning", drawn: action.drawn, reel: buildReel(action.drawn) };
    }
    case "SETTLE":
      if (state.phase !== "spinning") return state;
      return { ...state, phase: state.picked === state.drawn ? "won" : "lost" };
    case "RESTART":
      return { ...initialState(), phase: "pick" };
    case "ABANDON":
      return initialState();
    default:
      return state;
  }
}

export function MysteryBoxGame() {
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

  // Exactly one SFX is ever in flight (spin, then win/lose). Hold it so it
  // can be cut the instant it's unwanted — on the next cue, on mute, and
  // above all on unmount: a synthesized sound keeps playing on its own
  // schedule after React tears the component down, so without this the
  // spin rattle would outlive the closed game.
  const sfxRef = useRef<ActiveSound | null>(null);
  const stopSfx = useCallback(() => {
    sfxRef.current?.stop();
    sfxRef.current = null;
  }, []);
  const play = useCallback(
    (kind: keyof typeof MYSTERY_SFX) => {
      stopSfx();
      if (mutedRef.current) return;
      sfxRef.current = MYSTERY_SFX[kind]();
    },
    [stopSfx],
  );

  // Kill any lingering sound when the game unmounts (e.g. the back link).
  useEffect(() => stopSfx, [stopSfx]);

  useEffect(() => {
    if (state.phase === "won") play("win");
    if (state.phase === "lost") play("lose");
  }, [state.phase, play]);

  // Asks the server to draw (and record) this round's result — the server
  // decides win/lose and the landed number; this client only ever animates
  // toward what it's told. See mystery-box-roll/route.ts and
  // rollAndRecordMysteryBoxPlay's doc comment in src/lib/game-plays.ts.
  const requestingRef = useRef(false);
  async function requestRoll(picked: number) {
    if (requestingRef.current) return;
    const sel = selectionRef.current;
    if (!sel) return;
    requestingRef.current = true;
    dispatch({ type: "REQUEST" });
    try {
      const res = await fetch("/api/games/mystery-box-roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: sel.source,
          teamRefId: sel.teamRefId,
          playerRefId: sel.playerRefId,
          picked,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || typeof data?.drawn !== "number") {
        toast.error(data?.error ?? "Could not open the box — please try again.");
        dispatch({ type: "REQUEST_FAILED" });
        return;
      }
      // The server's attemptNumber is authoritative — this client only
      // knew the count as of the last code lookup, which goes stale the
      // moment "Play again" starts a second round on the same code.
      if (typeof data.attemptNumber === "number") {
        setSelection((s) => (s ? { ...s, attemptNumber: data.attemptNumber } : s));
      }
      dispatch({ type: "OPEN", drawn: data.drawn });
    } catch {
      toast.error("Network error — please try again.");
      dispatch({ type: "REQUEST_FAILED" });
    } finally {
      requestingRef.current = false;
    }
  }

  // Leaving the tab at any point during an active round ends it outright —
  // same rationale and behavior as Level Up's handler (see the module
  // comment on level-up-game.tsx): switching apps, another tab, minimizing,
  // even a brief glance away all fire this the same way. Drops all the way
  // back to "start" (not just "pick") and clears the resolved player, so
  // the next attempt has to re-enter a code rather than silently continue
  // as whoever was playing before — this screen is often shared at a booth.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "hidden") return;
      if (state.phase !== "pick" && state.phase !== "requesting" && state.phase !== "spinning") return;
      toast.error("You left the game, so this run has ended — enter your code again to start a new one.");
      dispatch({ type: "ABANDON" });
      setSelection(null);
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [state.phase]);

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
        <MysteryBoxLeaderboardWidget />
        <div className="animate-mystery-box-glow absolute -z-10 size-52 rounded-full bg-amber-400/40 blur-3xl sm:size-72" />
        <div className="absolute -z-10 size-40 -translate-x-24 rounded-full bg-red-500/20 blur-3xl sm:size-56 sm:-translate-x-32" />
        <div className="absolute -z-10 size-40 translate-x-24 rounded-full bg-blue-500/20 blur-3xl sm:size-56 sm:translate-x-32" />
        <Gift className="size-14 text-amber-300 sm:size-16 md:size-20" />
        <h1 className="mt-6 text-3xl font-black sm:text-4xl md:text-6xl">
          Mystery Box
        </h1>
        <div className="mt-6 max-w-xl text-left text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
          <p className="mb-3 text-center text-base font-bold text-white sm:text-lg">
            How to Play
          </p>
          <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-amber-300">
            <li>Choose any number from 1 to {MAX_NUMBER}.</li>
            <li>
              Open the Mystery Box — it shakes, the lid flies off, and a reel
              spins through the numbers.
            </li>
            <li>Match your number — win!</li>
          </ol>
        </div>

        <TeamPlayerGate game="mystry-box" onSelectionChange={setSelection} />

        <button
          type="button"
          disabled={!selection}
          onClick={() => dispatch({ type: "START" })}
          className={cn(
            "mt-8 rounded-xl px-8 py-2.5 text-lg font-bold shadow-xl transition-all duration-300 sm:px-10 sm:py-3 sm:text-xl md:text-2xl",
            selection
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-500/20 hover:scale-105 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40"
              : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40",
          )}
        >
          Play
        </button>
      </div>
    );
  }

  if (state.phase === "pick" || state.phase === "requesting") {
    const busy = state.phase === "requesting";
    return (
      <div className="relative flex min-h-screen flex-col items-center px-4 py-14">
        {muteButton}
        <MysteryBoxLeaderboardWidget />
        {selection ? (
          <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-amber-300 sm:mt-0">
            Chance {selection.attemptNumber} of 2
          </p>
        ) : null}
        <h1 className="mt-2 text-center text-xl font-black sm:text-2xl md:text-4xl">
          Pick your number
        </h1>
        <p className="mt-2 text-center text-xs text-white/70 sm:text-sm md:text-base">
          {busy
            ? "Getting ready…"
            : state.picked === null
              ? `Choose any number from 1 to ${MAX_NUMBER}.`
              : `You picked ${state.picked}. Open the box when you're ready.`}
        </p>

        <div className="mt-8 grid w-full max-w-xl grid-cols-6 gap-1 sm:grid-cols-10 sm:gap-2">
          {Array.from({ length: MAX_NUMBER }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              disabled={busy}
              onClick={() => dispatch({ type: "PICK", n })}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border text-xs font-bold transition-all duration-300 sm:text-base",
                state.picked === n
                  ? "scale-110 border-amber-300 bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.55)] z-10"
                  : "border-white/10 bg-white/5 text-white backdrop-blur-sm hover:scale-110 hover:border-white/30 hover:bg-white/20 hover:shadow-lg z-0",
                busy && "opacity-50",
              )}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={state.picked === null || busy}
          onClick={() => requestRoll(state.picked as number)}
          className={cn(
            "mt-10 rounded-xl px-6 py-2.5 text-base font-bold shadow-lg transition-all duration-300 sm:px-10 sm:py-3 sm:text-xl md:text-2xl",
            state.picked === null || busy
              ? "cursor-not-allowed bg-white/5 border border-white/10 text-white/40"
              : "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xl shadow-amber-500/20 hover:scale-105 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40 border border-transparent",
          )}
        >
          {busy ? "Starting…" : "Open the Mystery Box"}
        </button>
      </div>
    );
  }

  if (state.phase === "spinning") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        {muteButton}
        <MysteryBoxLeaderboardWidget />
        {selection ? (
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300/70">
            Chance {selection.attemptNumber} of 2
          </p>
        ) : null}
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
      <MysteryBoxLeaderboardWidget />
      {won ? <ResultConfetti /> : null}

      <div className="animate-mystery-box-pop text-6xl sm:text-7xl md:text-8xl">
        {won ? "🎉" : "📦"}
      </div>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
        {won ? "You nailed it!" : "Not this time"}
      </h1>
      {selection ? (
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-amber-300/70">
          Chance {selection.attemptNumber} of 2
        </p>
      ) : null}
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

      {selection && selection.attemptNumber >= 2 ? (
        <p className="mt-10 max-w-xs text-sm text-white/60">
          That was your last chance with this code — a different code can
          still play.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => dispatch({ type: "RESTART" })}
          className="mt-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 text-base font-bold text-black shadow-xl shadow-amber-500/20 transition-all duration-300 hover:scale-105 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40 sm:px-8 sm:py-3 sm:text-xl"
        >
          <RotateCcw className="size-5" />
          Play again (1 chance left)
        </button>
      )}
    </div>
  );
}

interface MysteryBoxWinnerRow {
  playerName: string;
  teamLabel: string;
  createdAt: string;
}

// Self-contained button + dialog, mounted independently on all four game
// screens (start, pick, spinning, result) so the live winners list is
// reachable at every point in a round, not just after finishing — same
// pattern as QuizLeaderboardWidget in solo-quiz-game.tsx. No ranking here
// (unlike Quiz Champion): Mystery Box is win/lose only, so this is just
// who's landed their number so far, not a score table. Fetches from
// /api/games/mystery-box-winners (a thin public wrapper around the same
// cached getMysteryBoxWinners() that backs /games/leaderboard) each time
// it's opened.
function MysteryBoxLeaderboardWidget() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<MysteryBoxWinnerRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function openLeaderboard() {
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/games/mystery-box-winners");
      const data = await res.json().catch(() => null);
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openLeaderboard}
        aria-label="View winners"
        className="absolute left-4 top-4 z-10 text-white/70 hover:text-white"
      >
        <Trophy className="size-7 md:size-8" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-2 border-amber-500 bg-[#1a0b3d] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-white">Mystery Box Winners</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-white/70" />
            </div>
          ) : !rows || rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/70">
              No one&apos;s landed their number yet — a real 0.25% shot, so
              maybe you&apos;ll be the first.
            </p>
          ) : (
            <div className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
              {rows.map((w, i) => (
                <div
                  key={`${w.playerName}-${w.createdAt}-${i}`}
                  className="flex flex-col gap-0.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="truncate font-medium">
                    {w.playerName} <span className="text-white/50">— {w.teamLabel}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          <a
            href="/games/leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-xs font-semibold text-amber-300 underline-offset-2 hover:underline"
          >
            View full leaderboard (+ Quiz Champion &amp; Kismat Ke Khiladi) ↗
          </a>
        </DialogContent>
      </Dialog>
    </>
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
  play: (kind: keyof typeof MYSTERY_SFX) => void;
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
      playRef.current("spin");
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
      {/* Ambient glow — gold, with a red/blue tint bleeding in from each
          side, echoing the box's own panel colors below. */}
      <div className="animate-mystery-box-glow absolute inset-0 -z-10 rounded-full bg-amber-400/50 blur-2xl" />
      <div className="absolute -left-6 inset-y-0 -z-10 w-1/2 rounded-full bg-red-500/20 blur-2xl" />
      <div className="absolute -right-6 inset-y-0 -z-10 w-1/2 rounded-full bg-blue-500/20 blur-2xl" />

      {/* Lid — flies off once the reel starts moving. Glossy gold, same
          treatment as the body below. */}
      <div
        className={cn(
          "absolute -top-3 left-1/2 z-20 h-12 w-56 -translate-x-1/2 overflow-hidden rounded-lg border-4 border-amber-900 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-lg sm:h-14 sm:w-[17rem]",
          reelMoving && "animate-mystery-box-lid",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-3 w-24 -translate-x-1/2 -translate-y-1/2 rounded bg-amber-900/40" />
      </div>

      {/* Box body — a glossy gold-trimmed cube with a red "?" panel on the
          left and a blue "?" panel on the right (the classic loot-box
          look), the reel window sitting centered on top of both. */}
      <div className="relative h-44 w-52 overflow-hidden rounded-2xl border-[6px] border-amber-900 shadow-2xl sm:h-56 sm:w-64">
        {/* Left panel — red, bold white "?". The reel window dominates the
            vertical center, so the mark sits in the clear strip below it,
            not dead-center (which the reel window would hide entirely). */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-red-400 via-red-500 to-red-700">
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 select-none text-3xl font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)] sm:bottom-3 sm:text-4xl">
            ?
          </span>
        </div>
        {/* Right panel — blue, white circle with a blue "?". */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-sky-400 via-blue-500 to-blue-700">
          <span className="absolute bottom-2 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-xl font-black text-blue-600 shadow-md sm:bottom-3 sm:size-11 sm:text-2xl">
            ?
          </span>
        </div>

        {/* Center gold bevel, dividing the two panels. */}
        <div className="absolute left-1/2 top-0 h-full w-7 -translate-x-1/2 border-x-2 border-amber-900 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 sm:w-9" />

        {/* Glossy sheen over the whole body. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />

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
