"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Loader2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TeamPlayerGate, type GameTeamSelection } from "@/components/games/team-player-gate";
import { SpinWheelLevel, type SpinWheelResultDetail } from "./spin-wheel-level";
import { RollDiceLevel, type RollDiceResultDetail } from "./roll-dice-level";
import { LevelUpLeaderboardWidget } from "./level-up-leaderboard-widget";

// ---------------------------------------------------------------------------
// Level Up (/level-upp) — a two-level run through Spin the Wheel (Level 1)
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
  const [checkingNextChance, setCheckingNextChance] = useState(false);

  function toggleMute() {
    setMuted((m) => !m);
  }

  function startRun() {
    setSessionId(crypto.randomUUID());
    setStage("level1");
  }

  // Hard reset, straight back to the gate (not a replay) — used when a run
  // is abandoned (tab hidden mid-run, below) or when "Play again" finds
  // this code has no chances left. This screen is often shared at a booth,
  // so the next player needs to find their own code rather than inherit
  // whoever went before them. Clearing selection also drops us into the
  // "gate" branch below, which mounts a fresh TeamPlayerGate (its own
  // code/roster state resets for free since the previous instance was
  // already unmounted while playing).
  function abandonRun() {
    setLevel1Result(null);
    setLevel1Detail(null);
    setLevel2Result(null);
    setLevel2Detail(null);
    setSessionId(null);
    setSelection(null);
    setStage("gate");
  }

  // "Play again" on the summary screen — same player, same code, straight
  // back into Level 1 (no retyping the code). Re-looks-up the code first
  // (same endpoint the gate itself uses) rather than just incrementing the
  // locally-known attemptNumber, since that's the one source of truth that
  // correctly handles both a real player's second-of-two chances *and* a
  // standing unlimited-test identity (whose attemptNumber the server
  // always reports as 1 — see isUnlimitedTestPlayer in game-plays.ts).
  async function playAgain() {
    if (!selection) {
      abandonRun();
      return;
    }
    setCheckingNextChance(true);
    try {
      const res = await fetch(
        `/api/games/team-lookup?code=${encodeURIComponent(selection.code)}&game=level-up`,
      );
      const data = await res.json().catch(() => null);
      const player = (
        data?.team?.players as
          | Array<{ id: string; attemptNumber?: number; alreadyPlayed?: boolean }>
          | undefined
      )?.find((p) => p.id === selection.playerRefId);

      if (!res.ok || !player || player.alreadyPlayed) {
        toast.error("You've already used both your chances with this code — 2 plays per code.");
        abandonRun();
        return;
      }

      setLevel1Result(null);
      setLevel1Detail(null);
      setLevel2Result(null);
      setLevel2Detail(null);
      setSelection((s) => (s ? { ...s, attemptNumber: player.attemptNumber ?? s.attemptNumber } : s));
      startRun();
    } catch {
      toast.error("Network error — please try again.");
      abandonRun();
    } finally {
      setCheckingNextChance(false);
    }
  }

  // Leaving the tab mid-run ends it outright — switching apps, opening
  // another tab, minimizing, even a brief glance away all fire this the
  // same way (the Page Visibility API can't tell them apart, and isn't
  // meant to). No persistence exists either (see the module comment —
  // plain useState/useReducer, nothing in localStorage/sessionStorage),
  // so a full browser close-and-reopen already lands back on a fresh
  // gate screen for free; this covers the remaining case, switching away
  // without closing anything. Scoped to level1/level2 — nothing to
  // protect on the gate screen (no run started) or the summary screen
  // (already finished and recorded).
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== "hidden") return;
      if (stage !== "level1" && stage !== "level2") return;
      toast.error("You left the game, so this run has ended — enter your code again to start a new one.");
      abandonRun();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [stage]);

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
          // Server-authoritative — syncs away any staleness from the
          // code lookup, so Level 2 and the summary screen show the
          // real attempt number for this run, not whatever team-lookup
          // last reported.
          if (typeof detail.attemptNumber === "number") {
            setSelection((s) => (s ? { ...s, attemptNumber: detail.attemptNumber as number } : s));
          }
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
    // Kismat Ke Khiladi's prize tier (level2Detail.prizeTier) is a separate,
    // independently-calibrated draw, deliberately decoupled from the real
    // wheel/dice win/lose outcome below it (see game-plays.ts) — so
    // celebrating/confetti is keyed off actually landing a prize tier, not
    // off the real per-level result, to avoid popping confetti into a "no
    // prize" screen. Events with no prize-tier system configured
    // (prizeTier stays undefined) fall back to the real win/lose outcome,
    // same as before this existed.
    const hasPrizeTierSystem = level2Detail?.prizeTier !== undefined;
    const wonSomething = hasPrizeTierSystem
      ? level2Detail?.prizeTier === "top" || level2Detail?.prizeTier === "mid"
      : level1Result === "won" || level2Result === "won";
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        {muteButton}
        <LevelUpLeaderboardWidget />
        {wonSomething ? <ResultConfetti /> : null}

        <div className="animate-mystery-box-pop text-6xl sm:text-7xl md:text-8xl">
          🏁
        </div>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
          Game Over
        </h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Here&apos;s how both levels went.
        </p>
        {selection ? (
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-violet-300/70">
            Chance {selection.attemptNumber} of 2
          </p>
        ) : null}

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

        {selection && sessionId ? (
          <ResultPanel
            prizeTier={level2Detail?.prizeTier}
            midTierPrizeLabel={level2Detail?.midTierPrizeLabel}
            selection={selection}
            levelUpSessionId={sessionId}
          />
        ) : null}

        <button
          type="button"
          onClick={playAgain}
          disabled={checkingNextChance}
          className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-violet-500 px-6 py-2.5 text-base font-bold text-black shadow-xl shadow-violet-500/20 transition-all duration-300 hover:scale-105 hover:from-violet-300 hover:to-violet-400 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:px-8 sm:py-3 sm:text-xl"
        >
          {checkingNextChance ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <RotateCcw className="size-5" />
          )}
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
      <LevelUpLeaderboardWidget />
      <div className="animate-mystery-box-glow absolute -z-10 size-52 rounded-full bg-violet-400/30 blur-3xl sm:size-72" />
      <span className="text-5xl sm:text-6xl">🏆</span>
      <h1 className="mt-6 text-3xl font-black sm:text-4xl md:text-6xl">
        Kismat Ke Khiladi
      </h1>
      <div className="mt-6 max-w-xl text-left text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
        <p className="mb-1 text-center text-base font-bold text-white sm:text-lg">
          Game &amp; Rules
        </p>
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-violet-300 sm:text-sm">
          2 Games • Only 2 Chances to Play
        </p>
        <p className="mb-3">Enter your code &amp; start the game.</p>
        <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-violet-300">
          <li>
            <span className="font-bold text-white">Level 1: Spin the Wheel —</span>{" "}
            Pick a number. If the arrow lands on your number, you win!
          </li>
          <li>
            <span className="font-bold text-white">Level 2: Roll the Dice —</span>{" "}
            Pick a number. If the dice lands on your number, you win!
          </li>
        </ol>
        <p className="mt-3">
          After winning the game, a Letter Box will appear on your screen.
          Tap to open it and receive your YCC Kismat Ke Khiladi
          Winners&apos; Congratulations &amp; Invitation Pass.
        </p>
        <p className="mt-2">Visit our venue in person to collect your surprise gift.</p>
        <p className="mt-4 border-l-2 border-violet-300/60 pl-3 italic text-white/80">
          &quot;Best wishes for the game!&quot;
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
          aria-label="Gameplay demo of winning a round in Kismat Ke Khiladi"
          className="w-full rounded-2xl border border-white/10 shadow-xl"
        />
      </div>

      <TeamPlayerGate game="level-up" onSelectionChange={setSelection} />

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

