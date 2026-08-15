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
  type: "campus" | "class";
  members: LookupTeamMember[];
}

/**
 * Mirrors searchParticipants' shape/fast-path but over the partner-program
 * hierarchy: an exact team_code or unique_id match (the QR-scan fast path)
 * first, then a fuzzy name/mobile/code match. Approved YCC Partners and
 * Co-Partners are both searchable as "captains" — scanning/searching one
 * surfaces the Squad members who attached directly to them, same
 * "search one, see the team" pattern as the participant lookup. A Squad
 * member can attach to either tier (they're allowed to skip their
 * Co-Partner and pick a Partner directly), so this has to cover both to
 * make every Squad member reachable through some captain. No college
 * filter — Partners/Co-Partners don't collect one.
 */
export async function searchClassPartners(
  query: string,
): Promise<LookupClassPartner[]> {
  const admin = createAdminClient();
  const trimmed = query.trim();

  let captainIds: string[] = [];

  if (!trimmed) {
    const { data } = await admin
      .from("partner_program_applications")
      .select("id")
      .in("partner_type", ["campus", "class"])
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(200);
    captainIds = (data ?? []).map((r) => r.id);
  } else {
    const upper = trimmed.toUpperCase();
    const { data: exact } = await admin
      .from("partner_program_applications")
      .select("id")
      .in("partner_type", ["campus", "class"])
      .eq("status", "approved")
      .or(`team_code.eq.${upper},unique_id.eq.${upper}`)
      .maybeSingle();

    if (exact) {
      captainIds = [exact.id];
    } else {
      const { data: fuzzy } = await admin
        .from("partner_program_applications")
        .select("id")
        .in("partner_type", ["campus", "class"])
        .eq("status", "approved")
        .or(
          `name.ilike.%${trimmed}%,mobile.ilike.%${trimmed}%,team_code.ilike.%${trimmed}%,unique_id.ilike.%${trimmed}%`,
        )
        .limit(50);
      captainIds = (fuzzy ?? []).map((r) => r.id);
    }
  }

  if (captainIds.length === 0) return [];

  const { data: captains } = await admin
    .from("partner_program_applications")
    .select("id, name, mobile, unique_id, team_code, attendance_status, partner_type")
    .in("id", captainIds);

  if (!captains || captains.length === 0) return [];

  const { data: members } = await admin
    .from("partner_program_applications")
    .select("id, name, mobile, attendance_status, referred_by_id")
    .in(
      "referred_by_id",
      captains.map((c) => c.id),
    )
    .eq("partner_type", "classmate")
    .eq("status", "approved")
    .order("name");

  return captains.map((cp) => ({
    applicationId: cp.id,
    name: cp.name,
    mobile: cp.mobile,
    uniqueId: cp.unique_id,
    teamCode: cp.team_code,
    attendanceStatus: cp.attendance_status ?? "absent",
    type: cp.partner_type as "campus" | "class",
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
