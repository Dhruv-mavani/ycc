import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { prizesFor, drawSection, NUM_COUNT } from "@/lib/games/spin-wheel-odds";
import { drawSum, facesForSum, MIN_SUM, MAX_SUM } from "@/lib/games/roll-dice-odds";
import { MAX_NUMBER, drawNumber } from "@/lib/games/mystery-box-odds";

/** Strips characters that are syntactically meaningful inside a PostgREST
 * `.or()` filter string — `,` separates conditions and `(`/`)` group them —
 * so a search term containing them can't inject extra filter clauses
 * instead of being matched as literal text. */
function sanitizeForOrFilter(value: string): string {
  return value.replace(/[,()]/g, "");
}

/** Reads an event's prize-tier config (see migration 0044) — top_tier_chance/
 * mid_tier_chance/mid_tier_prize_label, all null unless an admin has
 * explicitly set them up for this event (Kismat Ke Khiladi today). Returns
 * null when not configured, so callers can treat that as "tier system not
 * used here" with a single check. */
async function getEventPrizeTierConfig(
  eventSlug: string,
): Promise<{ topTierChance: number; midTierChance: number; midTierPrizeLabel: string | null } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("events")
    .select("top_tier_chance, mid_tier_chance, mid_tier_prize_label")
    .eq("slug", eventSlug)
    .maybeSingle();
  if (!data || data.top_tier_chance == null || data.mid_tier_chance == null) return null;
  return {
    topTierChance: data.top_tier_chance,
    midTierChance: data.mid_tier_chance,
    midTierPrizeLabel: data.mid_tier_prize_label,
  };
}

export const GAME_SLUGS = ["spin-wheel", "mystry-box", "roll-a-dice", "quiz-champion"] as const;
export type GameSlug = (typeof GAME_SLUGS)[number];

// One entry per code per game. Level Up's two legs (spin-wheel, roll-a-dice)
// are grouped together here — a run always writes one row of each, so
// checking either slug catches "already ran Level Up," while the two
// individual game_slugs stay separate in game_plays itself (unchanged,
// still paired back together by levelUpSessionId for admin insights).
export const LEVEL_UP_SLUGS = ["spin-wheel", "roll-a-dice"] as const satisfies readonly GameSlug[];

// Enforced here (app-level, check-then-insert — same pattern as the
// duplicate-team-name/phone checks in create-team-registration.ts), not as
// a DB unique constraint: game_plays already holds real pre-existing plays
// from before this restriction existed, and a retroactive constraint can't
// be added without deleting that real history. New plays only, from here on.
export type GameTeamSource = "registration" | "partner" | "school" | "individual_free";

export interface GamePlayer {
  id: string;
  name: string;
  isCaptain: boolean;
}

export interface GameTeamLookup {
  source: GameTeamSource;
  teamRefId: string;
  teamLabel: string;
  players: GamePlayer[];
  /** Only set for "registration" source — which event's team this is (e.g.
   * "ycc-go-goa-gone"), so a game can offer event-specific prizes/copy
   * beyond what the coarser `source` alone distinguishes. Every other
   * source maps to exactly one event already (school -> Super Champs,
   * individual_free -> Jackpot Heist), so it isn't needed there. */
  eventSlug?: string;
}

/**
 * Roster for a Box Cricket-style team registration, keyed by
 * registrations.id. Any one participant's unique_id resolves the whole
 * team, mirroring searchParticipants' "scan one, see the squad" behavior.
 *
 * Resolved via a single RPC (resolve_registration_roster, applied directly
 * to the DB — see `supabase/migrations` and the "resolve_registration_roster_rpc"
 * entry) instead of 3 separate PostgREST round-trips — under a burst of
 * concurrent "Spin"/"Roll" clicks, each round-trip holds a connection out
 * of PostgREST's shared pool, so collapsing this to 1 call noticeably eases
 * contention ahead of a high-traffic event. Only this source is worth the
 * tradeoff right now; see the migration's own comment for why.
 */
