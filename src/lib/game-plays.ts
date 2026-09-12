import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const GAME_SLUGS = ["spin-wheel", "mystry-box"] as const;
export type GameSlug = (typeof GAME_SLUGS)[number];

export interface GamePlayer {
  id: string;
  name: string;
  isCaptain: boolean;
}

export interface GameTeamLookup {
  source: "registration" | "partner";
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
 * Resolves any team member's Unique ID, or a Partner/Co-Partner's team code
 * or Unique ID, into a roster. Registrations are tried first (exact
 * participant match), falling back to the partner-program hierarchy — the
 * two id spaces never collide since they're separate tables/uuids.
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

  return null;
}

function lookupGameTeamById(
  source: "registration" | "partner",
  teamRefId: string,
): Promise<GameTeamLookup | null> {
  return source === "registration"
    ? registrationRoster(teamRefId)
    : partnerRoster(teamRefId);
}

/**
 * Re-resolves teamRefId/playerRefId server-side (never trusts the client's
 * name/team strings) before writing a game_plays row, so a play can only
 * ever be attributed to a real player on a real team.
 */
export async function recordGamePlay(input: {
  gameSlug: GameSlug;
  source: "registration" | "partner";
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
