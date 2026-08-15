import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrationRequestSchema } from "@/lib/validations/registration";
import { calculateGst } from "@/lib/gst";
import { createTeamRegistration } from "@/lib/create-team-registration";

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

  if (input.type === "team") {
    const result = await createTeamRegistration(admin, {
      eventId: input.eventId,
      collegeId: input.collegeId,
      teamName: input.teamName,
      players: input.players,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      registrationId: result.registrationId,
      amountPaise: result.amountPaise,
      basePaise: result.basePaise,
      cgstPaise: result.cgstPaise,
      sgstPaise: result.sgstPaise,
      igstPaise: result.igstPaise,
    });
  }

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

  if (event.type !== "quiz") {
    return NextResponse.json(
      { error: "This event does not accept individual registrations" },
      { status: 400 },
    );
  }

  const { data: college } = await admin
    .from("colleges")
    .select("id")
    .eq("id", input.collegeId)
    .maybeSingle();

  if (!college) {
    return NextResponse.json({ error: "Select a valid college" }, { status: 400 });
  }

  const gst = calculateGst(event.fee_paise);

  const { data: registration, error: regError } = await admin
    .from("registrations")
    .insert({
      event_id: event.id,
      college_id: college.id,
      type: "individual",
      team_name: null,
      captain_name: input.name,
      captain_phone: input.phone,
      captain_email: null,
      amount_paise: gst.totalPaise,
      status: "pending_payment",
      referred_by_partner_id: input.referredByPartnerId ?? null,
    })
    .select("*")
    .single();

  if (regError || !registration) {
    return NextResponse.json(
      { error: "Could not create registration" },
      { status: 500 },
    );
  }

  const { error: participantsError } = await admin.from("participants").insert([
    {
      registration_id: registration.id,
      name: input.name,
      phone: input.phone as string | null,
      email: null as string | null,
      is_captain: false,
      age: input.age,
      gender: input.gender,
    },
  ]);

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
