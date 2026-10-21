import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GameTeamSource } from "@/lib/game-plays";

// Backs the numbered prize picker shown on Level Up's summary screen when
// a Kismat Ke Khiladi run lands the top prize tier (see
// rollAndRecordLevelUpPlay's prizeTier draw in game-plays.ts). Re-verifies
// everything server-side from the already-recorded roll-a-dice row —
// never trusts a client-asserted "I won the top tier" or "my event is
// Kismat Ke Khiladi" claim.

interface VerifiedTopTierWin {
  eventId: string;
  registrationId: string;
}

async function verifyTopTierWin(
  admin: ReturnType<typeof createAdminClient>,
  source: GameTeamSource,
  playerRefId: string,
  levelUpSessionId: string,
): Promise<VerifiedTopTierWin | null> {
  const { data: play } = await admin
    .from("game_plays")
    .select("detail")
    .eq("game_slug", "roll-a-dice")
    .eq("source", source)
    .eq("player_ref_id", playerRefId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const detail = play?.detail as
    | { levelUpSessionId?: string; prizeTier?: string; eventSlug?: string }
    | null;
  if (!detail || detail.levelUpSessionId !== levelUpSessionId || detail.prizeTier !== "top" || !detail.eventSlug) {
    return null;
  }

  const { data: event } = await admin
    .from("events")
    .select("id")
    .eq("slug", detail.eventSlug)
    .maybeSingle();
  if (!event) return null;

  // prizeTier is only ever set for source "registration" (eventSlug only
  // reaches here via GameTeamLookup.eventSlug, which is registration-only
  // — see its doc comment in game-plays.ts), so playerRefId is always a
  // participants.id here, one participant per one real registration for
  // this event's self-registration flow.
  const { data: participant } = await admin
    .from("participants")
    .select("registration_id")
    .eq("id", playerRefId)
    .maybeSingle();
  if (!participant) return null;

  return { eventId: event.id, registrationId: participant.registration_id };
}

export interface PrizeSlotView {
  slotNumber: number;
  available: boolean;
}

export async function getPrizeSlots(
  source: GameTeamSource,
  playerRefId: string,
  levelUpSessionId: string,
): Promise<{ ok: true; slots: PrizeSlotView[]; alreadyClaimed: string | null } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const verified = await verifyTopTierWin(admin, source, playerRefId, levelUpSessionId);
  if (!verified) return { ok: false, error: "Not eligible for a prize pick." };

  const { data } = await admin
    .from("event_prize_slots")
    .select("slot_number, prize_name, claimed_by_registration_id")
    .eq("event_id", verified.eventId)
    .order("slot_number");

  const rows = data ?? [];
  const mine = rows.find((s) => s.claimed_by_registration_id === verified.registrationId);
  return {
    ok: true,
    slots: rows.map((s) => ({ slotNumber: s.slot_number, available: !s.claimed_by_registration_id })),
    alreadyClaimed: mine?.prize_name ?? null,
  };
}

export async function claimPrizeSlot(
  source: GameTeamSource,
  playerRefId: string,
  levelUpSessionId: string,
  slotNumber: number,
): Promise<{ ok: true; prizeName: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const verified = await verifyTopTierWin(admin, source, playerRefId, levelUpSessionId);
  if (!verified) return { ok: false, error: "Not eligible for a prize pick." };

  // One pick per winner — if they already claimed a number (e.g. a
  // refresh or a second tab), hand back the same prize instead of trying
  // to claim a second one.
  const { data: existing } = await admin
    .from("event_prize_slots")
    .select("prize_name")
    .eq("event_id", verified.eventId)
    .eq("claimed_by_registration_id", verified.registrationId)
    .maybeSingle();
  if (existing) return { ok: true, prizeName: existing.prize_name };

  // Atomic claim — WHERE claimed_by_registration_id IS NULL means two
  // simultaneous requests for the same slot can't both succeed; the
  // loser's update matches zero rows and .maybeSingle() comes back null.
  const { data: claimed } = await admin
    .from("event_prize_slots")
    .update({ claimed_by_registration_id: verified.registrationId, claimed_at: new Date().toISOString() })
    .eq("event_id", verified.eventId)
    .eq("slot_number", slotNumber)
    .is("claimed_by_registration_id", null)
    .select("prize_name")
    .maybeSingle();

  if (!claimed) {
    return { ok: false, error: "That number was already taken — pick another." };
  }
  return { ok: true, prizeName: claimed.prize_name };
}
