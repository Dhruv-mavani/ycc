import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

function generatePartnerCode(name: string, mobile: string): string {
  const firstName =
    name.trim().split(/\s+/)[0]?.toUpperCase().replace(/[^A-Z]/g, "") || "PARTNER";
  const namePart = firstName.slice(0, 4);
  const first4 = mobile.replace(/\D/g, "").slice(0, 4);
  return `${namePart}${first4}`;
}

/**
 * Generates a College Campus Partner's personal code (printed on their
 * certificate). Called immediately at signup — no approval gate. Skipped
 * if already set. Same shape as generatePartnerCode in
 * src/lib/partner-approval.ts, kept separate since this is a distinct
 * table/flow.
 */
export async function generateCollegeCampusPartnerCode(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
) {
  const { data: application } = await admin
    .from("college_campus_partner_applications")
    .select("name, mobile, code")
    .eq("id", applicationId)
    .single();

  if (!application || application.code) return;

  const base = generatePartnerCode(application.name, application.mobile);
  let code = base;
  // Collision is astronomically unlikely (first 4 letters of the name +
  // first 4 mobile digits) but the unique constraint would reject a
  // duplicate outright, so fall back to a numbered suffix rather than
  // fail the signup.
  for (let suffix = 2; suffix < 100; suffix++) {
    const { data: existing } = await admin
      .from("college_campus_partner_applications")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existing) break;
    code = `${base}${suffix}`;
  }

  await admin
    .from("college_campus_partner_applications")
    .update({ code })
    .eq("id", applicationId);
}