async function registrationRoster(
  registrationId: string,
): Promise<GameTeamLookup | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("resolve_registration_roster", {
    p_registration_id: registrationId,
  });
  if (error || !data) return null;

  const roster = data as {
    teamRefId: string;
    teamLabel: string;
    eventSlug: string | null;
    players: { id: string; name: string; isCaptain: boolean }[];
  };

  return {
    source: "registration",
    teamRefId: roster.teamRefId,
    teamLabel: roster.teamLabel,
    eventSlug: roster.eventSlug ?? undefined,
    players: roster.players,
  };
}

/**
 * Roster for a YCC Partner / Co-Partner, keyed by their
 * partner_program_applications.id. Mirrors searchClassPartners: the
 * Partner/Co-Partner is the "captain", classmates who attached to them are
 * the squad. A Partner with no classmates just resolves to themselves.
 */
async function partnerRoster(
  applicationId: string,
): Promise<GameTeamLookup | null> {
  const admin = createAdminClient();
  const { data: captain } = await admin
    .from("partner_program_applications")
    .select("id, name")
    .eq("id", applicationId)
    .in("partner_type", ["campus", "class"])
    .eq("status", "approved")
    .maybeSingle();
  if (!captain) return null;

  const { data: members } = await admin
    .from("partner_program_applications")
    .select("id, name")
    .eq("referred_by_id", captain.id)
    .eq("partner_type", "classmate")
    .eq("status", "approved")
    .order("name");

  const players: GamePlayer[] = [
    { id: captain.id, name: captain.name, isCaptain: true },
    ...(members ?? []).map((m) => ({ id: m.id, name: m.name, isCaptain: false })),
  ];

  return {
    source: "partner",
    teamRefId: captain.id,
    teamLabel: players.length > 1 ? `${captain.name}'s Squad` : captain.name,
    players,
    // Only set for the standing forcedTier test identities (see
    // TEST_PLAYER_FLAGS) — a real Partner code has no event of its own,
    // same as before.
    eventSlug: getForcedEventSlug("partner", captain.id),
  };
}

/**
 * Roster for a Super Champs individual registration, keyed by
 * school_tournament_registrations.id — always a single "player" (no
 * team/squad concept for this event), so the code just resolves to their
 * own name, same as a Partner with no Squad attached.
 */
async function schoolRoster(
  registrationId: string,
): Promise<GameTeamLookup | null> {
  const admin = createAdminClient();
  const { data: registration } = await admin
    .from("school_tournament_registrations")
    .select("id, name")
    .eq("id", registrationId)
    .maybeSingle();
  if (!registration) return null;

  return {
    source: "school",
    teamRefId: registration.id,
    teamLabel: registration.name,
    players: [{ id: registration.id, name: registration.name, isCaptain: false }],
  };
}

/**
 * Roster for a free individual registration like YCC Jackpot Heist, keyed by
 * individual_free_registrations.id — same shape as schoolRoster: a single
 * "player" resolving to their own name, no team/squad concept.
 */
async function individualFreeRoster(
  registrationId: string,
): Promise<GameTeamLookup | null> {
  const admin = createAdminClient();
  const { data: registration } = await admin
    .from("individual_free_registrations")
    .select("id, name")
    .eq("id", registrationId)
    .maybeSingle();
  if (!registration) return null;

  return {
    source: "individual_free",
    teamRefId: registration.id,
    teamLabel: registration.name,
    players: [{ id: registration.id, name: registration.name, isCaptain: false }],
  };
}

/**
 * Resolves any team member's Unique ID, a Partner/Co-Partner's team code or
 * Unique ID, a Super Champs personalized code, or a free-individual code
 * (e.g. YCC Jackpot Heist) into a roster. Registrations are tried first
 * (exact participant match), then the partner-program hierarchy, then
 * Super Champs, then free-individual registrations — the four id spaces
 * never collide since they're separate tables/uuids.
 */
