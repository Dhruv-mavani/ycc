import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { lookupGameTeamById, type GameTeamSource } from "@/lib/game-plays";

// Backs the "Don't be sad — want to come to Goa with us?" opt-in shown on
// Level Up's summary screen after a genuine double loss (no prize tier
// either). Re-resolves the real player via the same roster lookup every
// other game route uses — never trusts a client-supplied name/team label
// — and records a phone number straight from that player's own
// registration/application record, not anything the browser sent.

async function resolvePhone(
  admin: ReturnType<typeof createAdminClient>,
  source: GameTeamSource,
  playerRefId: string,
): Promise<string | null> {
  switch (source) {
    case "registration": {
      const { data } = await admin
        .from("participants")
        .select("phone")
        .eq("id", playerRefId)
        .maybeSingle();
      return data?.phone ?? null;
    }
    case "partner": {
      const { data } = await admin
        .from("partner_program_applications")
        .select("mobile")
        .eq("id", playerRefId)
        .maybeSingle();
      return data?.mobile ?? null;
    }
    case "school": {
      const { data } = await admin
        .from("school_tournament_registrations")
        .select("whatsapp")
        .eq("id", playerRefId)
        .maybeSingle();
      return data?.whatsapp ?? null;
    }
    case "individual_free": {
      const { data } = await admin
        .from("individual_free_registrations")
        .select("whatsapp")
        .eq("id", playerRefId)
        .maybeSingle();
      return data?.whatsapp ?? null;
    }
  }
}

export async function recordGoaTripInterest(
  source: GameTeamSource,
  teamRefId: string,
  playerRefId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const roster = await lookupGameTeamById(source, teamRefId);
  const player = roster?.players.find((p) => p.id === playerRefId);
  if (!roster || !player) {
    return { ok: false, error: "Could not verify your registration." };
  }

  const admin = createAdminClient();
  const phone = await resolvePhone(admin, source, playerRefId);

  const { error } = await admin.from("goa_trip_interest").upsert(
    {
      source,
      player_ref_id: player.id,
      team_ref_id: roster.teamRefId,
      player_name: player.name,
      team_label: roster.teamLabel,
      phone,
    },
    { onConflict: "source,player_ref_id" },
  );

  if (error) return { ok: false, error: "Could not save your response." };
  return { ok: true };
}
