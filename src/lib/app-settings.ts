import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const RAZORPAY_ENABLED_KEY = "razorpay_enabled";

/**
 * The Razorpay kill switch — checked by every paid-event registration
 * creation path (see create-team-registration.ts,
 * create-self-individual-registration.ts) alongside each event's own
 * pay_at_venue flag. OFF (including on any read error) falls back to the
 * same immediate-cash-confirmation flow pay_at_venue already uses — a
 * missing/unreadable flag must never silently enable live payments, so
 * the fail-safe direction is OFF, not ON.
 */
export async function isRazorpayEnabled(): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", RAZORPAY_ENABLED_KEY)
    .maybeSingle();
  if (error || !data) return false;
  return data.value === true;
}

export async function setRazorpayEnabled(
  enabled: boolean,
  adminUserId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("app_settings").upsert({
    key: RAZORPAY_ENABLED_KEY,
    value: enabled,
    updated_at: new Date().toISOString(),
    updated_by: adminUserId,
  });
  if (error) throw error;
}
