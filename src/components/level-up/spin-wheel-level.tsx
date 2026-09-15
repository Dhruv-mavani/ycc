"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Confetti from "react-confetti";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickTrain, playNotes, type ActiveSound } from "@/lib/synth-sfx";
import type { GameTeamSelection } from "@/components/games/team-player-gate";

// ---------------------------------------------------------------------------
// Level 1 of Level Up (/level-up) — Spin the Wheel, adapted from the former
// standalone /spin-wheel game (same mechanics, sections, odds, sound and
// visuals) to run as one level of a two-level flow instead of its own
// self-contained page: `selection` is resolved once by the parent's own
// TeamPlayerGate (not repeated here), mute is lifted to the parent so one
// toggle covers both levels, and there's no "start"/gate phase — this
// mounts straight into "pick". On win or lose it calls `onDone` instead of
// offering "Play again": the parent always moves on to Level 2 regardless
// of the result. See roll-dice-level.tsx for Level 2, and the header
// comments on the former spin-wheel-game.tsx / roll-dice-game.tsx (git
// history) for the full odds/animation rationale, unchanged here.
// ---------------------------------------------------------------------------

const NUM_COUNT = 10;

interface PrizeSection {
  id: string;
  emoji: string;
  wheelLines: string[];
  name: string;
  winChance: number;
}

const CASH_PRIZE: PrizeSection = {
  id: "cash",
  emoji: "💰",
  wheelLines: ["₹25,000/-", "CASH PRIZE"],
  name: "₹25,000/- Cash Prize",
  winChance: 0.000000000001, // 0.0000000001%
};

// The original Spin the Wheel prize, before it became the Cash Prize above
// for every non-school audience (see git history, "Change Spin the Wheel's
// Goa Trip prize to a ₹25,000/- Cash Prize") — brought back specifically
// for YCC Go Goa Gone, whose own poster promises this exact trip.
const GOA_TRIP: PrizeSection = {
  id: "goa",
  emoji: "🏖️",
  wheelLines: ["GOA TRIP", "WITH GANG", "(FREE TO ALL)"],
  name: "Goa Trip with Gang (free to all)",
  winChance: 0.000000000001,
};

const SUPERCHAMPS_PRIZES: PrizeSection[] = [
  { id: "sneakers", emoji: "👟", wheelLines: ["SNEAKERS"], name: "Nike Sneakers", winChance: 0.000000000001 },
  { id: "ps5", emoji: "🎮", wheelLines: ["PS5"], name: "PS5", winChance: 0.000000000001 },
  { id: "cycle", emoji: "🚲", wheelLines: ["CYCLE"], name: "Gear Cycle", winChance: 0.000000000001 },
];

const SURPRISE_GIFT: PrizeSection = {
  id: "surprise",
  emoji: "🎁",
  wheelLines: ["SURPRISE", "GIFT"],
  name: "Surprise Gift",
  winChance: 0.0005, // 5 in 10,000 = 0.05%
};

// Audience is source-driven (school -> Super Champs' three real items,
// everyone else -> the single Cash Prize slice) except Go Goa Gone, which
// needs event-level granularity since it shares "registration" source with
// every other team event (Box Cricket, Plastic Ball, Tennis Ball, Partners
// Box Cricket) — those keep the Cash Prize, only Go Goa Gone gets its own
// Goa Trip slice back. See GameTeamSelection.eventSlug.
function prizesFor(
  source: GameTeamSelection["source"] | undefined,
  eventSlug: string | undefined,
): PrizeSection[] {
  const audiencePrizes =
    eventSlug === "ycc-go-goa-gone"
      ? [GOA_TRIP]
      : source === "school"
        ? SUPERCHAMPS_PRIZES
        : [CASH_PRIZE];
  return [...audiencePrizes, SURPRISE_GIFT];
}

const SPECIAL_TOTAL_DEG = 120;
const NUM_SLICE_DEG = (360 - SPECIAL_TOTAL_DEG) / NUM_COUNT;

const PICKED_WIN_CHANCE = 0.000000000001;

const SPIN_MS = 4500;
const PRESPIN_MS = 300;
const READ_MS = 700;
const EXTRA_SPINS = 6;

const NUMBER_COLORS = ["#fb923c", "#0e7490"] as const;
const PRIZE_COLORS = ["#facc15", "#f59e0b", "#eab308"] as const;

type WheelSection =
  | { kind: "number"; start: number; end: number; color: string; value: number }
  | { kind: "prize"; start: number; end: number; color: string; prize: PrizeSection };