export async function lookupGameTeamByCode(
  rawCode: string,
): Promise<GameTeamLookup | null> {
  const code = sanitizeForOrFilter(rawCode.trim().toUpperCase());
  if (!code) return null;
  const admin = createAdminClient();

  const { data: participant } = await admin
    .from("participants")
    .select("registration_id")
    .eq("unique_id", code)
    .maybeSingle();
  if (participant) {
    const roster = await registrationRoster(participant.registration_id);
    if (roster) return roster;
  }

  const { data: partner } = await admin
    .from("partner_program_applications")
    .select("id")
    .in("partner_type", ["campus", "class"])
    .eq("status", "approved")
    .or(`team_code.eq.${code},unique_id.eq.${code}`)
    .maybeSingle();
  if (partner) {
    const roster = await partnerRoster(partner.id);
    if (roster) return roster;
  }

  const { data: school } = await admin
    .from("school_tournament_registrations")
    .select("id")
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (school) {
    const roster = await schoolRoster(school.id);
    if (roster) return roster;
  }

  const { data: individualFree } = await admin
    .from("individual_free_registrations")
    .select("id")
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (individualFree) {
    const roster = await individualFreeRoster(individualFree.id);
    if (roster) return roster;
  }

  return null;
}

// Exported for quiz-session.ts (src/lib/games/quiz-session.ts) — the only
// other module that needs to resolve a roster by id rather than by code.
export function lookupGameTeamById(
  source: GameTeamSource,
  teamRefId: string,
): Promise<GameTeamLookup | null> {
  if (source === "registration") return registrationRoster(teamRefId);
  if (source === "partner") return partnerRoster(teamRefId);
  if (source === "school") return schoolRoster(teamRefId);
  return individualFreeRoster(teamRefId);
}

// Hardcoded flags for standing test/demo identities only — never anything
// a player can self-serve into. Keyed by "source:playerRefId".
//   - unlimitedPlays: exempt from the one-entry-per-code rule (applies
//     across every game uniformly, since hasAlreadyPlayed/
//     alreadyPlayedPlayerIds are the single shared choke point every
//     game's play/start call and the team-lookup route go through).
//   - forcedTier: forces every random draw to land on a specific outcome
//     instead of a real draw — "full" wins everything (Mystery Box, Spin
//     the Wheel matching the player's own pick, Roll a Dice, and — for
//     events with a prize-tier system like Kismat Ke Khiladi — the "top"
//     prize tier); "partial" wins the Spin the Wheel leg but loses Roll a
//     Dice (prize tier "mid"); "loss" loses everything (prize tier
//     "none"). None of these force a real jackpot/Cash-Prize/Sneakers
//     prize section, so a test play never looks like a fulfilled prize in
//     admin insights. Quiz Champion is skill-based, not a random draw —
//     this flag has no effect there, answers still have to actually be
//     correct.
//   - forcedEventSlug: a Partner-sourced lookup never resolves an eventSlug
//     on its own (see GameTeamLookup.eventSlug — only "registration"
//     rosters carry one), so without this a forcedTier identity's Level Up
//     run would never hit Kismat Ke Khiladi's own prize-tier UI (the
//     actual full-win/partial-win/full-loss screens these test codes exist
//     to preview) — it'd just fall back to the generic win/lose summary
//     with no ResultPanel at all. Set only alongside a forcedTier.
// Three standing Partner codes (all approved, non-self-serve applications
// under the founder's own name — not one-off test rows):
//   - ABHISHEK2801 / YCCPP041 — full win
//   - ABHISHEK2802 / YCCPP093 — partial win
//   - ABHISHEK2803 / YCCPP094 — full loss
// Add more "source:playerRefId" entries here for another standing tester
// identity — never add a player's own event-registration code here,
// since that id gets reused for its real result once their actual
// registration is checked in.
const TEST_PLAYER_FLAGS: Readonly<
  Record<
    string,
    { unlimitedPlays?: boolean; forcedTier?: ForcedResultTier; forcedEventSlug?: string }
  >
