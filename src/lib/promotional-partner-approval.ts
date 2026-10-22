import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generates a Promotional Partner's personal code (printed on their
 * certificate) — sequential and prefixed, unlike College Campus Partner's
 * name+mobile scheme (see generateCollegeCampusPartnerCode): YCCPP01,
 * YCCPP02, ... (naturally grows to 3+ digits past 99). Called immediately
 * at signup — no approval gate. Skipped if already set.
 */
export async function generatePromotionalPartnerCode(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
) {
  const { data: application } = await admin
    .from("promotional_partner_applications")
    .select("code")
    .eq("id", applicationId)
    .single();

  if (!application || application.code) return;

  const { count } = await admin
    .from("promotional_partner_applications")
    .select("id", { count: "exact", head: true });

  let n = (count ?? 0) + 1;
  let code = `YCCPP${String(n).padStart(2, "0")}`;
  // Collision is only possible if a row was deleted and re-counted lower
  // than an existing code, or under concurrent signups racing the same
  // count — the unique-ish nature of the sequence makes it rare, but fall
  // back to incrementing rather than fail the signup, same defensive
  // pattern as generateCollegeCampusPartnerCode's numbered suffix.
  for (let attempts = 0; attempts < 50; attempts++) {
    const { data: existing } = await admin
      .from("promotional_partner_applications")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existing) break;
    n++;
    code = `YCCPP${String(n).padStart(2, "0")}`;
  }

  await admin
    .from("promotional_partner_applications")
    .update({ code })
    .eq("id", applicationId);
}
