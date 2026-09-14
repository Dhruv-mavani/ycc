"use client";

import { useState } from "react";
import Confetti from "react-confetti";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamPlayerGate, type GameTeamSelection } from "@/components/games/team-player-gate";
import { SpinWheelLevel } from "./spin-wheel-level";
import { RollDiceLevel } from "./roll-dice-level";

// ---------------------------------------------------------------------------
// Level Up (/level-up) — a two-level run through Spin the Wheel (Level 1)
// and Roll a Dice (Level 2), one code, one continuous session. Replaces the
// former standalone /spin-wheel and /roll-a-dice games: TeamPlayerGate now
// only runs once, here, up front — see spin-wheel-level.tsx /
// roll-dice-level.tsx for the two levels themselves (each is that former
// game's own mechanics/odds/animation, unchanged, just without its own
// gate or mute state).
//
// Level 1's result doesn't gate Level 2 — win or lose, `onDone` always
// advances the stage. Both levels are still recorded independently in
// game_plays (gameSlug "spin-wheel" / "roll-a-dice", same as before), but
// each recording now carries a shared `levelUpSessionId` (a fresh UUID
// minted here every time Level 1 starts — including on "Play again") in
// its `detail` JSON, so the admin Games insights page can pair a run's two
// rows back into the one combined box it presents them as. See
// getGameInsights in admin-stats.ts for that grouping.
// ---------------------------------------------------------------------------

type Stage = "gate" | "level1" | "level2" | "summary";
type LevelResult = "won" | "lost" | null;

export function LevelUpGame() {
  const [stage, setStage] = useState<Stage>("gate");
  const [selection, setSelection] = useState<GameTeamSelection | null>(null);
  const [muted, setMuted] = useState(false);
  const [level1Result, setLevel1Result] = useState<LevelResult>(null);
  const [level2Result, setLevel2Result] = useState<LevelResult>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  function toggleMute() {
    setMuted((m) => !m);
  }

  function startRun() {
    setSessionId(crypto.randomUUID());
    setStage("level1");
  }

  function restart() {
    setLevel1Result(null);
    setLevel2Result(null);
    setSessionId(crypto.randomUUID());
    setStage("level1");
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

  if (stage === "level1" && selection && sessionId) {
    return (
      <SpinWheelLevel
        key="level1"
        selection={selection}
        muted={muted}
        onToggleMute={toggleMute}
        levelUpSessionId={sessionId}
        onDone={(result) => {
          setLevel1Result(result);
          setStage("level2");
        }}
      />
    );
  }

  if (stage === "level2" && selection && sessionId) {
    return (
      <RollDiceLevel
        key="level2"
        selection={selection}
        muted={muted}
        onToggleMute={toggleMute}
        levelUpSessionId={sessionId}
        onDone={(result) => {
          setLevel2Result(result);
          setStage("summary");
        }}
      />
    );
  }

  if (stage === "summary") {
    const anyWon = level1Result === "won" || level2Result === "won";
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        {muteButton}
        {anyWon ? <ResultConfetti /> : null}

        <div className="animate-mystery-box-pop text-6xl sm:text-7xl md:text-8xl">
          🏁
        </div>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
          Game Over
        </h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Here&apos;s how both levels went.
        </p>

        <div className="mt-8 w-full max-w-sm space-y-3">
          <LevelRow n={1} label="Spin the Wheel" result={level1Result} />
          <LevelRow n={2} label="Roll a Dice" result={level2Result} />
        </div>

        <button
          type="button"
          onClick={restart}
          className="mt-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-violet-500 px-6 py-2.5 text-base font-bold text-black shadow-xl shadow-violet-500/20 transition-all duration-300 hover:scale-105 hover:from-violet-300 hover:to-violet-400 hover:shadow-violet-500/40 sm:px-8 sm:py-3 sm:text-xl"
        >
          <RotateCcw className="size-5" />
          Play again
        </button>
      </div>
    );
  }

  // stage === "gate" (or selection somehow missing for level1/level2 —
  // falls through here too, back to the gate rather than crashing).
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      {muteButton}
      <div className="animate-mystery-box-glow absolute -z-10 size-52 rounded-full bg-violet-400/30 blur-3xl sm:size-72" />
      <span className="text-5xl sm:text-6xl">🏆</span>
      <h1 className="mt-6 text-3xl font-black sm:text-4xl md:text-6xl">
        Level Up
      </h1>
      <div className="mt-6 max-w-xl text-left text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
        <p className="mb-3 text-center text-base font-bold text-white sm:text-lg">
          How to Play
        </p>
        <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-violet-300">
          <li>
            <span className="font-bold text-white">Level 1 — Spin the Wheel.</span>{" "}
            Pick a number and spin.
          </li>
          <li>
            <span className="font-bold text-white">Level 2 — Roll a Dice.</span> Win
            or lose Level 1, you move on automatically.
          </li>
          <li>After Level 2, see your full results.</li>
        </ol>
      </div>

      {/* Recorded gameplay demo — an actual video (h264 mp4, ~264KB),
          recorded at a real phone viewport width so it shows the same
          mobile-first layout most players actually see, not the desktop
          one. autoPlay+loop+muted+playsInline makes it behave like the GIF
          it replaces (starts and loops on its own, no controls, no sound,
          no iOS fullscreen takeover on tap). */}
      <div className="mt-6 w-full max-w-xs">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-white/50">
          See what a win looks like
        </p>
        <video
          src="/level-up/win-demo.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Gameplay demo of winning a round in Level Up"
          className="w-full rounded-2xl border border-white/10 shadow-xl"
        />
      </div>

      <TeamPlayerGate onSelectionChange={setSelection} />

      <button
        type="button"
        disabled={!selection}
        onClick={startRun}
        className={cn(
          "mt-8 rounded-xl px-8 py-2.5 text-lg font-bold shadow-xl transition-all duration-300 sm:px-10 sm:py-3 sm:text-xl md:text-2xl",
          selection
            ? "bg-gradient-to-r from-violet-400 to-violet-500 text-black shadow-violet-500/20 hover:scale-105 hover:from-violet-300 hover:to-violet-400 hover:shadow-violet-500/40"
            : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40",
        )}
      >
        Start Level 1
      </button>
    </div>
  );
}

function LevelRow({
  n,
  label,
  result,
}: {
  n: number;
  label: string;
  result: LevelResult;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
          Level {n}
        </p>
        <p className="font-bold text-white">{label}</p>
      </div>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-sm font-bold",
          result === "won"
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-white/10 text-white/60",
        )}
      >
        {result === "won" ? "Won 🎉" : "Lost"}
      </span>
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
