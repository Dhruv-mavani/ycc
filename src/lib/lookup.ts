import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type AdminClient = ReturnType<typeof createAdminClient>;
type RegistrationRow = Database["public"]["Tables"]["registrations"]["Row"];

export interface LookupParticipant {
  id: string;
  name: string;
  uniqueId: string | null;
  isCaptain: boolean;
  attendanceStatus: "present" | "absent";
}

export interface LookupRegistration {
  registrationId: string;
  type: "team" | "individual";
  eventName: string;
  collegeName: string;
  teamName: string | null;
  participants: LookupParticipant[];
}

/**
 * Searches by exact unique ID first (the QR-scan fast path), then falls
 * back to a fuzzy match across participant name, unique ID substring
 * (covers group-number searches like "G2"), and college initials.
 * Returns full team rosters — scanning/searching any one player on a
 * cricket team surfaces the whole squad, per spec.
 */
export async function searchParticipants(
  query: string,
  collegeId?: string,
): Promise<LookupRegistration[]> {
  const admin = createAdminClient();

  // College-filter path fetches full rows directly — no need to gather
  // ids first and re-fetch, that's just a redundant round-trip here.
  if (collegeId && collegeId !== "all") {
    const { data: registrations } = await admin
      .from("registrations")
      .select("*")
      .eq("college_id", collegeId)
      .eq("status", "confirmed");

    if (!registrations || registrations.length === 0) return [];
    return buildLookupResults(admin, registrations);
  }

  let registrationIds: string[] = [];
  {
    const trimmed = query.trim();
    if (!trimmed) {
      const { data: regs } = await admin
        .from("registrations")
        .select("id")
        .eq("status", "confirmed")
        .order("created_at", { ascending: false })
        .limit(500);
      registrationIds = (regs ?? []).map((r) => r.id);
    } else {
      const { data: exact } = await admin
        .from("participants")
        .select("registration_id")
        .eq("unique_id", trimmed.toUpperCase())
        .maybeSingle();

      if (exact) {
        registrationIds = [exact.registration_id];
      } else {
        const { data: matchingColleges } = await admin
          .from("colleges")
          .select("id")
          .ilike("initials", `%${trimmed}%`);

        let registrationIdsFromCollege: string[] = [];
        if (matchingColleges && matchingColleges.length > 0) {
          const { data: regs } = await admin
            .from("registrations")
            .select("id")
            .in(
              "college_id",
              matchingColleges.map((c) => c.id),
            );
          registrationIdsFromCollege = (regs ?? []).map((r) => r.id);
        }

        let registrationIdsFromPhone: string[] = [];
        const { data: phoneRegs } = await admin
          .from("registrations")
          .select("id")
          .ilike("captain_phone", `%${trimmed}%`)
          .limit(20);
        registrationIdsFromPhone = (phoneRegs ?? []).map((r) => r.id);

        const orParts = [
          `name.ilike.%${trimmed}%`,
          `unique_id.ilike.%${trimmed}%`,
          `phone.ilike.%${trimmed}%`,
        ];
        if (registrationIdsFromCollege.length > 0) {
          orParts.push(`registration_id.in.(${registrationIdsFromCollege.join(",")})`);
        }
        if (registrationIdsFromPhone.length > 0) {
          orParts.push(`registration_id.in.(${registrationIdsFromPhone.join(",")})`);
        }

        const { data: matches } = await admin
          .from("participants")
          .select("registration_id")
          .or(orParts.join(","))
          .limit(100);

        registrationIds = [...new Set((matches ?? []).map((m) => m.registration_id))];
      }
    }
  }

  if (registrationIds.length === 0) return [];

  const { data: registrations } = await admin
    .from("registrations")
    .select("*")
    .in("id", registrationIds)
    .eq("status", "confirmed");

  if (!registrations || registrations.length === 0) return [];

  return buildLookupResults(admin, registrations);
}

/** Shared tail: joins events/colleges/participants/attendance onto an already-fetched set of registrations. */
async function buildLookupResults(
  admin: AdminClient,
  registrations: RegistrationRow[],
): Promise<LookupRegistration[]> {
  const eventIds = [...new Set(registrations.map((r) => r.event_id))];
  const collegeIds = [...new Set(registrations.map((r) => r.college_id))];

  const [{ data: events }, { data: colleges }, { data: allParticipants }] =
    await Promise.all([
      admin.from("events").select("id, name").in("id", eventIds),
      admin.from("colleges").select("id, name").in("id", collegeIds),
      admin
        .from("participants")
        .select("*")
        .in("registration_id", registrations.map((r) => r.id))
        .order("is_captain", { ascending: false })
        .order("created_at"),
    ]);

  const participantIds = (allParticipants ?? []).map((p) => p.id);
  const { data: attendanceRows } = await admin
    .from("attendance")
    .select("participant_id, status")
    .in("participant_id", participantIds);

  const attendanceByParticipant = new Map(
    (attendanceRows ?? []).map((a) => [a.participant_id, a.status]),
  );
  const eventById = new Map((events ?? []).map((e) => [e.id, e.name]));
  const collegeById = new Map((colleges ?? []).map((c) => [c.id, c.name]));

  return registrations.map((reg) => ({
    registrationId: reg.id,
    type: reg.type as "team" | "individual",
    eventName: eventById.get(reg.event_id) ?? "",
    collegeName: collegeById.get(reg.college_id) ?? "",
    teamName: reg.team_name,
    participants: (allParticipants ?? [])
      .filter((p) => p.registration_id === reg.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        uniqueId: p.unique_id,
        isCaptain: p.is_captain,
        attendanceStatus:
          (attendanceByParticipant.get(p.id) as "present" | "absent") ??
          "absent",
      })),
  }));
}
