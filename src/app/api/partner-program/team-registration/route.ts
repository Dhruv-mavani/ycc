import { NextResponse } from "next/server";
import { getPartnerAccessStatus } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTeamRegistration } from "@/lib/create-team-registration";
import type { PartnerTeam } from "@/lib/supabase/types";

const REQUIRED_TEAMMATES = 5; // Class Partner (captain) + 5 = squad of 6

async function loadTeamStatus(
  admin: ReturnType<typeof createAdminClient>,
  classPartnerId: string,
  registrationId: string | null,
) {
  if (!registrationId)
    return { registrationId: null, status: null, amountPaise: null, participants: [] };
  const { data } = await admin
    .from("registrations")
    .select("id, status, amount_paise")
    .eq("id", registrationId)
    .maybeSingle();

  let participants: { id: string; name: string; uniqueId: string | null }[] = [];
  if (data?.status === "confirmed") {
    const { data: rows } = await admin
      .from("participants")
      .select("id, name, unique_id")
      .eq("registration_id", registrationId)
      .order("is_captain", { ascending: false })
      .order("created_at");
    participants = (rows ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      uniqueId: p.unique_id,
    }));
  }

  return {
    registrationId: data?.id ?? null,
    status: data?.status ?? null,
    amountPaise: data?.amount_paise ?? null,
    participants,
  };
}

export async function GET() {
  const access = await getPartnerAccessStatus();
  if (access.state !== "approved" || access.application.partnerType !== "class") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [{ data: self }, { data: classmates }] = await Promise.all([
    admin
      .from("partner_program_applications")
      .select("id, team_a_registration_id, team_b_registration_id")
      .eq("id", access.application.id)
      .single(),
    admin
      .from("partner_program_applications")
      .select("id, team")
      .eq("referred_by_id", access.application.id)
      .eq("partner_type", "classmate")
      .eq("status", "approved"),
  ]);

  const counts = { A: 0, B: 0 };
  for (const c of classmates ?? []) {
    if (c.team === "A") counts.A++;
    if (c.team === "B") counts.B++;
  }

  const [teamA, teamB] = await Promise.all([
    loadTeamStatus(admin, access.application.id, self?.team_a_registration_id ?? null),
    loadTeamStatus(admin, access.application.id, self?.team_b_registration_id ?? null),
  ]);

  return NextResponse.json({
    requiredTeammates: REQUIRED_TEAMMATES,
    teams: { A: { memberCount: counts.A, ...teamA }, B: { memberCount: counts.B, ...teamB } },
  });
}

export async function POST(request: Request) {
  const access = await getPartnerAccessStatus();
  if (access.state !== "approved" || access.application.partnerType !== "class") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const team: PartnerTeam | undefined = body?.team;
  if (team !== "A" && team !== "B") {
    return NextResponse.json({ error: "Invalid team" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: self } = await admin
    .from("partner_program_applications")
    .select("id, name, mobile, college_id, team_a_registration_id, team_b_registration_id")
    .eq("id", access.application.id)
    .single();

  if (!self) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const existingRegistrationId =
    team === "A" ? self.team_a_registration_id : self.team_b_registration_id;
  if (existingRegistrationId) {
    return NextResponse.json(
      { error: `Team ${team} is already registered`, registrationId: existingRegistrationId },
      { status: 409 },
    );
  }

  if (!self.college_id) {
    return NextResponse.json(
      { error: "Your Class Partner application is missing a college" },
      { status: 400 },
    );
  }

  const { data: event } = await admin
    .from("events")
    .select("id")
    .eq("is_partner_only", true)
    .eq("registration_open", true)
    .eq("is_active", true)
    .maybeSingle();

  if (!event) {
    return NextResponse.json(
      { error: "No partner tournament is open for registration right now" },
      { status: 404 },
    );
  }

  const { data: classmates } = await admin
    .from("partner_program_applications")
    .select("id, name, mobile")
    .eq("referred_by_id", self.id)
    .eq("partner_type", "classmate")
    .eq("status", "approved")
    .eq("team", team)
    .order("created_at", { ascending: true });

  if ((classmates ?? []).length !== REQUIRED_TEAMMATES) {
    return NextResponse.json(
      {
        error: `Team ${team} needs exactly ${REQUIRED_TEAMMATES} approved Classmate Partners (currently ${
          (classmates ?? []).length
        }) before you can register`,
      },
      { status: 400 },
    );
  }

  const players = [
    { name: self.name, phone: self.mobile },
    ...(classmates ?? []).map((c) => ({ name: c.name, phone: c.mobile })),
  ];

  const result = await createTeamRegistration(admin, {
    eventId: event.id,
    collegeId: self.college_id,
    teamName: `${self.name} — Team ${team}`,
    players,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { error: linkError } = await admin
    .from("partner_program_applications")
    .update(
      team === "A"
        ? { team_a_registration_id: result.registrationId }
        : { team_b_registration_id: result.registrationId },
    )
    .eq("id", self.id);

  if (linkError) {
    return NextResponse.json(
      { error: "Registration created but could not be linked — contact support" },
      { status: 500 },
    );
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