> = {
  "partner:e897e102-ad8f-440e-beaa-8a22965b7e2d": {
    unlimitedPlays: true,
    forcedTier: "full",
    forcedEventSlug: "kismat-ke-khiladi",
  }, // ABHISHEK2801
  "partner:e2daf778-f43a-4a63-9958-2aa9636f8072": {
    unlimitedPlays: true,
    forcedTier: "partial",
    forcedEventSlug: "kismat-ke-khiladi",
  }, // ABHISHEK2802
  "partner:f114a47c-6f2e-4afd-9465-ccfbdb718ed7": {
    unlimitedPlays: true,
    forcedTier: "loss",
    forcedEventSlug: "kismat-ke-khiladi",
  }, // ABHISHEK2803
};

export type ForcedResultTier = "full" | "partial" | "loss";

/** undefined for a real player — a real random draw happens as normal. */
function getForcedTier(source: GameTeamSource, playerRefId: string): ForcedResultTier | undefined {
  return TEST_PLAYER_FLAGS[`${source}:${playerRefId}`]?.forcedTier;
}

/** See forcedEventSlug above — undefined for a real player. */
function getForcedEventSlug(source: GameTeamSource, playerRefId: string): string | undefined {
  return TEST_PLAYER_FLAGS[`${source}:${playerRefId}`]?.forcedEventSlug;
}

// Exported for public-leaderboard.ts — a test play recorded under this
// exemption must never show up on the public leaderboard either.
export function isUnlimitedTestPlayer(source: GameTeamSource, playerRefId: string): boolean {
  return !!TEST_PLAYER_FLAGS[`${source}:${playerRefId}`]?.unlimitedPlays;
}

export function isAlwaysWinPlayer(source: GameTeamSource, playerRefId: string): boolean {
  return getForcedTier(source, playerRefId) === "full";
}

// Two plays per code per game (was one — see the session this bumped it,
// "they will get an alert that they can play only twice"). Level Up's two
// legs (spin-wheel, roll-a-dice) share one count — a run always writes
// exactly one spin-wheel row, so counting that slug alone counts *runs*,
// not legs; counting both slugs would double every run's real count.
export const MAX_PLAYS_PER_CODE = 2;

/** How many of the given game_slugs this exact code (source + player) has
 * already played — pass a single run-counting slug for Level Up (just
 * "spin-wheel", never both legs) so a completed run counts as 1, not 2. */
export async function getPlayCount(
  gameSlugs: readonly GameSlug[],
  source: GameTeamSource,
  playerRefId: string,
): Promise<number> {
  if (isUnlimitedTestPlayer(source, playerRefId)) return 0;
  const admin = createAdminClient();
  const { count } = await admin
    .from("game_plays")
    .select("id", { count: "exact", head: true })
    .in("game_slug", gameSlugs)
    .eq("source", source)
    .eq("player_ref_id", playerRefId);
  return count ?? 0;
}

/** The one-entry(-ish)-per-code-per-game gate, called right before a round
 * is drawn/a quiz session is started. attemptNumber is 1-based — 1 for a
 * fresh code, 2 for its second (and final) play. */
export async function getPlayStatus(
  gameSlugs: readonly GameSlug[],
  source: GameTeamSource,
  playerRefId: string,
): Promise<{ allowed: boolean; attemptNumber: number; playCount: number }> {
  const playCount = await getPlayCount(gameSlugs, source, playerRefId);
  return { allowed: playCount < MAX_PLAYS_PER_CODE, attemptNumber: playCount + 1, playCount };
}

/** Same count as getPlayCount, batched across a whole roster — used by the
 * team-lookup route to flag teammates' remaining chances up front, before
 * anyone picks a number/spins/starts a quiz, rather than only failing once
 * they try to play. */
