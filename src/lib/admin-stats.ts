import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ParticipantRow = Database["public"]["Tables"]["participants"]["Row"];

export interface CollegeBreakdown {
  collegeId: string;
  collegeName: string;
  registrations: number;
  participants: number;
  revenuePaise: number;
  present: number;
  absent: number;
}

export interface EventOverview {
  events: { id: string; name: string; type: string }[];
  selectedEventId: string | null;
  overall: {
    registrations: number;
    participants: number;
    revenuePaise: number;
    present: number;
    absent: number;
  };
  byCollege: CollegeBreakdown[];
}

/** Aggregates confirmed registrations, revenue, and attendance — overall or scoped to one event. */
export async function getEventOverview(
  eventId?: string,
): Promise<EventOverview> {
  const admin = createAdminClient();

  let registrationsQuery = admin
    .from("registrations")
    .select("*")
    .eq("status", "confirmed");
  if (eventId) registrationsQuery = registrationsQuery.eq("event_id", eventId);

  const [{ data: events }, { data: registrations }] = await Promise.all([
    admin.from("events").select("id, name, type").order("created_at"),
    registrationsQuery,
  ]);

  const registrationIds = (registrations ?? []).map((r) => r.id);
  const collegeIds = [...new Set((registrations ?? []).map((r) => r.college_id))];

  const [{ data: colleges }, { data: participants }] = await Promise.all([
    admin.from("colleges").select("id, name").in("id", collegeIds.length > 0 ? collegeIds : ["00000000-0000-0000-0000-000000000000"]),
    registrationIds.length > 0
      ? admin
          .from("participants")
          .select("id, registration_id")
          .in("registration_id", registrationIds)
      : Promise.resolve({ data: [] as { id: string; registration_id: string }[] }),
  ]);

  const participantIds = (participants ?? []).map((p) => p.id);
  const { data: attendanceRows } =
    participantIds.length > 0
      ? await admin
          .from("attendance")
          .select("participant_id, status")
          .in("participant_id", participantIds)
      : { data: [] as { participant_id: string; status: string }[] };

  const attendanceByParticipant = new Map(
    (attendanceRows ?? []).map((a) => [a.participant_id, a.status]),
  );
  const collegeNameById = new Map((colleges ?? []).map((c) => [c.id, c.name]));

  const byCollegeMap = new Map<string, CollegeBreakdown>();
  for (const reg of registrations ?? []) {
    const key = reg.college_id;
    if (!byCollegeMap.has(key)) {
      byCollegeMap.set(key, {
        collegeId: key,
        collegeName: collegeNameById.get(key) ?? "Unknown",
        registrations: 0,
        participants: 0,
        revenuePaise: 0,
        present: 0,
        absent: 0,
      });
    }
    const entry = byCollegeMap.get(key)!;
    entry.registrations += 1;
    entry.revenuePaise += reg.amount_paise;

    const regParticipants = (participants ?? []).filter(
      (p) => p.registration_id === reg.id,
    );
    entry.participants += regParticipants.length;
    for (const p of regParticipants) {
      const status = attendanceByParticipant.get(p.id) ?? "absent";
      if (status === "present") entry.present += 1;
      else entry.absent += 1;
    }
  }

  const byCollege = [...byCollegeMap.values()].sort(
    (a, b) => b.revenuePaise - a.revenuePaise,
  );

  const overall = byCollege.reduce(
    (acc, c) => ({
      registrations: acc.registrations + c.registrations,
      participants: acc.participants + c.participants,
      revenuePaise: acc.revenuePaise + c.revenuePaise,
      present: acc.present + c.present,
      absent: acc.absent + c.absent,
    }),
    { registrations: 0, participants: 0, revenuePaise: 0, present: 0, absent: 0 },
  );

  return {
    events: events ?? [],
    selectedEventId: eventId ?? null,
    overall,
    byCollege,
  };
}

export interface PartnerSquadReadiness {
  id: string;
  name: string;
  partnerType: "campus" | "class";
  teamCode: string | null;
  totalParticipants: number;
  teamsRegistered: number;
  revenuePaise: number;
}

/**
 * Per-partner rollup for every approved YCC Partner/Co-Partner: how many
 * people they've directly recruited (Co-Partners for a Partner, Classmate
 * Partners for a Co-Partner — see squad-source/route.ts), and how many of
 * the fixed-size-6 teams they've actually registered and paid for from that
 * roster so far (a roster bigger than 6 gets filed as multiple teams, in
 * batches of 6, against the same partner-keyed college row).
 */