function buildSections(prizes: PrizeSection[]): WheelSection[] {
  const sections: WheelSection[] = [];
  for (let i = 0; i < NUM_COUNT; i++) {
    sections.push({
      kind: "number",
      start: i * NUM_SLICE_DEG,
      end: (i + 1) * NUM_SLICE_DEG,
      color: NUMBER_COLORS[i % NUMBER_COLORS.length],
      value: i + 1,
    });
  }
  const prizeSliceDeg = SPECIAL_TOTAL_DEG / prizes.length;
  const base = NUM_COUNT * NUM_SLICE_DEG;
  prizes.forEach((prize, i) => {
    sections.push({
      kind: "prize",
      start: base + i * prizeSliceDeg,
      end: base + (i + 1) * prizeSliceDeg,
      color: PRIZE_COLORS[i % PRIZE_COLORS.length],
      prize,
    });
  });
  return sections;
}

function buildConicGradient(sections: WheelSection[]): string {
  const stops = sections
    .map((s) => `${s.color} ${s.start.toFixed(4)}deg ${s.end.toFixed(4)}deg`)
    .join(", ");
  return `conic-gradient(from 0deg, ${stops})`;
}

const WHEEL_SFX = {
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
  win: (): ActiveSound =>
    playNotes([
      { freq: 392.0, start: 0, dur: 0.12, type: "square", gain: 0.18 },
      { freq: 523.25, start: 0.1, dur: 0.12, type: "square", gain: 0.18 },
      { freq: 659.25, start: 0.2, dur: 0.12, type: "square", gain: 0.18 },
      { freq: 783.99, start: 0.3, dur: 0.12, type: "square", gain: 0.18 },
      { freq: 1046.5, start: 0.42, dur: 0.35, type: "square", gain: 0.26 },
    ]),
  lose: (): ActiveSound =>
    playNotes([
      { freq: 246.94, start: 0, dur: 0.24, type: "sine", gain: 0.17 },
      { freq: 196.0, start: 0.2, dur: 0.38, type: "sine", gain: 0.15 },
    ]),
};

function sectionCenterAngle(section: WheelSection): number {
  return (section.start + section.end) / 2;
}

function rotationFor(section: WheelSection, spins: number): number {
  const base = (360 - sectionCenterAngle(section)) % 360;
  return spins * 360 + base;
}

function drawSection(picked: number, prizes: PrizeSection[]): number {
  const pickedIndex = picked - 1;
  const r = Math.random();
  if (r < PICKED_WIN_CHANCE) return pickedIndex;
  let acc = PICKED_WIN_CHANCE;
  for (let i = 0; i < prizes.length; i++) {
    acc += prizes[i].winChance;
    if (r < acc) return NUM_COUNT + i;
  }
  const losingIndexes = Array.from({ length: NUM_COUNT }, (_, i) => i).filter(
    (i) => i !== pickedIndex,
  );
  return losingIndexes[Math.floor(Math.random() * losingIndexes.length)];
}

type Phase = "pick" | "spinning" | "won" | "lost";

interface GameState {
  phase: Phase;
  picked: number | null;
  sections: WheelSection[];
  landedIndex: number | null;
}

type Action =
  | { type: "PICK"; n: number }
  | { type: "OPEN"; prizes: PrizeSection[] }
  | { type: "SETTLE" };

function initialState(): GameState {
  return { phase: "pick", picked: null, sections: [], landedIndex: null };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "PICK":
      return state.phase === "pick" ? { ...state, picked: action.n } : state;
    case "OPEN": {
      if (state.phase !== "pick" || state.picked === null) return state;
      const sections = buildSections(action.prizes);
      const landedIndex = drawSection(state.picked, action.prizes);
      return { ...state, phase: "spinning", sections, landedIndex };
    }
    case "SETTLE": {
      if (state.phase !== "spinning" || state.landedIndex === null || state.picked === null)
        return state;
      const landed = state.sections[state.landedIndex];
      const won =
        landed.kind === "prize" || (landed.kind === "number" && landed.value === state.picked);
      return { ...state, phase: won ? "won" : "lost" };
    }
    default:
      return state;
  }
}

