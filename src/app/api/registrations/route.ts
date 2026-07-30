import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrationRequestSchema } from "@/lib/validations/registration";
import { calculateGst } from "@/lib/gst";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registrationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  const { data: event, error: eventError } = await admin
    .from("events")
    .select("*")
    .eq("id", input.eventId)
    .eq("is_active", true)
    .maybeSingle();

  if (eventError || !event) {
    return NextResponse.json(
      { error: "Event not found or no longer accepting registrations" },
      { status: 404 },
    );
  }

  if (input.type === "team" && event.type !== "cricket") {
    return NextResponse.json(
      { error: "This event does not accept team registrations" },
      { status: 400 },
    );
  }
  if (input.type === "individual" && event.type !== "quiz") {
    return NextResponse.json(
      { error: "This event does not accept individual registrations" },
      { status: 400 },
    );
  }

  if (input.type === "team") {
    const min = event.min_team_size ?? 1;
    const max = event.max_team_size ?? 30;
    if (input.players.length < min || input.players.length > max) {
      return NextResponse.json(
        {
          error:
            min === max
              ? `Squad size must be exactly ${min} players`
              : `Squad size must be between ${min} and ${max} players`,
        },
        { status: 400 },
      );
    }
  }

  const { data: college } = await admin
    .from("colleges")
    .select("id")
    .eq("id", input.collegeId)
    .maybeSingle();

  if (!college) {
    return NextResponse.json({ error: "Select a valid college" }, { status: 400 });
  }

  // First player/the individual is the registration's primary contact —
  // 01-spec.md's form only collects name/college/mobile, no separate
  // "captain" fields or email.
  const primaryContact =
    input.type === "team"
      ? { name: input.players[0].name, phone: input.players[0].phone }
      : { name: input.name, phone: input.phone };

  const gst = calculateGst(event.fee_paise);

  const { data: registration, error: regError } = await admin
    .from("registrations")
    .insert({
      event_id: event.id,
      college_id: college.id,
      type: input.type,
      team_name: input.type === "team" ? input.teamName : null,
      captain_name: primaryContact.name,
      captain_phone: primaryContact.phone,
      captain_email: null,
      amount_paise: gst.totalPaise,
      status: "pending_payment",
    })
    .select("*")
    .single();

  if (regError || !registration) {
    return NextResponse.json(
      { error: "Could not create registration" },
      { status: 500 },
    );
  }

  const participantsToInsert =
    input.type === "team"
      ? input.players.map((p, index) => ({
          registration_id: registration.id,
          name: p.name,
          phone: p.phone as string | null,
          email: null as string | null,
          is_captain: index === 0,
        }))
      : [
          {
            registration_id: registration.id,
            name: input.name,
            phone: input.phone as string | null,
            email: null as string | null,
            is_captain: false,
          },
        ];

  const { error: participantsError } = await admin
    .from("participants")
    .insert(participantsToInsert);

  if (participantsError) {
    return NextResponse.json(
      { error: "Could not save participants" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    registrationId: registration.id,
    amountPaise: registration.amount_paise,
    basePaise: gst.basePaise,
    cgstPaise: gst.cgstPaise,
    sgstPaise: gst.sgstPaise,
    igstPaise: gst.igstPaise,
  });
}