// Shown on both the full-win (PrizePicker) and partial-win (mid-tier)
// result panels — same letter either way, since both tiers are "among the
// 100 Lucky Winners" regardless of which prize they land.
function InvitationLetter() {
  return (
    <div className="mt-4 rounded-xl border border-amber-300/30 bg-black/20 p-4 text-left">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-amber-300">
        Special Invitation Letter
      </p>
      <p className="mt-3 text-sm font-semibold text-white">Congratulations, Dear Winner!</p>
      <p className="mt-2 text-xs leading-relaxed text-white/70 sm:text-sm">
        You are among the 100 Lucky winners of Kismat Ke Khiladi and are invited to our
        exclusive Winners&apos; Special Meetup to receive your Gifts &amp; Prizes.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-white/70 sm:text-sm">
        Stay tuned and stay active. The YCC Team will contact you soon with further details.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-white/70 sm:text-sm">
        Warm Regards,
        <br />
        Team YCC
      </p>
    </div>
  );
}

// Shown once both levels are finished, for events with a prize-tier system
// configured (Kismat Ke Khiladi today) — level2Detail.prizeTier stays
// undefined for every other event sharing this component, so nothing
// renders there, unchanged from before this existed. The three outcomes —
// no prize, a Standup Comedy Pass, or a unique numbered prize — all share
// the same card shell (size, padding, radius, headline scale) so none of
// them reads as more of an afterthought than the others; only the
// icon/color/copy changes per outcome.
function ResultPanel({
  prizeTier,
  midTierPrizeLabel,
  selection,
  levelUpSessionId,
}: {
  prizeTier: "top" | "mid" | "none" | undefined;
  midTierPrizeLabel: string | undefined;
  selection: GameTeamSelection;
  levelUpSessionId: string;
}) {
  if (prizeTier === undefined) return null;

  if (prizeTier === "none") {
    return (
      <div className="mt-8 w-full max-w-sm rounded-2xl border border-white/15 bg-white/5 p-5 text-center">
        <p className="text-3xl">🙁</p>
        <p className="mt-2 text-lg font-bold text-white sm:text-xl">Not This Time</p>
        <p className="mt-1 text-xs text-white/60 sm:text-sm">
          No prize on this run — thanks for playing Kismat Ke Khiladi!
        </p>
      </div>
    );
  }

  if (prizeTier === "mid") {
    return (
      <div className="mt-8 w-full max-w-sm rounded-2xl border border-amber-300/40 bg-amber-400/10 p-5 text-center">
        <p className="text-3xl">🎟️</p>
        <p className="mt-2 text-lg font-bold text-amber-200 sm:text-xl">
          You&apos;ve Won a {midTierPrizeLabel ?? "Prize"}!
        </p>

        <InvitationLetter />
      </div>
    );
  }

  return <PrizePicker selection={selection} levelUpSessionId={levelUpSessionId} />;
}

