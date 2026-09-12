import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const GAME_SLUGS = ["spin-wheel", "mystry-box"] as const;
export type GameSlug = (typeof GAME_SLUGS)[number];

export type GameTeamSource = "registration" | "partner" | "school";

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
}

/**
 * Roster for a Box Cricket-style team registration, keyed by
 * registrations.id. Any one participant's unique_id resolves the whole
 * team, mirroring searchParticipants' "scan one, see the squad" behavior.
 */
async function registrationRoster(
  registrationId: string,
): Promise<GameTeamLookup | null> {
  const admin = createAdminClient();
  const { data: registration } = await admin
    .from("registrations")
    .select("id, team_name")
    .eq("id", registrationId)
    .eq("status", "confirmed")
    .maybeSingle();
  if (!registration) return null;

  const { data: participants } = await admin
    .from("participants")
    .select("id, name, is_captain")
    .eq("registration_id", registrationId)
    .order("is_captain", { ascending: false })
    .order("created_at");
  if (!participants || participants.length === 0) return null;

  return {
    source: "registration",
    teamRefId: registration.id,
    teamLabel:
      registration.team_name ??
      participants.find((p) => p.is_captain)?.name ??
      participants[0].name,
    players: participants.map((p) => ({
      id: p.id,
      name: p.name,
      isCaptain: p.is_captain,
    })),
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
 * Resolves any team member's Unique ID, a Partner/Co-Partner's team code or
 * Unique ID, or a Super Champs personalized code, into a roster.
 * Registrations are tried first (exact participant match), then the
 * partner-program hierarchy, then Super Champs — the three id spaces never
 * collide since they're separate tables/uuids.
 */
export async function lookupGameTeamByCode(
  rawCode: string,
): Promise<GameTeamLookup | null> {
  const code = rawCode.trim().toUpperCase();
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

  return null;
}

function lookupGameTeamById(
  source: GameTeamSource,
  teamRefId: string,
): Promise<GameTeamLookup | null> {
  if (source === "registration") return registrationRoster(teamRefId);
  if (source === "partner") return partnerRoster(teamRefId);
  return schoolRoster(teamRefId);
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
