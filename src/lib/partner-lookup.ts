import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AttendanceStatus } from "@/lib/supabase/types";

export interface LookupTeamMember {
  id: string;
  name: string;
  mobile: string;
  attendanceStatus: AttendanceStatus;
}

export interface LookupClassPartner {
  applicationId: string;
  name: string;
  mobile: string;
  uniqueId: string | null;
  teamCode: string | null;
  attendanceStatus: AttendanceStatus;
  members: LookupTeamMember[];
}

/**
 * Mirrors searchParticipants' shape/fast-path but over the partner-program
 * hierarchy: an exact team_code or unique_id match (the QR-scan fast path)
 * first, then a fuzzy name/mobile/code match. Only approved YCC Co-Partners
 * are searchable — scanning/searching a captain surfaces their whole
 * approved Classmate Partner roster, same "search one, see the team"
 * pattern as the participant lookup. No college filter — Co-Partners don't
 * collect one.
 */
export async function searchClassPartners(
  query: string,
): Promise<LookupClassPartner[]> {
  const admin = createAdminClient();
  const trimmed = query.trim();

  let classPartnerIds: string[] = [];

  if (!trimmed) {
    const { data } = await admin
      .from("partner_program_applications")
      .select("id")
      .eq("partner_type", "class")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(200);
    classPartnerIds = (data ?? []).map((r) => r.id);
  } else {
    const upper = trimmed.toUpperCase();
    const { data: exact } = await admin
      .from("partner_program_applications")
      .select("id")
      .eq("partner_type", "class")
      .eq("status", "approved")
      .or(`team_code.eq.${upper},unique_id.eq.${upper}`)
      .maybeSingle();

    if (exact) {
      classPartnerIds = [exact.id];
    } else {
      const { data: fuzzy } = await admin
        .from("partner_program_applications")
        .select("id")
        .eq("partner_type", "class")
        .eq("status", "approved")
        .or(
          `name.ilike.%${trimmed}%,mobile.ilike.%${trimmed}%,team_code.ilike.%${trimmed}%,unique_id.ilike.%${trimmed}%`,
        )
        .limit(50);
      classPartnerIds = (fuzzy ?? []).map((r) => r.id);
    }
  }

  if (classPartnerIds.length === 0) return [];

  const { data: classPartners } = await admin
    .from("partner_program_applications")
    .select("id, name, mobile, unique_id, team_code, attendance_status")
    .in("id", classPartnerIds);

  if (!classPartners || classPartners.length === 0) return [];

  const { data: members } = await admin
    .from("partner_program_applications")
    .select("id, name, mobile, attendance_status, referred_by_id")
    .in(
      "referred_by_id",
      classPartners.map((c) => c.id),
    )
    .eq("partner_type", "classmate")
    .eq("status", "approved")
    .order("name");

  return classPartners.map((cp) => ({
    applicationId: cp.id,
    name: cp.name,
    mobile: cp.mobile,
    uniqueId: cp.unique_id,
    teamCode: cp.team_code,
    attendanceStatus: cp.attendance_status ?? "absent",
    members: (members ?? [])
      .filter((m) => m.referred_by_id === cp.id)
      .map((m) => ({
        id: m.id,
        name: m.name,
        mobile: m.mobile,
        attendanceStatus: m.attendance_status ?? "absent",
      })),
  }));
}