export function SpinWheelLevel({
  selection,
  muted,
  onToggleMute,
  levelUpSessionId,
  onDone,
}: {
  selection: GameTeamSelection;
  muted: boolean;
  onToggleMute: () => void;
  /** Shared with Level 2's own recorded play — see the header comment on
   * level-up-game.tsx — so the admin Games insights page can pair this
   * run's two game_plays rows back into one combined box. */
  levelUpSessionId: string;
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
    (kind: keyof typeof WHEEL_SFX) => {
      stopSfx();
      if (mutedRef.current) return;
      sfxRef.current = WHEEL_SFX[kind]();
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

  // Reports Level 1's outcome once it settles. Guarded by a ref (not
  // state) so StrictMode's double-invoke can't fire this twice.
  const recordedRef = useRef(false);
  useEffect(() => {
    if (state.phase !== "won" && state.phase !== "lost") return;
    if (recordedRef.current) return;
    recordedRef.current = true;

    const landed =
      state.landedIndex !== null ? state.sections[state.landedIndex] : null;
    fetch("/api/games/record-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameSlug: "spin-wheel",
        source: selection.source,
        teamRefId: selection.teamRefId,
        playerRefId: selection.playerRefId,
        result: state.phase,
        detail: {
          picked: state.picked,
          landedIndex: state.landedIndex,
          prizeId: landed?.kind === "prize" ? landed.prize.id : null,
          levelUpSessionId,
        },
      }),
    }).catch(() => {});
  }, [state.phase, state.picked, state.landedIndex, state.sections, selection, levelUpSessionId]);

  const prizes = prizesFor(selection.source, selection.eventSlug);

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
        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-amber-300 sm:mt-0">
          Level 1 of 2
        </p>
        <h1 className="mt-2 text-center text-xl font-black sm:text-2xl md:text-4xl">
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
          onClick={() => dispatch({ type: "OPEN", prizes })}
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
          sections={state.sections}
          landedIndex={state.landedIndex ?? 0}
          play={play}
          stopSfx={stopSfx}
          onSettle={() => dispatch({ type: "SETTLE" })}
        />
      </div>
    );
  }

  const won = state.phase === "won";
  const landedSection =
    state.landedIndex !== null ? state.sections[state.landedIndex] : null;
  const wonPrize = won && landedSection?.kind === "prize" ? landedSection.prize : null;
  const landedLabel =
    landedSection?.kind === "prize" ? landedSection.prize.name : String(landedSection?.value ?? "");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      {muteButton}
      {won ? <ResultConfetti /> : null}

      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-300">
        Level 1 of 2
      </p>
      <div className="animate-mystery-box-pop text-6xl sm:text-7xl md:text-8xl">
        {won ? (wonPrize?.emoji ?? "🎉") : "🎡"}
      </div>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
        {won ? (wonPrize ? "Jackpot!" : "You nailed it!") : "Not this time"}
      </h1>
      <p className="mt-4 max-w-sm text-sm text-white/80 sm:text-base md:text-lg">
        {won ? (
          wonPrize ? (
            <>
              The wheel landed on{" "}
              <span className="font-bold text-amber-300">{wonPrize.name}</span> — just
              for fun, but what a spin.
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
        onClick={() => onDone(state.phase as "won" | "lost")}
        className="mt-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 text-base font-bold text-black shadow-xl shadow-amber-500/20 transition-all duration-300 hover:scale-105 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40 sm:px-8 sm:py-3 sm:text-xl"
      >
        Continue to Level 2
        <ArrowRight className="size-5" />
      </button>
    </div>
  );
}

function SpinningWheel({
  sections,
  landedIndex,
  play,
  stopSfx,
  onSettle,
}: {
  sections: WheelSection[];
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
      stopSfxRef.current();
    };
  }, []);

  const wheelBackground = buildConicGradient(sections);
  const rotationDeg = spinning ? rotationFor(sections[landedIndex], EXTRA_SPINS) : 0;

  return (
    <div className="relative flex flex-col items-center">
      <div className="animate-mystery-box-glow absolute inset-0 -z-10 rounded-full bg-amber-400/40 blur-2xl" />

      <div
        className="z-30 h-4 w-5 bg-white shadow-md sm:h-5 sm:w-6"
        style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
      />

      <div className="relative -mt-px size-56 rounded-full border-[6px] border-white/90 shadow-2xl sm:size-80">
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            className="absolute inset-0"
            style={{
              background: wheelBackground,
              transform: `rotate(${rotationDeg}deg)`,
              transition: `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.67, 0.15, 1)`,
            }}
          >
            {sections.map((section, i) => {
              const spokeRotation = sectionCenterAngle(section) - 90;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-0 w-1/2 origin-left"
                  style={{ transform: `rotate(${spokeRotation}deg)` }}
                >
                  <div className="absolute right-[8%] top-1/2 flex -translate-y-1/2 flex-col items-center leading-[0.85] whitespace-nowrap">
                    {section.kind === "prize" ? (
                      <>
                        <span className="text-base sm:text-2xl">{section.prize.emoji}</span>
                        {section.prize.wheelLines.map((line, li) => (
                          <span
                            key={li}
                            className="text-[8px] font-black text-slate-900 sm:text-[12px] tracking-tighter"
                          >
                            {line}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-base font-black text-white sm:text-xl">
                        {section.value}
                      </span>
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
