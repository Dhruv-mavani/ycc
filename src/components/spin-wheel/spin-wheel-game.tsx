"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Confetti from "react-confetti";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { playClickTrain, playNotes, type ActiveSound } from "@/lib/synth-sfx";
import { TeamPlayerGate, type GameTeamSelection } from "@/components/games/team-player-gate";

// ---------------------------------------------------------------------------
// Spin the Wheel — a solo, self-serve prize-wheel game (/spin-wheel). The
// player picks a number from 1 to 10, then spins a wheel: ten sections hold
// the numbers 1-10, and a handful of bonus-prize sections share the
// remaining SPECIAL_TOTAL_DEG of the circle. Two ways to win: the wheel
// lands on the player's own number, or it lands on any bonus-prize section.
//
// Which prizes are on offer is audience-dependent (see PRIZES_BY_SOURCE
// below) — a Box Cricket team or YCC Partner sees the single Goa Trip
// prize (matching this game's original spirit), while a Super Champs
// entrant sees three real-item prizes instead. The audience is only known
// once TeamPlayerGate resolves a code, so `prizes` is computed from
// `selection?.source` and stays fixed for the rest of that round — see
// `prizes` below.
//
// Win odds are deliberately real, if vanishingly tiny: landing on the
// player's own number, and landing on each individual bonus-prize section,
// are all independent 0.0000000001% (1-in-1,000,000,000,000) draws — set
// exactly, not simulated to look small while secretly being zero. The
// remaining ~100% is spread evenly across the other nine number sections
// (whichever the player didn't pick), which are always losing outcomes for
// that spin. There is no real prize behind any of these sections — same
// "just for fun" flavor for Goa Trip and the Super Champs items alike.
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

interface PrizeSection {
  id: string;
  emoji: string;
  // Stacked lines shown on the wheel slice itself — short, since a slice
  // only gets SPECIAL_TOTAL_DEG / prizes.length degrees of width.
  wheelLines: string[];
  // Full name, used in result-screen prose and the recorded play detail.
  name: string;
}

const GOA_TRIP: PrizeSection = {
  id: "goa",
  emoji: "🏖️",
  wheelLines: ["GOA TRIP", "WITH GANG", "(FREE TO ALL)"],
  name: "Goa Trip with Gang (free to all)",
};

const SUPERCHAMPS_PRIZES: PrizeSection[] = [
  { id: "sneakers", emoji: "👟", wheelLines: ["SNEAKERS"], name: "Nike Sneakers" },
  { id: "ps5", emoji: "🎮", wheelLines: ["PS5"], name: "PS5" },
  { id: "cycle", emoji: "🚲", wheelLines: ["CYCLE"], name: "Gear Cycle" },
];

// Box Cricket teams and YCC Partners see the original single Goa Trip
// prize; Super Champs entrants see three real-item prizes instead. Falls
// back to Goa Trip before a code is entered (source is still unknown) —
// the common case, so the start screen isn't stuck showing placeholder
// copy for most players.
function prizesFor(source: GameTeamSelection["source"] | undefined): PrizeSection[] {
  return source === "school" ? SUPERCHAMPS_PRIZES : [GOA_TRIP];
}

// Degrees the bonus-prize sections share, split evenly regardless of how
// many there are — 1 prize gets the full width (more spacious than a
// single number section), 3 prizes get a third each (still enough for an
// emoji + one short word). The 10 number sections always split the rest
// evenly, so they're a constant width no matter the prize count.
const SPECIAL_TOTAL_DEG = 120;
const NUM_SLICE_DEG = (360 - SPECIAL_TOTAL_DEG) / NUM_COUNT;

const PICKED_WIN_CHANCE = 0.000000000001; // 0.0000000001% — lands on the player's own number
const PRIZE_WIN_CHANCE = 0.000000000001; // 0.0000000001% — lands on any one bonus-prize section

const SPIN_MS = 4500; // must match the transition duration set on the wheel
const PRESPIN_MS = 300; // short beat between the click and the wheel moving
const READ_MS = 700; // pause on the landed section before the result screen
const EXTRA_SPINS = 6; // full rotations before the wheel settles

const NUMBER_COLORS = ["#fb923c", "#0e7490"] as const;
// A small gold/amber family so multiple prize sections stay visually
// grouped as "these are the bonus slices" while still being distinguishable
// from each other.
const PRIZE_COLORS = ["#facc15", "#f59e0b", "#eab308"] as const;

type WheelSection =
  | { kind: "number"; start: number; end: number; color: string; value: number }
  | { kind: "prize"; start: number; end: number; color: string; prize: PrizeSection };

// Builds the wheel's sections (10 numbers + one per prize) with each one's
// angular slice, computed fresh whenever `prizes` changes (i.e. once per
// round, when the audience is resolved) rather than off module-level
// constants — everything downstream (colors, the conic-gradient, spoke
// rotations, which section index wins) is derived from this single array.
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

