// Spin the Wheel's prize tables and the actual draw (who wins what) — pulled
// out of spin-wheel-level.tsx so the SAME odds/RNG can run authoritatively
// on the server (src/lib/game-plays.ts) instead of being computed in the
// browser and merely reported back. The client still imports this module
// too, for prizesFor()/NUM_COUNT/PICKED_WIN_CHANCE to build the wheel's
// visual sections — only drawSection's actual call now happens server-side;
// see level-up-roll/route.ts.

export const NUM_COUNT = 10;

export interface PrizeSection {
  id: string;
  emoji: string;
  wheelLines: string[];
  name: string;
  winChance: number;
}

export const CASH_PRIZE: PrizeSection = {
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
export const GOA_TRIP: PrizeSection = {
  id: "goa",
  emoji: "🏖️",
  wheelLines: ["GOA TRIP", "WITH GANG", "(FREE TO ALL)"],
  name: "Goa Trip with Gang (free to all)",
  winChance: 0.000000000001,
};

export const SUPERCHAMPS_PRIZES: PrizeSection[] = [
  { id: "sneakers", emoji: "👟", wheelLines: ["SNEAKERS"], name: "Nike Sneakers", winChance: 0.000000000001 },
  { id: "ps5", emoji: "🎮", wheelLines: ["PS5"], name: "PS5", winChance: 0.000000000001 },
  { id: "cycle", emoji: "🚲", wheelLines: ["CYCLE"], name: "Gear Cycle", winChance: 0.000000000001 },
];

export const SURPRISE_GIFT: PrizeSection = {
  id: "surprise",
  emoji: "🎁",
  wheelLines: ["SURPRISE", "GIFT"],
  name: "Surprise Gift",
  winChance: 0.0005, // 5 in 10,000 = 0.05%
};

export const PICKED_WIN_CHANCE = 0.000000000001;

// Audience is source-driven (school -> Super Champs' three real items,
// everyone else -> the single Cash Prize slice) except Go Goa Gone, which
// needs event-level granularity since it shares "registration" source with
// every other team event (Box Cricket, Plastic Ball, Tennis Ball, Partners
// Box Cricket) — those keep the Cash Prize, only Go Goa Gone gets its own
// Goa Trip slice back. See GameTeamSelection.eventSlug.
export function prizesFor(
  source: string | undefined,
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

/**
 * The actual draw — returns a 0-based index into [1..NUM_COUNT numbers,
 * then prizes]. Only ever called server-side now (level-up-roll route);
 * the client receives the result, it never computes it.
 */
export function drawSection(picked: number, prizes: PrizeSection[]): number {
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
