import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ParticipantRow = Database["public"]["Tables"]["participants"]["Row"];

export type DateRange = "today" | "7d" | "30d" | "all";

/** Cutoff as an ISO string, or null for "all" (no lower bound). */
function rangeCutoffIso(range: DateRange | undefined): string | null {
  if (!range || range === "all") return null;
  const days = range === "today" ? 1 : range === "7d" ? 7 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Calendar-day key in IST, e.g. "2026-08-20" — matches how dates are
 * displayed everywhere else in admin (Asia/Kolkata), so a registration at
 * 11pm IST isn't miscounted into the next UTC day. */
function istDayKey(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

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

/** Aggregates confirmed registrations, revenue, and attendance — overall or scoped to one event and/or a recent date range. */
export async function getEventOverview(
  eventId?: string,
  range?: DateRange,
): Promise<EventOverview> {
  const admin = createAdminClient();

  let registrationsQuery = admin
    .from("registrations")
    .select("*")
    .eq("status", "confirmed");
  if (eventId) registrationsQuery = registrationsQuery.eq("event_id", eventId);
  const cutoff = rangeCutoffIso(range);
  if (cutoff) registrationsQuery = registrationsQuery.gte("created_at", cutoff);

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

export interface CashCollectionEventOverview {
  eventId: string;
  eventName: string;
  confirmedRegistrations: number;
  paidRegistrations: number;
  pendingRegistrations: number;
  paidPaise: number;
  pendingPaise: number;
}

/**
 * Per-event cash-collection breakdown for pay_at_venue events — the
 * `revenuePaise` figures elsewhere on this dashboard (getEventOverview)
 * count a pay_at_venue registration's fee the moment it's confirmed, before
 * any cash has actually been collected at the venue; this splits that same
 * money into what's actually been marked paid (a `payments` row exists) vs
 * still pending, so "confirmed" isn't mistaken for "collected" for these
 * events specifically.
 */
export async function getCashCollectionOverview(): Promise<
  CashCollectionEventOverview[]
> {
  const admin = createAdminClient();
  const { data: events } = await admin
    .from("events")
    .select("id, name")
    .eq("pay_at_venue", true)
    .eq("is_active", true)
    // A pay_at_venue event with a real fee still owes cash at check-in; one
    // with fee_paise 0 (a free event that just uses pay_at_venue to skip
    // Cashfree — see confirmPayAtVenueRegistration) owes nothing, so it
    // doesn't belong on a "cash to collect" page.
    .gt("fee_paise", 0);

  if (!events || events.length === 0) return [];

  return Promise.all(
    events.map(async (event) => {
      const { data: registrations } = await admin
        .from("registrations")
        .select("id, amount_paise")
        .eq("event_id", event.id)
        .eq("status", "confirmed");
      const regs = registrations ?? [];
      const regIds = regs.map((r) => r.id);

      const { data: paidPayments } =
        regIds.length > 0
          ? await admin
              .from("payments")
              .select("registration_id")
              .in("registration_id", regIds)
              .eq("status", "paid")
          : { data: [] as { registration_id: string }[] };
      const paidSet = new Set((paidPayments ?? []).map((p) => p.registration_id));

      let paidPaise = 0;
      let pendingPaise = 0;
      let paidRegistrations = 0;
      let pendingRegistrations = 0;
      for (const r of regs) {
        if (paidSet.has(r.id)) {
          paidPaise += r.amount_paise;
          paidRegistrations += 1;
        } else {
          pendingPaise += r.amount_paise;
          pendingRegistrations += 1;
        }
      }

      return {
        eventId: event.id,
        eventName: event.name,
        confirmedRegistrations: regs.length,
        paidRegistrations,
        pendingRegistrations,
        paidPaise,
        pendingPaise,
      };
    }),
  );
}

export interface CashCollectionRegistrationDetail {
  registrationId: string;
  eventId: string;
  eventName: string;
  type: "team" | "individual";
  teamName: string | null;
  captainName: string | null;
  captainPhone: string;
  captainEmail: string | null;
  collegeName: string;
  participants: { name: string; uniqueId: string | null; isCaptain: boolean }[];
  amountPaise: number;
  registeredAt: string;
  paid: boolean;
  paidAt: string | null;
  markedByName: string | null;
}

/**
 * Per-registration detail for every pay_at_venue registration — who they
 * are, how to reach them, whether/when the cash was collected and by whom,
 * for the admin cash-collection page's full breakdown table. `search`
 * matches team name, captain name/phone/email, college name, or any
 * participant's name/unique ID (case-insensitive substring) — small enough
 * datasets (one cash event, a few hundred registrations at most) that
 * filtering in JS after one fetch beats hand-rolling a cross-table SQL
 * search.
 */
export async function getCashCollectionDetail(
  search?: string,
): Promise<CashCollectionRegistrationDetail[]> {
  const admin = createAdminClient();

  const { data: events } = await admin
    .from("events")
    .select("id, name")
    .eq("pay_at_venue", true)
    .eq("is_active", true)
    // See getCashCollectionOverview — a free (fee_paise 0) pay_at_venue
    // event owes no cash, so it's excluded here too.
    .gt("fee_paise", 0);
  if (!events || events.length === 0) return [];

  const eventIds = events.map((e) => e.id);
  const eventNameById = new Map(events.map((e) => [e.id, e.name]));

  const { data: registrations } = await admin
    .from("registrations")
    .select("*")
    .in("event_id", eventIds)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });
  const regs = registrations ?? [];
  const regIds = regs.map((r) => r.id);
  const collegeIds = [...new Set(regs.map((r) => r.college_id))];

  const [{ data: colleges }, { data: participants }, { data: payments }] =
    await Promise.all([
      collegeIds.length > 0
        ? admin.from("colleges").select("id, name").in("id", collegeIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      regIds.length > 0
        ? admin
            .from("participants")
            .select("registration_id, name, unique_id, is_captain")
            .in("registration_id", regIds)
        : Promise.resolve({
            data: [] as {
              registration_id: string;
              name: string;
              unique_id: string | null;
              is_captain: boolean;
            }[],
          }),
      regIds.length > 0
        ? admin
            .from("payments")
            .select("registration_id, raw_payload, updated_at")
            .in("registration_id", regIds)
            .eq("status", "paid")
        : Promise.resolve({
            data: [] as {
              registration_id: string;
              raw_payload: Record<string, unknown> | null;
              updated_at: string;
            }[],
          }),
    ]);

  const collegeNameById = new Map((colleges ?? []).map((c) => [c.id, c.name]));
  const paymentByReg = new Map((payments ?? []).map((p) => [p.registration_id, p]));

  const markerIds = [
    ...new Set(
      (payments ?? [])
        .map((p) => (p.raw_payload as { marked_by?: string } | null)?.marked_by)
        .filter((id): id is string => !!id),
    ),
  ];
  const staffNameById = new Map<string, string>();
  if (markerIds.length > 0) {
    const [{ data: staff }, { data: admins }] = await Promise.all([
      admin.from("staff").select("user_id, name").in("user_id", markerIds),
      admin.from("admins").select("user_id, name").in("user_id", markerIds),
    ]);
    for (const s of staff ?? []) if (s.name) staffNameById.set(s.user_id, s.name);
    for (const a of admins ?? []) if (a.name) staffNameById.set(a.user_id, a.name);
  }

  const participantsByReg = new Map<
    string,
    { name: string; uniqueId: string | null; isCaptain: boolean }[]
  >();
  for (const p of participants ?? []) {
    const list = participantsByReg.get(p.registration_id) ?? [];
    list.push({ name: p.name, uniqueId: p.unique_id, isCaptain: p.is_captain });
    participantsByReg.set(p.registration_id, list);
  }

  const details = regs.map((reg) => {
    const payment = paymentByReg.get(reg.id);
    const payload = payment?.raw_payload as
      | { marked_by?: string; marked_at?: string }
      | null
      | undefined;
    return {
      registrationId: reg.id,
      eventId: reg.event_id,
      eventName: eventNameById.get(reg.event_id) ?? "",
      type: reg.type,
      teamName: reg.team_name,
      captainName: reg.captain_name,
      captainPhone: reg.captain_phone,
      captainEmail: reg.captain_email,
      collegeName: collegeNameById.get(reg.college_id) ?? "Unknown",
      participants: participantsByReg.get(reg.id) ?? [],
      amountPaise: reg.amount_paise,
      registeredAt: reg.created_at,
      paid: !!payment,
      paidAt: payment ? (payload?.marked_at ?? payment.updated_at) : null,
      markedByName: payload?.marked_by
        ? (staffNameById.get(payload.marked_by) ?? null)
        : null,
    };
  });

  const trimmedSearch = search?.trim().toLowerCase();
  if (!trimmedSearch) return details;

  return details.filter((d) => {
    const haystack = [
      d.teamName,
      d.captainName,
      d.captainPhone,
      d.captainEmail,
      d.collegeName,
      ...d.participants.flatMap((p) => [p.name, p.uniqueId]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(trimmedSearch);
  });
}

export interface RegistrationsByDay {
  date: string; // "YYYY-MM-DD", IST calendar day
  registrations: number;
}

/**
 * Daily confirmed-registration counts for a trend chart — scoped to the
 * same event/range filters as the rest of the dashboard. Buckets by IST
 * calendar day so day boundaries match what's shown everywhere else.
 * "all" range is capped to the last 30 days so the chart stays readable —
 * the stat cards above it still cover true all-time totals.
 */
export async function getRegistrationsOverTime(
  eventId?: string,
  range?: DateRange,
): Promise<RegistrationsByDay[]> {
  const admin = createAdminClient();

  const cutoff = rangeCutoffIso(range) ?? rangeCutoffIso("30d")!;

  let query = admin
    .from("registrations")
    .select("created_at")
    .eq("status", "confirmed")
    .gte("created_at", cutoff);
  if (eventId) query = query.eq("event_id", eventId);

  const { data: registrations } = await query;

  const countByDay = new Map<string, number>();
  for (const r of registrations ?? []) {
    const key = istDayKey(r.created_at);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  // Fill in every day in the window (even zero-registration days) so the
  // chart reads as a continuous timeline instead of skipping gaps.
  const days: RegistrationsByDay[] = [];
  const cutoffDate = new Date(cutoff);
  const today = new Date();
  for (
    let d = new Date(cutoffDate.toDateString());
    d <= today;
    d.setDate(d.getDate() + 1)
  ) {
    const key = istDayKey(d.toISOString());
    days.push({ date: key, registrations: countByDay.get(key) ?? 0 });
  }

  return days;
}

export interface PartnerSquadReadiness {
  id: string;
  name: string;
  partnerType: "campus" | "class";
  teamCode: string | null;
  /** Direct Co-Partners recruited — always 0 for a Co-Partner row (they don't recruit Co-Partners). */
  coPartners: number;
  /** Direct Squad — for a Partner, only those who joined them directly, skipping the Co-Partner level. */
  directSquad: number;
  /** coPartners + directSquad, kept for callers that just want one number. */
  totalParticipants: number;
  teamsRegistered: number;
  revenuePaise: number;
  /** The partner's own real college (partner_program_applications.college_id) — not to be confused with the pseudo-college keyed by their team_code above. */
  collegeName: string | null;
}

/**
 * Per-partner rollup for every approved YCC Partner/Co-Partner: how many
 * people they've directly recruited (split into Co-Partners vs. Squad —
 * Squad can attach directly to a Partner or via a Co-Partner, see
 * squad-source/route.ts), and how many of the fixed-size-6 teams they've
 * actually registered and paid for from that roster so far (a roster
 * bigger than 6 gets filed as multiple teams, in batches of 6, against the
 * same partner-keyed college row).
 */
export async function getPartnerSquadReadiness(): Promise<PartnerSquadReadiness[]> {
  const admin = createAdminClient();

  const { data: partners } = await admin
    .from("partner_program_applications")
    .select("id, name, partner_type, team_code, college_id")
    .in("partner_type", ["campus", "class"])
    .eq("status", "approved")
    .order("name");

  const realCollegeIds = [
    ...new Set((partners ?? []).map((p) => p.college_id).filter((id): id is string => !!id)),
  ];
  const { data: realColleges } =
    realCollegeIds.length > 0
      ? await admin.from("colleges").select("id, name").in("id", realCollegeIds)
      : { data: [] as { id: string; name: string }[] };
  const realCollegeNameById = new Map((realColleges ?? []).map((c) => [c.id, c.name]));

  const partnerIds = (partners ?? []).map((p) => p.id);

  const { data: children } =
    partnerIds.length > 0
      ? await admin
          .from("partner_program_applications")
          .select("referred_by_id, partner_type")
          .in("referred_by_id", partnerIds)
          .eq("status", "approved")
      : { data: [] as { referred_by_id: string | null; partner_type: string }[] };

  const coPartnersById = new Map<string, number>();
  const directSquadById = new Map<string, number>();
  for (const c of children ?? []) {
    if (!c.referred_by_id) continue;
    const map = c.partner_type === "class" ? coPartnersById : directSquadById;
    map.set(c.referred_by_id, (map.get(c.referred_by_id) ?? 0) + 1);
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
    const coPartners = coPartnersById.get(p.id) ?? 0;
    const directSquad = directSquadById.get(p.id) ?? 0;
    return {
      id: p.id,
      name: p.name,
      partnerType: p.partner_type as "campus" | "class",
      teamCode: p.team_code,
      coPartners,
      directSquad,
      totalParticipants: coPartners + directSquad,
      teamsRegistered: teams?.count ?? 0,
      revenuePaise: teams?.revenuePaise ?? 0,
      collegeName: p.college_id ? (realCollegeNameById.get(p.college_id) ?? null) : null,
    };
  });
}

export interface CollegeCampusPartnerOverviewRow {
  id: string;
  name: string;
  collegeName: string | null;
  stream: string;
  year: number;
  semester: number;
  code: string | null;
}

/**
 * Flat list of every College Campus Partner registration — unlike
 * getPartnerSquadReadiness above, this has no referral hierarchy, team
 * registrations, or revenue to roll up (it's a standalone signup form,
 * not the Partner Program), so it's just a straight fetch + college-name
 * join rather than a stats computation.
 */
export async function getCollegeCampusPartnerOverview(): Promise<
  CollegeCampusPartnerOverviewRow[]
> {
  const admin = createAdminClient();

  const { data: applications } = await admin
    .from("college_campus_partner_applications")
    .select("id, name, college_id, stream, year, semester, code")
    .order("name");

  const collegeIds = [
    ...new Set((applications ?? []).map((a) => a.college_id)),
  ];
  const { data: colleges } =
    collegeIds.length > 0
      ? await admin.from("colleges").select("id, name").in("id", collegeIds)
      : { data: [] as { id: string; name: string }[] };
  const collegeNameById = new Map((colleges ?? []).map((c) => [c.id, c.name]));

  return (applications ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    collegeName: collegeNameById.get(a.college_id) ?? null,
    stream: a.stream,
    year: a.year,
    semester: a.semester,
    code: a.code,
  }));
}

export interface CollegeCampusPartnerProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  age: number;
  gender: string;
  instagramHandle: string;
  stream: string;
  year: number;
  semester: number;
  code: string | null;
  collegeName: string | null;
  createdAt: string;
}

export interface CollegeCampusPartnerTeam {
  registrationId: string;
  teamName: string | null;
  captainName: string | null;
  squadSize: number;
  convertedToBoxCricket: boolean;
  createdAt: string;
}

export interface CollegeCampusPartnerInsights {
  profile: CollegeCampusPartnerProfile;
  teams: CollegeCampusPartnerTeam[];
  totalPlayers: number;
  convertedCount: number;
}

/**
 * "How many people joined under this College Campus Partner" (registered
 * for Kismat Ke Khiladi ft. Go Goa Gone using their code), and of those,
 * how many teams went on to also register for Box Cricket — whether via
 * the one-tap clone on the level-up game's summary screen (see
 * /api/registrations/clone-team) or by registering again manually.
 * Conversion is matched by captain_phone rather than by id, since a
 * manual re-registration is a completely separate registrations row with
 * no direct foreign key back to the Go Goa Gone one.
 */
export async function getCollegeCampusPartnerInsights(
  partnerId: string,
): Promise<CollegeCampusPartnerInsights | null> {
  const admin = createAdminClient();

  const { data: partner } = await admin
    .from("college_campus_partner_applications")
    .select(
      "id, name, email, mobile, age, gender, instagram_handle, stream, year, semester, code, college_id, created_at",
    )
    .eq("id", partnerId)
    .maybeSingle();

  if (!partner) return null;

  const [{ data: college }, { data: goGoaGoneEvent }, { data: boxCricketEvent }] =
    await Promise.all([
      admin.from("colleges").select("name").eq("id", partner.college_id).maybeSingle(),
      admin.from("events").select("id").eq("slug", "ycc-go-goa-gone").maybeSingle(),
      admin.from("events").select("id").eq("slug", "cricket-championship-2026").maybeSingle(),
    ]);

  const profile: CollegeCampusPartnerProfile = {
    id: partner.id,
    name: partner.name,
    email: partner.email,
    mobile: partner.mobile,
    age: partner.age,
    gender: partner.gender,
    instagramHandle: partner.instagram_handle,
    stream: partner.stream,
    year: partner.year,
    semester: partner.semester,
    code: partner.code,
    collegeName: college?.name ?? null,
    createdAt: partner.created_at,
  };

  if (!goGoaGoneEvent) {
    return { profile, teams: [], totalPlayers: 0, convertedCount: 0 };
  }

  const { data: registrations } = await admin
    .from("registrations")
    .select("id, team_name, captain_name, captain_phone, created_at")
    .eq("referred_by_college_campus_partner_id", partnerId)
    .eq("event_id", goGoaGoneEvent.id)
    .eq("status", "confirmed")
    .order("created_at");

  if (!registrations || registrations.length === 0) {
    return { profile, teams: [], totalPlayers: 0, convertedCount: 0 };
  }

  const registrationIds = registrations.map((r) => r.id);
  const captainPhones = [...new Set(registrations.map((r) => r.captain_phone))];

  const [{ data: participants }, { data: boxCricketRegs }] = await Promise.all([
    admin
      .from("participants")
      .select("registration_id")
      .in("registration_id", registrationIds),
    boxCricketEvent
      ? admin
          .from("registrations")
          .select("captain_phone")
          .eq("event_id", boxCricketEvent.id)
          .eq("status", "confirmed")
          .in("captain_phone", captainPhones)
      : Promise.resolve({ data: [] as { captain_phone: string }[] }),
  ]);

  const squadSizeByRegistration = new Map<string, number>();
  for (const p of participants ?? []) {
    squadSizeByRegistration.set(
      p.registration_id,
      (squadSizeByRegistration.get(p.registration_id) ?? 0) + 1,
    );
  }
  const convertedPhones = new Set((boxCricketRegs ?? []).map((r) => r.captain_phone));

  const teams: CollegeCampusPartnerTeam[] = registrations.map((r) => ({
    registrationId: r.id,
    teamName: r.team_name,
    captainName: r.captain_name,
    squadSize: squadSizeByRegistration.get(r.id) ?? 0,
    convertedToBoxCricket: convertedPhones.has(r.captain_phone),
    createdAt: r.created_at,
  }));

  return {
    profile,
    teams,
    totalPlayers: teams.reduce((sum, t) => sum + t.squadSize, 0),
    convertedCount: teams.filter((t) => t.convertedToBoxCricket).length,
  };
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

export interface GameInsightsSummary {
  gameSlug: string;
  plays: number;
  wins: number;
  losses: number;
}

type GameSource = "registration" | "partner" | "school" | "individual_free";

export interface GamePlayRow {
  kind: "single";
  id: string;
  gameSlug: string;
  playerName: string;
  teamLabel: string;
  source: GameSource;
  isCaptain: boolean;
  result: "won" | "lost";
  createdAt: string;
}

/** One row per Level Up run (see level-up-game.tsx) — Level 1 (Spin the
 * Wheel) and Level 2 (Roll a Dice) are always played together, sharing a
 * levelUpSessionId stashed in each row's `detail` JSON, and are always
 * presented here as the one combined box a run actually is. Either level
 * can be null if a run was abandoned before finishing it. */
export interface LevelUpRunRow {
  kind: "level-up";
  sessionId: string;
  playerName: string;
  teamLabel: string;
  source: GameSource;
  isCaptain: boolean;
  level1: { result: "won" | "lost" } | null;
  level2: { result: "won" | "lost" } | null;
  createdAt: string;
}

export type RecentPlayRow = GamePlayRow | LevelUpRunRow;

// The two real recorded game_slug values a Level Up run produces — "level-up"
// itself is never written to game_plays, it's a pseudo-slug this file
// resolves wherever a caller filters or groups by it.
const LEVEL_UP_SLUGS = ["spin-wheel", "roll-a-dice"];

/**
 * Spin the Wheel / Mystery Box / Roll a Dice insights for the admin games
 * page. Summary counts scan every matching row (no limit — plain text
 * columns, cheap) so totals stay accurate regardless of volume; recentPlays
 * is capped for the table. Level Up's two constituent games are merged
 * throughout: one summary bucket ("level-up"), and one recentPlays row per
 * run (pairing Level 1 + Level 2 by their shared levelUpSessionId) instead
 * of two separate rows.
 */
export async function getGameInsights(
  gameSlug?: string,
  search?: string,
  result?: "won" | "lost",
): Promise<{
  summary: GameInsightsSummary[];
  recentPlays: RecentPlayRow[];
}> {
  const admin = createAdminClient();
  const trimmedSearch = search?.trim();
  const dbSlugs = gameSlug === "level-up" ? LEVEL_UP_SLUGS : gameSlug ? [gameSlug] : null;

  // Summary totals stay scoped to gameSlug only (not `result`/`search`) —
  // they're meant to show overall wins/losses regardless of how the
  // "Recent plays" table below is currently filtered.
  let summaryQuery = admin.from("game_plays").select("game_slug, result");
  if (dbSlugs) summaryQuery = summaryQuery.in("game_slug", dbSlugs);

  // `search` is safe to apply at the SQL level as before: player_name/
  // team_label are the same denormalized text on both of a run's rows (the
  // same player played both levels), so a match on one implies a match on
  // the other — pairing still sees both rows either way. `result` is NOT
  // applied here, only in JS below after pairing: it genuinely can differ
  // between Level 1 and Level 2, so filtering at the SQL level first could
  // fetch only one of a run's two rows (e.g. "Won only" excluding Level 2's
  // real, separate loss instead of showing it alongside the win). Fetches
  // a wider 400-row window (not 200) when no search narrows it, since
  // pairing roughly halves the Level Up row count, keeping ~200 final rows
  // reachable after grouping.
  let recentQuery = admin
    .from("game_plays")
    .select(
      "id, game_slug, player_name, team_label, source, is_captain, result, detail, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(400);
  if (dbSlugs) recentQuery = recentQuery.in("game_slug", dbSlugs);
  if (trimmedSearch) {
    recentQuery = recentQuery.or(
      `player_name.ilike.%${trimmedSearch}%,team_label.ilike.%${trimmedSearch}%`,
    );
  }

  const [{ data: allRows }, { data: recentRows }] = await Promise.all([
    summaryQuery,
    recentQuery,
  ]);

  const bySlug = new Map<string, GameInsightsSummary>();
  for (const r of allRows ?? []) {
    const bucketSlug = LEVEL_UP_SLUGS.includes(r.game_slug) ? "level-up" : r.game_slug;
    const entry = bySlug.get(bucketSlug) ?? {
      gameSlug: bucketSlug,
      plays: 0,
      wins: 0,
      losses: 0,
    };
    entry.plays += 1;
    if (r.result === "won") entry.wins += 1;
    else entry.losses += 1;
    bySlug.set(bucketSlug, entry);
  }

  const runsById = new Map<string, LevelUpRunRow>();
  const singles: GamePlayRow[] = [];
  for (const r of recentRows ?? []) {
    if (!LEVEL_UP_SLUGS.includes(r.game_slug)) {
      singles.push({
        kind: "single",
        id: r.id,
        gameSlug: r.game_slug,
        playerName: r.player_name,
        teamLabel: r.team_label,
        source: r.source as GameSource,
        isCaptain: r.is_captain,
        result: r.result as "won" | "lost",
        createdAt: r.created_at,
      });
      continue;
    }

    // Falls back to the row's own id when levelUpSessionId is somehow
    // missing (shouldn't happen for any run started after this shipped)
    // so a stray row still shows as its own box rather than silently
    // vanishing or colliding with an unrelated run.
    const sessionId =
      (r.detail as { levelUpSessionId?: string } | null)?.levelUpSessionId ?? r.id;
    const levelResult = { result: r.result as "won" | "lost" };
    const existing = runsById.get(sessionId);
    if (!existing) {
      runsById.set(sessionId, {
        kind: "level-up",
        sessionId,
        playerName: r.player_name,
        teamLabel: r.team_label,
        source: r.source as GameSource,
        isCaptain: r.is_captain,
        level1: r.game_slug === "spin-wheel" ? levelResult : null,
        level2: r.game_slug === "roll-a-dice" ? levelResult : null,
        createdAt: r.created_at,
      });
    } else {
      if (r.game_slug === "spin-wheel") existing.level1 = levelResult;
      else existing.level2 = levelResult;
      // Rows arrive newest-first; keep the run's createdAt at whichever of
      // its two rows is most recent, so it sorts by its latest activity.
      if (r.created_at > existing.createdAt) existing.createdAt = r.created_at;
    }
  }

  let combined: RecentPlayRow[] = [...singles, ...runsById.values()];

  if (result) {
    combined = combined.filter((row) =>
      row.kind === "single"
        ? row.result === result
        : row.level1?.result === result || row.level2?.result === result,
    );
  }

  combined.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

  return {
    summary: Array.from(bySlug.values()),
    recentPlays: combined.slice(0, 200),
  };
}
