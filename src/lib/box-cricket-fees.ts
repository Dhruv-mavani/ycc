// Box Cricket (cricket-championship-2026) charges a flat ₹29/player fee on
// top of the ₹999 team entry fee — covers each player's digital ID card +
// registration form (see the poster). Folded into the single Razorpay
// charge (and the registration's amount_paise) alongside the team fee, so
// there's one payment, not a separate cash collection for this part.
export const BOX_CRICKET_SLUG = "cricket-championship-2026";
export const BOX_CRICKET_PLAYER_FEE_PAISE = 2900;

/** 0 for any event other than Box Cricket — callers can add this straight
 * onto the team fee's total with no extra branching. */
export function boxCricketPlayerFeeTotalPaise(
  eventSlug: string,
  squadSize: number,
): number {
  return eventSlug === BOX_CRICKET_SLUG ? BOX_CRICKET_PLAYER_FEE_PAISE * squadSize : 0;
}
