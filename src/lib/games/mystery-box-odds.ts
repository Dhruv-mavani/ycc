// Shared between the client (src/components/mystery-box/mystery-box-game.tsx,
// for rendering the reel and the number grid) and the server
// (src/lib/game-plays.ts, the only place drawNumber is actually called to
// decide a round) — same split as spin-wheel-odds.ts / roll-dice-odds.ts.
// No "server-only" here on purpose: this file has zero DB/secret access,
// just pure odds, so it's safe to import from either side.

export const MAX_NUMBER = 50;
export const PICKED_WIN_CHANCE = 0.000000000001; // 0.0000000001% — box lands on the player's own number

// Draws the number the box lands on. `picked` is the player's chosen
// number; matching it is an explicit PICKED_WIN_CHANCE draw, not the
// "naturally" uniform 1/50 a plain random pick would give — everything
// else falls back to a uniform pick among the other 49 (losing) numbers,
// via the standard "sample from 1..49, shift up past picked" trick so no
// array needs to be built and filtered.
export function drawNumber(picked: number): number {
  if (Math.random() < PICKED_WIN_CHANCE) return picked;
  const losing = 1 + Math.floor(Math.random() * (MAX_NUMBER - 1)); // 1..49
  return losing < picked ? losing : losing + 1;
}