interface PrizeSlotView {
  slotNumber: number;
  available: boolean;
}

// Fetches real slot availability on mount (so an already-claimed number
// shows disabled immediately) and re-verifies the claim server-side on
// every pick — see kismat-prize-claim.ts. A losing race on a simultaneous
// claim just disables that number and lets them pick again, not an error
// state.
function PrizePicker({
  selection,
  levelUpSessionId,
}: {
  selection: GameTeamSelection;
  levelUpSessionId: string;
}) {
  const [slots, setSlots] = useState<PrizeSlotView[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const params = new URLSearchParams({
          source: selection.source,
          playerRefId: selection.playerRefId,
          levelUpSessionId,
        });
        const res = await fetch(`/api/games/kismat-prize-claim?${params}`);
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          toast.error(data?.error ?? "Could not load prizes.");
          return;
        }
        setSlots(data.slots ?? []);
        if (data.alreadyClaimed) setWonPrize(data.alreadyClaimed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selection.source, selection.playerRefId, levelUpSessionId]);

  async function pick(slotNumber: number) {
    if (claiming || wonPrize) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/games/kismat-prize-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: selection.source,
          playerRefId: selection.playerRefId,
          levelUpSessionId,
          slotNumber,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "That number was already taken — pick another.");
        setSlots((prev) =>
          prev ? prev.map((s) => (s.slotNumber === slotNumber ? { ...s, available: false } : s)) : prev,
        );
        return;
      }
      setWonPrize(data.prizeName);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="mt-8 w-full max-w-sm rounded-2xl border border-violet-300/40 bg-violet-400/10 p-5 text-center">
      <p className="text-3xl">🏆</p>
      <p className="mt-2 text-lg font-bold text-amber-200 sm:text-xl">
        Congratulations — You Won Both Levels!
      </p>

      {loading ? (
        <div className="mt-4 flex justify-center">
          <Loader2 className="size-6 animate-spin text-white/70" />
        </div>
      ) : wonPrize ? (
        <>
          <p className="mt-4 text-xl font-black text-emerald-300">🎉 {wonPrize}</p>

        </>
      ) : (
        <>

          <div className="mt-4 grid grid-cols-5 gap-1.5 min-[380px]:gap-2">
            {(slots ?? []).map((s) => (
              <button
                key={s.slotNumber}
                type="button"
                disabled={!s.available || claiming}
                onClick={() => pick(s.slotNumber)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg border text-sm font-bold transition-all min-[380px]:text-base",
                  s.available
                    ? "border-violet-300/50 bg-white/5 text-white hover:scale-110 hover:bg-violet-400/20"
                    : "cursor-not-allowed border-white/5 bg-white/5 text-white/20",
                )}
              >
                {s.slotNumber}
              </button>
            ))}
          </div>
        </>
      )}

      <InvitationLetter />
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
