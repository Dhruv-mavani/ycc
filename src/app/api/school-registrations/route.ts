import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { schoolRegistrationSchema } from "@/lib/validations/registration";

/**
 * Personalized certificate code: first 4 letters of the name (uppercased,
 * padded if shorter) + first 4 digits of the WhatsApp number.
 * e.g. "Abhishek", "9825xxxxxx" -> "ABHI9825".
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
  const parsed = schoolRegistrationSchema.safeParse(body);

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

  if (!event || event.type !== "school") {
    return NextResponse.json(
      { error: "Event not found or not accepting this kind of registration" },
      { status: 404 },
    );
  }

  const code = generateCode(input.name, input.whatsapp);

  const { data: registration, error } = await admin
    .from("school_tournament_registrations")
    .insert({
      event_id: input.eventId,
      name: input.name,
      email: input.email || null,
      whatsapp: input.whatsapp,
      instagram_handle: input.instagramHandle || null,
      age: input.age,
      gender: input.gender,
      school_id: input.schoolId || null,
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