export async function playCountsByPlayerId(
  gameSlugs: readonly GameSlug[],
  source: GameTeamSource,
  playerRefIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (playerRefIds.length === 0) return counts;
  const admin = createAdminClient();
  const { data } = await admin
    .from("game_plays")
    .select("player_ref_id")
    .in("game_slug", gameSlugs)
    .eq("source", source)
    .in("player_ref_id", playerRefIds);
  for (const row of data ?? []) {
    counts.set(row.player_ref_id, (counts.get(row.player_ref_id) ?? 0) + 1);
  }
  for (const id of playerRefIds) {
    if (isUnlimitedTestPlayer(source, id)) counts.set(id, 0);
  }
  return counts;
}

/**
 * Re-resolves teamRefId/playerRefId server-side (never trusts the client's
 * name/team strings) before writing a game_plays row, so a play can only
 * ever be attributed to a real player on a real team.
 */
export async function recordGamePlay(input: {
  gameSlug: GameSlug;
  source: GameTeamSource;
  teamRefId: string;
  playerRefId: string;
  result: "won" | "lost";
  detail?: Record<string, unknown>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const roster = await lookupGameTeamById(input.source, input.teamRefId);
  if (!roster) return { ok: false, error: "Team not found" };

  const player = roster.players.find((p) => p.id === input.playerRefId);
  if (!player) return { ok: false, error: "Player not found on this team" };

  if (!(await getPlayStatus([input.gameSlug], input.source, player.id)).allowed) {
    return {
      ok: false,
      error: `You've already used both your chances with this code — ${MAX_PLAYS_PER_CODE} plays per code.`,
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("game_plays").insert({
    game_slug: input.gameSlug,
    source: input.source,
    team_ref_id: roster.teamRefId,
    player_ref_id: player.id,
    player_name: player.name,
    team_label: roster.teamLabel,
    is_captain: player.isCaptain,
    result: input.result,
    detail: input.detail ?? null,
  });

  if (error) return { ok: false, error: "Could not record play" };
  return { ok: true };
}

export type LevelUpRollResult =
  | {
      ok: true;
      result: "won" | "lost";
      // Spin the Wheel only — a 0-based index into the client's own
      // sections array (built from the identical prizesFor() call), so it
      // can animate the wheel to the exact section the server drew.
      landedIndex?: number;
      // Roll a Dice only — the drawn total and a matching pair of real die
      // faces, so the client can animate the cube to that exact result.
      drawnSum?: number;
      dieFaces?: [number, number];
      // Roll a Dice only, and only for events with top_tier_chance/
      // mid_tier_chance configured (see the doc comment below) — the
      // prize tier this run landed, independent of whether the wheel/dice
      // actually matched the player's own picks. Undefined for every
      // event without tier config (i.e. every event except Kismat Ke
      // Khiladi today).
      prizeTier?: "top" | "mid" | "none";
      midTierPrizeLabel?: string;
      // Spin the Wheel only — which of the code's MAX_PLAYS_PER_CODE
      // chances this run is (1 or 2), for the client to display.
      attemptNumber?: number;
    }
  | { ok: false; error: string };

/**
 * The server-authoritative counterpart to recordGamePlay, used only by
 * Level Up (Kismat Ke Khiladi's Spin the Wheel / Roll a
 * Dice) — unlike recordGamePlay, this never accepts a client-asserted
 * `result`. The win/loss outcome is drawn here, server-side, using the
 * same odds tables the UI used to run in the browser (now in
 * src/lib/games/*-odds.ts), and the game_plays row is written in the same
 * call — before any animation plays on the client. That closes two things
 * at once: a visitor can no longer forge a "won" result by crafting their
 * own request (the server decides, not the request body), and leaving the
 * tab mid-animation can't be used to dodge or retry a result that's
 * already been drawn and recorded.
 */
export async function rollAndRecordLevelUpPlay(input: {
  level: "spin-wheel" | "roll-a-dice";
  source: GameTeamSource;
  teamRefId: string;
  playerRefId: string;
  picked: number;
  eventSlug?: string;
  levelUpSessionId: string;
}): Promise<LevelUpRollResult> {
  if (input.level === "spin-wheel") {
    if (!Number.isInteger(input.picked) || input.picked < 1 || input.picked > NUM_COUNT) {
      return { ok: false, error: "Invalid pick" };
    }
  } else {
    if (!Number.isInteger(input.picked) || input.picked < MIN_SUM || input.picked > MAX_SUM) {
      return { ok: false, error: "Invalid pick" };
    }
  }

  const roster = await lookupGameTeamById(input.source, input.teamRefId);
  if (!roster) return { ok: false, error: "Team not found" };

  const player = roster.players.find((p) => p.id === input.playerRefId);
  if (!player) return { ok: false, error: "Player not found on this team" };

  // Only gated at Level 1 (spin-wheel) — a run always starts there, so
  // blocking a third run there is enough; Level 2 (roll-a-dice) of the
  // *current* run must never be blocked just because it's about to write
  // its own first-ever row for this player. Counts only "spin-wheel" (not
  // both legs via LEVEL_UP_SLUGS) — a run always writes exactly one
  // spin-wheel row, so that alone counts runs, not legs.
  let attemptNumber: number | undefined;
  if (input.level === "spin-wheel") {
    const status = await getPlayStatus(["spin-wheel"], input.source, player.id);
    if (!status.allowed) {
      return {
        ok: false,
        error: `You've already used both your chances with this code — ${MAX_PLAYS_PER_CODE} plays per code.`,
      };
    }
    attemptNumber = status.attemptNumber;
  }

  let result: "won" | "lost";
  let detail: Record<string, unknown>;
  let response: LevelUpRollResult;

  const forcedTier = getForcedTier(input.source, player.id);

  if (input.level === "spin-wheel") {
    const prizes = prizesFor(input.source, input.eventSlug);
    // forcedTier "full"/"partial" (Spin the Wheel is the leg that wins in
    // both): lands on the player's own picked number — not a forced
    // jackpot prize section, so a test play never shows up in admin
    // insights looking like a fulfilled Cash Prize/Sneakers/etc. "loss":
    // lands on a different, still-non-prize section (picked % NUM_COUNT —
    // always within the plain sections, never equal to the winning index).
    const landedIndex =
      forcedTier === "full" || forcedTier === "partial"
        ? input.picked - 1
        : forcedTier === "loss"
          ? input.picked % NUM_COUNT
          : drawSection(input.picked, prizes);
    const landedIsPrize = landedIndex >= NUM_COUNT;
    const prize = landedIsPrize ? prizes[landedIndex - NUM_COUNT] : null;
    const won = landedIsPrize || landedIndex + 1 === input.picked;
    result = won ? "won" : "lost";
    detail = {
      picked: input.picked,
      landedIndex,
      prizeId: prize?.id ?? null,
      levelUpSessionId: input.levelUpSessionId,
    };
    response = { ok: true, result, landedIndex, attemptNumber };
  } else {
    // forcedTier "full": Roll a Dice also wins. "partial"/"loss": Roll a
    // Dice loses (that's what makes "partial" partial) — any sum other
    // than the pick, picked deterministically rather than randomly.
    const drawnSum =
      forcedTier === "full"
        ? input.picked
        : forcedTier === "partial" || forcedTier === "loss"
          ? input.picked === MIN_SUM ? MAX_SUM : MIN_SUM
          : drawSum(input.picked);
    const dieFaces = facesForSum(drawnSum);
    const won = input.picked === drawnSum;
    result = won ? "won" : "lost";

    // Separate, independently-calibrated prize-tier draw — only runs for
    // events with top_tier_chance/mid_tier_chance configured (Kismat Ke
    // Khiladi today; null for every other event, so this is a no-op
    // everywhere else). Deliberately decoupled from `won` above: the
    // wheel/dice's real win/lose outcome can't be tuned to hit two
    // independent target rates at once (verified — see the migration's
    // doc comment), so the tier is its own draw, not derived from
    // whether the player actually matched their picks. A forcedTier
    // identity skips the draw and maps straight to its tier instead
    // (full→top, partial→mid, loss→none).
    let prizeTier: "top" | "mid" | "none" | undefined;
    let midTierPrizeLabel: string | undefined;
    const eventConfig = input.eventSlug ? await getEventPrizeTierConfig(input.eventSlug) : null;
    if (eventConfig) {
      if (forcedTier === "full") prizeTier = "top";
      else if (forcedTier === "partial") prizeTier = "mid";
      else if (forcedTier === "loss") prizeTier = "none";
      else {
        const r = Math.random();
        if (r < eventConfig.topTierChance) prizeTier = "top";
        else if (r < eventConfig.topTierChance + eventConfig.midTierChance) prizeTier = "mid";
        else prizeTier = "none";
      }
      midTierPrizeLabel = eventConfig.midTierPrizeLabel ?? undefined;
    }

    detail = {
      picked: input.picked,
      drawnSum,
      dieFaces,
      levelUpSessionId: input.levelUpSessionId,
      ...(prizeTier ? { prizeTier, eventSlug: input.eventSlug } : {}),
    };
    response = { ok: true, result, drawnSum, dieFaces, prizeTier, midTierPrizeLabel };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("game_plays").insert({
    game_slug: input.level,
    source: input.source,
    team_ref_id: roster.teamRefId,
    player_ref_id: player.id,
    player_name: player.name,
    team_label: roster.teamLabel,
    is_captain: player.isCaptain,
    result,
    detail,
  });

  if (error) return { ok: false, error: "Could not record play" };
  return response;
}

export type MysteryBoxRollResult =
  | { ok: true; result: "won" | "lost"; drawn: number; attemptNumber: number }
  | { ok: false; error: string };

/**
 * Server-authoritative counterpart to Mystery Box's former client-side
 * drawNumber() call — same rationale as rollAndRecordLevelUpPlay above: the
 * client used to decide the drawn number itself and just report a
 * win/lost `result` to /api/games/record-play afterward, which a crafted
 * request could forge outright regardless of what the UI actually showed.
 * This draws the number here, server-side, and writes the game_plays row
 * in the same call — before the client's reel animation even starts — so
 * there's nothing left for the client to assert.
 */
export async function rollAndRecordMysteryBoxPlay(input: {
  source: GameTeamSource;
  teamRefId: string;
  playerRefId: string;
  picked: number;
}): Promise<MysteryBoxRollResult> {
  if (!Number.isInteger(input.picked) || input.picked < 1 || input.picked > MAX_NUMBER) {
    return { ok: false, error: "Invalid pick" };
  }

  const roster = await lookupGameTeamById(input.source, input.teamRefId);
  if (!roster) return { ok: false, error: "Team not found" };

  const player = roster.players.find((p) => p.id === input.playerRefId);
  if (!player) return { ok: false, error: "Player not found on this team" };

  const status = await getPlayStatus(["mystry-box"], input.source, player.id);
  if (!status.allowed) {
    return {
      ok: false,
      error: `You've already used both your chances with this code — ${MAX_PLAYS_PER_CODE} plays per code.`,
    };
  }

  const drawn = isAlwaysWinPlayer(input.source, player.id) ? input.picked : drawNumber(input.picked);
  const result: "won" | "lost" = drawn === input.picked ? "won" : "lost";

  const admin = createAdminClient();
  const { error } = await admin.from("game_plays").insert({
    game_slug: "mystry-box",
    source: input.source,
    team_ref_id: roster.teamRefId,
    player_ref_id: player.id,
    player_name: player.name,
    team_label: roster.teamLabel,
    is_captain: player.isCaptain,
    result,
    detail: { picked: input.picked, drawn },
  });

  if (error) return { ok: false, error: "Could not record play" };
  return { ok: true, result, drawn, attemptNumber: status.attemptNumber };
}