export async function getPartnerSquadReadiness(): Promise<PartnerSquadReadiness[]> {
  const admin = createAdminClient();

  const { data: partners } = await admin
    .from("partner_program_applications")
    .select("id, name, partner_type, team_code")
    .in("partner_type", ["campus", "class"])
    .eq("status", "approved")
    .order("name");

  const partnerIds = (partners ?? []).map((p) => p.id);

  const { data: children } =
    partnerIds.length > 0
      ? await admin
          .from("partner_program_applications")
          .select("referred_by_id")
          .in("referred_by_id", partnerIds)
          .eq("status", "approved")
      : { data: [] as { referred_by_id: string | null }[] };

  const totalParticipantsById = new Map<string, number>();
  for (const c of children ?? []) {
    if (!c.referred_by_id) continue;
    totalParticipantsById.set(
      c.referred_by_id,
      (totalParticipantsById.get(c.referred_by_id) ?? 0) + 1,
    );
  }

  // Every team a partner registers is filed under one college row keyed by
  // their own team_code (see squad-source/route.ts) — a roster bigger than
  // 6 means multiple registrations pile up under that same college.
  const teamCodes = (partners ?? [])
    .map((p) => p.team_code)
    .filter((c): c is string => !!c);
  const { data: partnerColleges } =
    teamCodes.length > 0
      ? await admin.from("colleges").select("id, initials").in("initials", teamCodes)
      : { data: [] as { id: string; initials: string }[] };
  const collegeIdByInitials = new Map(
    (partnerColleges ?? []).map((c) => [c.initials, c.id]),
  );
  const collegeIds = [...collegeIdByInitials.values()];

  const { data: confirmedRegs } =
    collegeIds.length > 0
      ? await admin
          .from("registrations")
          .select("college_id, amount_paise")
          .in("college_id", collegeIds)
          .eq("status", "confirmed")
          .eq("type", "team")
      : { data: [] as { college_id: string; amount_paise: number }[] };

  const teamsByCollege = new Map<string, { count: number; revenuePaise: number }>();
  for (const r of confirmedRegs ?? []) {
    const entry = teamsByCollege.get(r.college_id) ?? { count: 0, revenuePaise: 0 };
    entry.count += 1;
    entry.revenuePaise += r.amount_paise;
    teamsByCollege.set(r.college_id, entry);
  }

  return (partners ?? []).map((p) => {
    const collegeId = p.team_code ? collegeIdByInitials.get(p.team_code) : undefined;
    const teams = collegeId ? teamsByCollege.get(collegeId) : undefined;
    return {
      id: p.id,
      name: p.name,
      partnerType: p.partner_type as "campus" | "class",
      teamCode: p.team_code,
      totalParticipants: totalParticipantsById.get(p.id) ?? 0,
      teamsRegistered: teams?.count ?? 0,
      revenuePaise: teams?.revenuePaise ?? 0,
    };
  });
}

export interface CollegeRegistrationDetail {
  registrationId: string;
  type: "team" | "individual";
  eventName: string;
  teamName: string | null;
  captainName: string | null;
  captainPhone: string;
  captainEmail: string | null;
  createdAt: string;
  amountPaise: number;
  participants: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    age: number | null;
    gender: string | null;
    uniqueId: string | null;
    isCaptain: boolean;
    attendanceStatus: "present" | "absent";
    markedByName: string | null;
    markedAt: string | null;
  }[];
}

export async function getCollegeDetail(
  collegeId: string,
  eventId?: string,
): Promise<{
  collegeName: string;
  registrations: CollegeRegistrationDetail[];
}> {
  const admin = createAdminClient();

  const { data: college } = await admin
    .from("colleges")
    .select("name")
    .eq("id", collegeId)
    .single();

  let regQuery = admin
    .from("registrations")
    .select("*")
    .eq("college_id", collegeId)
    .eq("status", "confirmed");
  if (eventId) regQuery = regQuery.eq("event_id", eventId);
  const { data: registrations } = await regQuery;

  const registrationIds = (registrations ?? []).map((r) => r.id);
  const eventIds = [...new Set((registrations ?? []).map((r) => r.event_id))];

  const [{ data: events }, { data: participants }] = await Promise.all([
    admin.from("events").select("id, name").in("id", eventIds.length > 0 ? eventIds : ["00000000-0000-0000-0000-000000000000"]),
    registrationIds.length > 0
      ? admin
          .from("participants")
          .select("*")
          .in("registration_id", registrationIds)
          .order("is_captain", { ascending: false })
          .order("created_at")
      : Promise.resolve({ data: [] as ParticipantRow[] }),
  ]);

  const participantIds = (participants ?? []).map((p) => p.id);
  const { data: attendanceRows } =
    participantIds.length > 0
      ? await admin
          .from("attendance")
          .select("participant_id, status, marked_by, marked_at")
          .in("participant_id", participantIds)
      : { data: [] as { participant_id: string; status: string; marked_by: string | null; marked_at: string | null }[] };

  const markerIds = [...new Set((attendanceRows ?? []).map((a) => a.marked_by).filter(Boolean) as string[])];
  const staffNameById = new Map<string, string>();
  if (markerIds.length > 0) {
    const [{ data: staff }, { data: admins }] = await Promise.all([
      admin.from("staff").select("user_id, name").in("user_id", markerIds),
      admin.from("admins").select("user_id, name").in("user_id", markerIds),
    ]);
    for (const s of staff ?? []) if (s.name) staffNameById.set(s.user_id, s.name);
    for (const a of admins ?? []) if (a.name) staffNameById.set(a.user_id, a.name);
  }

  const attendanceByParticipant = new Map(
    (attendanceRows ?? []).map((a) => [a.participant_id, a]),
  );
  const eventNameById = new Map((events ?? []).map((e) => [e.id, e.name]));

  const details: CollegeRegistrationDetail[] = (registrations ?? []).map(
    (reg) => ({
      registrationId: reg.id,
      type: reg.type,
      eventName: eventNameById.get(reg.event_id) ?? "",
      teamName: reg.team_name,
      captainName: reg.captain_name,
      captainPhone: reg.captain_phone,
      captainEmail: reg.captain_email,
      createdAt: reg.created_at,
      amountPaise: reg.amount_paise,
      participants: (participants ?? [])
        .filter((p) => p.registration_id === reg.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          phone: p.phone,
          email: p.email,
          age: p.age,
          gender: p.gender,
          uniqueId: p.unique_id,
          isCaptain: p.is_captain,
          attendanceStatus:
            (attendanceByParticipant.get(p.id)?.status as "present" | "absent") ??
            "absent",
          markedByName:
            staffNameById.get(attendanceByParticipant.get(p.id)?.marked_by ?? "") ?? null,
          markedAt: attendanceByParticipant.get(p.id)?.marked_at ?? null,
        })),
    }),
  );

  return { collegeName: college?.name ?? "Unknown", registrations: details };
}
