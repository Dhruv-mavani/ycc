import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

function generateTeamCode(name: string, mobile: string): string {
  const firstName =
    name.trim().split(/\s+/)[0]?.toUpperCase().replace(/[^A-Z]/g, "") || "PARTNER";
  const last4 = mobile.replace(/\D/g, "").slice(-4).padStart(4, "0");
  return `${firstName}${last4}`;
}

/**
 * Runs once, the moment a YCC Co-Partner application is approved (by admin
 * or by their YCC Partner) — generates their team_code (QR payload +
 * the code Classmate Partners enter to join) and personal unique_id
 * (event-day check-in, via allocate_partner_unique_id). Safe to call
 * repeatedly: skips whichever part is already set.
 */
export async function finalizeClassPartnerApproval(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
) {
  const { data: application } = await admin
    .from("partner_program_applications")
    .select("name, mobile, team_code, unique_id")
    .eq("id", applicationId)
    .single();

  if (!application) return;

  if (!application.team_code) {
    const base = generateTeamCode(application.name, application.mobile);
    let code = base;
    // Collision is astronomically unlikely (first name + last 4 mobile
    // digits) but the unique index would reject a duplicate outright, so
    // fall back to a numbered suffix rather than fail the approval.
    for (let suffix = 2; suffix < 100; suffix++) {
      const { data: existing } = await admin
        .from("partner_program_applications")
        .select("id")
        .eq("team_code", code)
        .maybeSingle();
      if (!existing) break;
      code = `${base}${suffix}`;
    }
    await admin
      .from("partner_program_applications")
      .update({ team_code: code })
      .eq("id", applicationId);
  }

  if (!application.unique_id) {
    await admin.rpc("allocate_partner_unique_id", {
      p_application_id: applicationId,
    });
  }
}
