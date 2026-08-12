import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

function generateTeamCode(name: string, mobile: string): string {
  const firstName =
    name.trim().split(/\s+/)[0]?.toUpperCase().replace(/[^A-Z]/g, "") || "PARTNER";
  const last4 = mobile.replace(/\D/g, "").slice(-4).padStart(4, "0");
  return `${firstName}${last4}`;
}

/**
 * Generates a partner's personal code (QR payload, and — for YCC
 * Co-Partners — the code Classmate Partners enter to join; for YCC
 * Partners, the code Co-Partners enter to link up). Called immediately at
 * signup (no approval gate), and still safe to call again from the older
 * approval-review call sites — both parts are skipped if already set.
 *
 * The per-college serial unique_id (event-day check-in) used to key off
 * the applicant's own college — now that no partner type collects one,
 * allocate_partner_unique_id resolves a shared placeholder college itself.
 */
export async function generatePartnerCode(
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
    // fall back to a numbered suffix rather than fail the signup.
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
