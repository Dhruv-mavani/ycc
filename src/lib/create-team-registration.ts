import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import { calculateGst } from "@/lib/gst";

export interface CreateTeamRegistrationInput {
  eventId: string;
  collegeId: string;
  teamName: string;
  players: { name: string; phone: string }[];
}

export type TeamRegistrationResult =
  | {
      ok: true;
      registrationId: string;
      amountPaise: number;
      basePaise: number;
      cgstPaise: number;
      sgstPaise: number;
      igstPaise: number;
    }
  | { ok: false; status: number; error: string };

/**
 * Creates a `registrations` row + one `participants` row per player, for a
 * team ("cricket") registration. Shared by the public registration API
 * (src/app/api/registrations/route.ts) and the YCC Co-Partner team
 * registration route, which builds its player list from already-approved
 * Classmate Partner records instead of a fresh form — both need identical
 * downstream behavior (GST calc, pending_payment status, Razorpay flow).
 */
export async function createTeamRegistration(
  admin: ReturnType<typeof createAdminClient>,
  input: CreateTeamRegistrationInput,
): Promise<TeamRegistrationResult> {
  const { data: event, error: eventError } = await admin
    .from("events")
    .select("*")
    .eq("id", input.eventId)
    .eq("is_active", true)
    .maybeSingle();

  if (eventError || !event) {
    return {
      ok: false,
      status: 404,
      error: "Event not found or no longer accepting registrations",
    };
  }

  if (event.type !== "cricket") {
    return {
      ok: false,
      status: 400,
      error: "This event does not accept team registrations",
    };
  }

  const min = event.min_team_size ?? 1;
  const max = event.max_team_size ?? 30;
  if (input.players.length < min || input.players.length > max) {
    return {
      ok: false,
      status: 400,
      error:
        min === max
          ? `Squad size must be exactly ${min} players`
          : `Squad size must be between ${min} and ${max} players`,
    };
  }

  const { data: college } = await admin
    .from("colleges")
    .select("id")
    .eq("id", input.collegeId)
    .maybeSingle();

  if (!college) {
    return { ok: false, status: 400, error: "Select a valid college" };
  }

  const primaryContact = { name: input.players[0].name, phone: input.players[0].phone };
  const gst = calculateGst(event.fee_paise);

  const { data: registration, error: regError } = await admin
    .from("registrations")
    .insert({
      event_id: event.id,
      college_id: college.id,
      type: "team",
      team_name: input.teamName,
      captain_name: primaryContact.name,
      captain_phone: primaryContact.phone,
      captain_email: null,
      amount_paise: gst.totalPaise,
      status: "pending_payment",
    })
    .select("*")
    .single();

  if (regError || !registration) {
    return { ok: false, status: 500, error: "Could not create registration" };
  }

  const { error: participantsError } = await admin.from("participants").insert(
    input.players.map((p, index) => ({
      registration_id: registration.id,
      name: p.name,
      phone: p.phone as string | null,
      email: null as string | null,
      is_captain: index === 0,
    })),
  );

  if (participantsError) {
    return { ok: false, status: 500, error: "Could not save participants" };
  }

  return {
    ok: true,
    registrationId: registration.id,
    amountPaise: registration.amount_paise,
    basePaise: gst.basePaise,
    cgstPaise: gst.cgstPaise,
    sgstPaise: gst.sgstPaise,
    igstPaise: gst.igstPaise,
  };
}
