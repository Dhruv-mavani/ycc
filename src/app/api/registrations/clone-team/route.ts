import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTeamRegistration } from "@/lib/create-team-registration";

// Purpose-built, not a generic "clone any team to any event" endpoint:
// only ever copies a confirmed Go Goa Gone team (captain + squad names,
// phones, college) into a fresh Box Cricket Tournament registration. Lets
// a captain who already typed all this once for Go Goa Gone enter Box
// Cricket with one tap on the level-up game's summary screen, instead of
// re-typing the same 7-player squad in a second form. All the real
// validation (registration open, squad size, duplicate team/phones) is
// still enforced by createTeamRegistration — this just supplies the input.
const SOURCE_EVENT_SLUG = "ycc-go-goa-gone";
const TARGET_EVENT_SLUG = "cricket-championship-2026";

const bodySchema = z.object({
  sourceRegistrationId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: source } = await admin
    .from("registrations")
    .select("id, type, status, college_id, team_name, captain_email, events!inner(slug)")
    .eq("id", parsed.data.sourceRegistrationId)
    .eq("type", "team")
    .eq("status", "confirmed")
    .eq("events.slug", SOURCE_EVENT_SLUG)
    .maybeSingle();

  if (!source) {
    return NextResponse.json(
      { error: "Couldn't find your Go Goa Gone team registration" },
      { status: 404 },
    );
  }

  const { data: participants } = await admin
    .from("participants")
    .select("name, phone, is_captain")
    .eq("registration_id", source.id)
    .order("is_captain", { ascending: false })
    .order("created_at");

  if (!participants || participants.length === 0) {
    return NextResponse.json(
      { error: "Couldn't find your squad — please register manually instead" },
      { status: 404 },
    );
  }

  const { data: targetEvent } = await admin
    .from("events")
    .select("id")
    .eq("slug", TARGET_EVENT_SLUG)
    .eq("is_active", true)
    .maybeSingle();

  if (!targetEvent) {
    return NextResponse.json(
      { error: "Box Cricket Tournament isn't available right now" },
      { status: 404 },
    );
  }

  const result = await createTeamRegistration(admin, {
    eventId: targetEvent.id,
    collegeId: source.college_id,
    teamName: source.team_name ?? participants[0].name,
    captainEmail: source.captain_email,
    players: participants.map((p) => ({
      name: p.name,
      phone: p.phone ?? undefined,
    })),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    registrationId: result.registrationId,
    amountPaise: result.amountPaise,
    confirmed: result.confirmed,
    teamName: source.team_name,
  });
}
