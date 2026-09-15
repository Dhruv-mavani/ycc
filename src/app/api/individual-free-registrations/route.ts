import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { individualFreeRegistrationSchema } from "@/lib/validations/registration";

/**
 * Personalized code — same scheme as school_tournament_registrations:
 * first 4 letters of the name (uppercased, padded) + first 4 digits of the
 * WhatsApp number. e.g. "Dhruv", "9825xxxxxx" -> "DHRU9825".
 */
function generateCode(name: string, whatsapp: string): string {
  const namePart = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const phonePart = whatsapp.replace(/\D/g, "").slice(0, 4);
  return `${namePart}${phonePart}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = individualFreeRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, type")
    .eq("id", input.eventId)
    .eq("is_active", true)
    .maybeSingle();

  if (!event || event.type !== "individual_free") {
    return NextResponse.json(
      { error: "Event not found or not accepting this kind of registration" },
      { status: 404 },
    );
  }

  const code = generateCode(input.name, input.whatsapp);

  const { data: registration, error } = await admin
    .from("individual_free_registrations")
    .insert({
      event_id: input.eventId,
      college_id: input.collegeId || null,
      name: input.name,
      whatsapp: input.whatsapp,
      email: input.email,
      age: input.age,
      gender: input.gender,
      code,
    })
    .select("id")
    .single();

  if (error || !registration) {
    return NextResponse.json(
      { error: "Could not save registration" },
      { status: 500 },
    );
  }

  return NextResponse.json({ registrationId: registration.id, code });
}
