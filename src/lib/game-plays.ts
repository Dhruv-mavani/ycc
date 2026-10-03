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

export const GAME_SLUGS = ["spin-wheel", "mystry-box", "roll-a-dice", "quiz-champion"] as const;
export type GameSlug = (typeof GAME_SLUGS)[number];

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
    }
  | { ok: false; error: string };

/**
 * The server-authoritative counterpart to recordGamePlay, used only by
 * Level Up (Kismat Ke Khiladi ft. Go Goa Gone's Spin the Wheel / Roll a
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

  let result: "won" | "lost";
  let detail: Record<string, unknown>;
  let response: LevelUpRollResult;

  if (input.level === "spin-wheel") {
    const prizes = prizesFor(input.source, input.eventSlug);
    const landedIndex = drawSection(input.picked, prizes);
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
    response = { ok: true, result, landedIndex };
  } else {
    const drawnSum = drawSum(input.picked);
    const dieFaces = facesForSum(drawnSum);
    const won = input.picked === drawnSum;
    result = won ? "won" : "lost";
    detail = {
      picked: input.picked,
      drawnSum,
      dieFaces,
      levelUpSessionId: input.levelUpSessionId,
    };
    response = { ok: true, result, drawnSum, dieFaces };
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
  | { ok: true; result: "won" | "lost"; drawn: number }
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

  const drawn = drawNumber(input.picked);
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
  return { ok: true, result, drawn };
}
