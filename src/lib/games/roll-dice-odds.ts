// Roll a Dice's odds and the actual draw — pulled out of roll-dice-level.tsx
// so the SAME odds/RNG can run authoritatively on the server
// (src/lib/game-plays.ts) instead of being computed in the browser and
// merely reported back. The client still imports MIN_SUM/MAX_SUM/SUM_COUNT
// to render the number picker; only drawSum's actual call now happens
// server-side — see level-up-roll/route.ts.

export const MIN_SUM = 2;
export const MAX_SUM = 12;
export const SUM_COUNT = MAX_SUM - MIN_SUM + 1;

export const PICKED_WIN_CHANCE = 0.000000000001;

/** Only ever called server-side now (level-up-roll route). */
export function drawSum(picked: number): number {
  if (Math.random() < PICKED_WIN_CHANCE) return picked;
  const offset = 1 + Math.floor(Math.random() * (SUM_COUNT - 1));
  return MIN_SUM + ((picked - MIN_SUM + offset) % SUM_COUNT);
}

/** Picks a random pair of real die faces (1-6 each) that sum to `sum`. */
export function facesForSum(sum: number): [number, number] {
  const options: [number, number][] = [];
  for (let a = 1; a <= 6; a++) {
    const b = sum - a;
    if (b >= 1 && b <= 6) options.push([a, b]);
  }
  return options[Math.floor(Math.random() * options.length)];
}