// Center angle of a section, measured clockwise from the top (matches the
// conic-gradient's own "from 0deg" convention, i.e. 0 = top = 12 o'clock).
function sectionCenterAngle(section: WheelSection): number {
  return (section.start + section.end) / 2;
}

// Total clockwise rotation so `section`'s center ends up under the fixed
// pointer at the top, after `spins` extra full turns for effect.
function rotationFor(section: WheelSection, spins: number): number {
  const base = (360 - sectionCenterAngle(section)) % 360;
  return spins * 360 + base;
}

// Draws which section index the wheel lands on for this spin (an index
// into the `sections` array built by buildSections — 0..NUM_COUNT-1 are
// numbers, the rest are prizes, in prize order). `picked` is the player's
// chosen number (1-10). Every win path — the picked number, and each
// individual prize — is an explicit, independent draw at PICKED_WIN_CHANCE
// / PRIZE_WIN_CHANCE; everything else falls back to a uniform pick among
// the other nine (losing) number sections.
function drawSection(picked: number, prizeCount: number): number {
  const pickedIndex = picked - 1;
  const r = Math.random();
  if (r < PICKED_WIN_CHANCE) return pickedIndex;
  let acc = PICKED_WIN_CHANCE;
  for (let i = 0; i < prizeCount; i++) {
    acc += PRIZE_WIN_CHANCE;
    if (r < acc) return NUM_COUNT + i;
  }
  const losingIndexes = Array.from({ length: NUM_COUNT }, (_, i) => i).filter(
    (i) => i !== pickedIndex,
  );
  return losingIndexes[Math.floor(Math.random() * losingIndexes.length)];
}

type Phase = "start" | "pick" | "spinning" | "won" | "lost";

interface GameState {
  phase: Phase;
  picked: number | null;
  // Snapshotted at OPEN time from the resolved audience's prizes, so
  // SETTLE and rendering agree on what each section index means even if
  // `selection` were somehow to change mid-round.
  sections: WheelSection[];
  landedIndex: number | null;
}

type Action =
  | { type: "START" }
  | { type: "PICK"; n: number }
  | { type: "OPEN"; prizes: PrizeSection[] }
  | { type: "SETTLE" }
  | { type: "RESTART" };

function initialState(): GameState {
  return { phase: "start", picked: null, sections: [], landedIndex: null };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return { ...initialState(), phase: "pick" };
    case "PICK":
      return state.phase === "pick" ? { ...state, picked: action.n } : state;
    case "OPEN": {
      if (state.phase !== "pick" || state.picked === null) return state;
      const sections = buildSections(action.prizes);
      const landedIndex = drawSection(state.picked, action.prizes.length);
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
    case "RESTART":
      return { ...initialState(), phase: "pick" };
    default:
      return state;
  }
}

export function SpinWheelGame() {
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
    if (state.phase !== "won" && state.phase !== "lost") return;
    play(state.phase === "won" ? "win" : "lose");
    // Haptic buzz on reveal — a longer, punchier pattern for a win, a
    // single short one for a loss. Silently does nothing where unsupported
    // (desktop browsers, iOS Safari), so no feature check needed beyond the
    // optional call itself.
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
    const landed =
      state.landedIndex !== null ? state.sections[state.landedIndex] : null;
    fetch("/api/games/record-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameSlug: "spin-wheel",
        source: sel.source,
        teamRefId: sel.teamRefId,
        playerRefId: sel.playerRefId,
        result: state.phase,
        detail: {
          picked: state.picked,
          landedIndex: state.landedIndex,
          prizeId: landed?.kind === "prize" ? landed.prize.id : null,
        },
      }),
    }).catch(() => {});
  }, [state.phase, state.picked, state.landedIndex, state.sections]);

  function toggleMute() {
    setMuted((m) => {
      if (!m) stopSfx();
      return !m;
    });
  }

  // Fixed for the rest of the round the instant Play is clicked (selection
  // can't change after that point — TeamPlayerGate only renders on
  // "start"), so it's safe to recompute on every render rather than memo.
  const prizes = prizesFor(selection?.source);
  const prizeNames = prizes.map((p) => p.name).join(prizes.length > 2 ? ", " : " or ");

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
              Spin the wheel featuring {NUM_COUNT} numbered boxes
              {prizes.length > 1 ? ` + ${prizes.length} bonus boxes` : " + 1 bonus box"}.
            </li>
            <li>Hit your number or a bonus box — win {prizeNames}!</li>
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
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-amber-500/20 hover:scale-105 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40"
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
      // Stop the spin tick if we leave mid-spin (settle -> result, or the
      // back link). On a normal settle the parent then plays win/lose.
      stopSfxRef.current();
    };
  }, []);

  const wheelBackground = buildConicGradient(sections);
  const rotationDeg = spinning ? rotationFor(sections[landedIndex], EXTRA_SPINS) : 0;

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
