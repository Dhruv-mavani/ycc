import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import { applyGst } from "@/lib/gst";
import { confirmPayAtVenueRegistration } from "@/lib/confirm-pay-at-venue-registration";
import type { TeamRegistrationResult } from "@/lib/create-team-registration";

// Events that take an open, one-person entry through this flow. Anything
// else (the quiz has its own partner-referred individual flow) is refused.
const SELF_INDIVIDUAL_EVENT_SLUGS = ["ycc-go-goa-gone"];

export interface CreateSelfIndividualRegistrationInput {
  eventId: string;
  collegeId: string;
  name: string;
  phone: string;
  email?: string | null;
  /** Optional YCC College Campus Partner who referred this person. */
  referredByCollegeCampusPartnerId?: string | null;
}

/**
 * Creates a `registrations` row (type "individual") plus its single
 * `participants` row. Stored in the same tables as a team registration so
 * the games, receipts, admin stats and College Campus Partner insights all
 * keep working unchanged — a one-person roster is already handled by the
 * game gate and the receipt builder.
 */
export async function createSelfIndividualRegistration(
  admin: ReturnType<typeof createAdminClient>,
  input: CreateSelfIndividualRegistrationInput,
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

  if (!SELF_INDIVIDUAL_EVENT_SLUGS.includes(event.slug)) {
    return {
      ok: false,
      status: 400,
      error: "This event does not accept individual registrations",
    };
  }

  if (!event.registration_open) {
    return {
      ok: false,
      status: 403,
      error: "Registration for this event is not open yet",
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

  // Checked against every confirmed registration for this event, not just
  // individual ones — a person already rostered on an earlier team entry
  // (before this event switched to individuals) shouldn't be able to enter
  // a second time. Only confirmed rows count so an abandoned attempt is
  // still retryable.
  const { data: existing } = await admin
    .from("participants")
    .select("id, registrations!inner(event_id, status)")
    .eq("phone", input.phone)
    .eq("registrations.event_id", event.id)
    .eq("registrations.status", "confirmed")
    .limit(1);

  if (existing && existing.length > 0) {
    return {
      ok: false,
      status: 409,
      error: "This phone number is already registered for this event",
    };
  }

  const gst = applyGst(event.fee_paise, event.gst_exempt);

  const { data: registration, error: regError } = await admin
    .from("registrations")
    .insert({
      event_id: event.id,
      college_id: college.id,
      type: "individual",
      team_name: null,
      captain_name: input.name,
      captain_phone: input.phone,
      captain_email: input.email || null,
      amount_paise: gst.totalPaise,
      status: "pending_payment",
      referred_by_college_campus_partner_id:
        input.referredByCollegeCampusPartnerId || null,
    })
    .select("*")
    .single();

  if (regError || !registration) {
    return { ok: false, status: 500, error: "Could not create registration" };
  }

  const { error: participantError } = await admin.from("participants").insert({
    registration_id: registration.id,
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    is_captain: false,
  });

  if (participantError) {
    // Don't leave a participant-less registration behind (it's the row we
    // just created, so removing it is safe).
    await admin.from("registrations").delete().eq("id", registration.id);
    return { ok: false, status: 500, error: "Could not save your details" };
  }

  if (event.pay_at_venue) {
    await confirmPayAtVenueRegistration(admin, registration.id);
  }

  return {
    ok: true,
    registrationId: registration.id,
    amountPaise: registration.amount_paise,
    basePaise: gst.basePaise,
    cgstPaise: gst.cgstPaise,
    sgstPaise: gst.sgstPaise,
    igstPaise: gst.igstPaise,
    confirmed: event.pay_at_venue,
  };
}
