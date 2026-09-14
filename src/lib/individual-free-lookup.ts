import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AttendanceStatus } from "@/lib/supabase/types";

export interface LookupIndividualFreeRegistration {
  registrationId: string;
  name: string;
  whatsapp: string;
  code: string;
  eventName: string;
  collegeName: string | null;
  attendanceStatus: AttendanceStatus;
}

/**
 * Mirrors searchClassPartners'/searchParticipants' "exact code first, then
 * fuzzy" pattern, but over individual_free_registrations (e.g. YCC Money
 * Heist) — a single person per row, no sub-team, so results render as
 * plain one-line cards rather than roster groups.
 */
export async function searchIndividualFreeRegistrations(
  query: string,
): Promise<LookupIndividualFreeRegistration[]> {
  const admin = createAdminClient();
  const trimmed = query.trim();

  let registrationIds: string[] = [];

  if (!trimmed) {
    const { data } = await admin
      .from("individual_free_registrations")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(200);
    registrationIds = (data ?? []).map((r) => r.id);
  } else {
    const upper = trimmed.toUpperCase();
    const { data: exact } = await admin
      .from("individual_free_registrations")
      .select("id")
      .or(`code.eq.${upper},whatsapp.eq.${trimmed}`)
      .maybeSingle();

    if (exact) {
      registrationIds = [exact.id];
    } else {
      const { data: fuzzy } = await admin
        .from("individual_free_registrations")
        .select("id")
        .or(
          `name.ilike.%${trimmed}%,code.ilike.%${trimmed}%,whatsapp.ilike.%${trimmed}%`,
        )
        .limit(50);
      registrationIds = (fuzzy ?? []).map((r) => r.id);
    }
  }

  if (registrationIds.length === 0) return [];

  const { data: registrations } = await admin
    .from("individual_free_registrations")
    .select("id, name, whatsapp, code, event_id, college_id, attendance_status")
    .in("id", registrationIds);

  if (!registrations || registrations.length === 0) return [];

  const eventIds = [...new Set(registrations.map((r) => r.event_id))];
  const collegeIds = [
    ...new Set(registrations.map((r) => r.college_id).filter((id): id is string => !!id)),
  ];

  const [{ data: events }, { data: colleges }] = await Promise.all([
    admin.from("events").select("id, name").in("id", eventIds),
    collegeIds.length > 0
      ? admin.from("colleges").select("id, name").in("id", collegeIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const eventNameById = new Map((events ?? []).map((e) => [e.id, e.name]));
  const collegeNameById = new Map((colleges ?? []).map((c) => [c.id, c.name]));

  return registrations.map((r) => ({
    registrationId: r.id,
    name: r.name,
    whatsapp: r.whatsapp,
    code: r.code,
    eventName: eventNameById.get(r.event_id) ?? "",
    collegeName: r.college_id ? (collegeNameById.get(r.college_id) ?? null) : null,
    attendanceStatus: r.attendance_status,
  }));
}
