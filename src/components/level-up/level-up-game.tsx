"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Confetti from "react-confetti";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamPlayerGate, type GameTeamSelection } from "@/components/games/team-player-gate";
import { SpinWheelLevel, type SpinWheelResultDetail } from "./spin-wheel-level";
import { RollDiceLevel, type RollDiceResultDetail } from "./roll-dice-level";

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
  const [level1Detail, setLevel1Detail] = useState<SpinWheelResultDetail | null>(null);
  const [level2Result, setLevel2Result] = useState<LevelResult>(null);
  const [level2Detail, setLevel2Detail] = useState<RollDiceResultDetail | null>(null);
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
    setLevel1Detail(null);
    setLevel2Result(null);
    setLevel2Detail(null);
    setSessionId(null);
    // Back to the gate, not straight into Level 1 — this screen is often
    // shared at a booth, so the next player needs to find their own code
    // rather than replay as whoever went before them. Clearing selection
    // also drops us into the "gate" branch below, which mounts a fresh
    // TeamPlayerGate (its own code/roster state resets for free since the
    // previous instance was already unmounted while playing).
    setSelection(null);
    setStage("gate");
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
        onDone={(result, detail) => {
          setLevel1Result(result);
          setLevel1Detail(detail);
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
        onDone={(result, detail) => {
          setLevel2Result(result);
          setLevel2Detail(detail);
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
          <LevelRow
            n={1}
            label="Spin the Wheel"
            result={level1Result}
            detail={
              level1Detail
                ? `You picked ${level1Detail.picked} — wheel landed on ${level1Detail.landedLabel}`
                : null
            }
          />
          <LevelRow
            n={2}
            label="Roll a Dice"
            result={level2Result}
            detail={
              level2Detail
                ? `You picked ${level2Detail.picked} — dice rolled ${level2Detail.die1} + ${level2Detail.die2} = ${level2Detail.drawnSum}`
                : null
            }
          />
        </div>

        {/* Cross-promo: Box Cricket is a separate, paid team event — most
            players here already have their phone out right after the
            result, so a poster + QR (scan to jump straight to the event
            page) reads more naturally at a physical booth than another
            in-app button. The whole card is still a real Link too, for
            anyone viewing this on the same device they'd register from. */}
        <div className="mt-10 w-full max-w-xs sm:max-w-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">
            Also Open Now
          </p>
          <Link
            href="/events/cricket-championship-2026"
            className="block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl transition-transform duration-300 hover:scale-[1.02]"
          >
            <Image
              src="/box-cricket/poster.png"
              alt="YCC Box Cricket Tournament poster"
              width={1024}
              height={1536}
              className="w-full"
            />
            <div className="flex items-center gap-3 border-t border-white/10 bg-black/40 p-3">
              <Image
                src="/box-cricket/qr.png"
                alt="QR code to register for YCC Box Cricket Tournament"
                width={96}
                height={96}
                className="size-20 shrink-0 rounded-md bg-white p-1.5 sm:size-24"
              />
              <p className="text-left text-xs text-white/70 sm:text-sm">
                <span className="font-bold text-white">Scan to register</span>{" "}
                for the YCC Box Cricket Tournament — or tap this poster.
              </p>
            </div>
          </Link>
        </div>

        <button
          type="button"
          onClick={restart}
          className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-violet-500 px-6 py-2.5 text-base font-bold text-black shadow-xl shadow-violet-500/20 transition-all duration-300 hover:scale-105 hover:from-violet-300 hover:to-violet-400 hover:shadow-violet-500/40 sm:px-8 sm:py-3 sm:text-xl"
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
        Kismat Ke Khiladi <span className="text-violet-300">ft. Go Goa Gone</span>
      </h1>
      <div className="mt-6 max-w-xl text-left text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
        <p className="mb-3 text-center text-base font-bold text-white sm:text-lg">
          How to Play &amp; Rules
        </p>
        <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-violet-300">
          <li>
            <span className="font-bold text-white">Level 1 — Spin the Wheel:</span>{" "}
            Pick a number. If the wheel lands on your number, you win!
          </li>
          <li>
            <span className="font-bold text-white">Level 2 — Roll the Dice:</span>{" "}
            Roll the dice. If you roll the winning number, you win!
          </li>
          <li>
            <span className="font-bold text-white">Level 3 — Box Cricket:</span> If
            you participate in the Box Cricket Tournament, you will get a
            special Goa travel coupon starting at ₹2,499.
          </li>
          <li>You must participate in all 3 games to complete the challenge.</li>
          <li>
            You can play only one time. If you play more than once, we can
            disqualify you. We can track your games and number of plays.
          </li>
        </ol>
        <p className="mt-4 border-l-2 border-violet-300/60 pl-3 italic text-white/80">
          &quot;Please play fair. Thank you!&quot;
        </p>
      </div>

      <div className="mt-6 w-full max-w-xs sm:max-w-sm">
        {/* Real gameplay recording (not a synthetic demo) — the full run
            through both levels to a win, screen-recorded and handed off as
            an mp4, re-encoded here for web delivery (h264, ~1MB, faststart).
            autoPlay+loop+muted+playsInline: starts and loops on its own, no
            controls, no sound, no iOS fullscreen takeover on tap. */}
        <video
          src="/level-up/win-demo.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Gameplay demo of winning a round in Kismat Ke Khiladi ft. Go Goa Gone"
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
  detail,
}: {
  n: number;
  label: string;
  result: LevelResult;
  detail: string | null;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center justify-between">
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
      {detail ? <p className="mt-2 text-left text-xs text-white/60">{detail}</p> : null}
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
