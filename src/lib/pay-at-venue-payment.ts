import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Cash-collection tracking for pay_at_venue registrations. The `payments`
 * table otherwise only ever holds real Cashfree transactions (see its
 * cashfree_* columns) — a cash payment is recorded the same way (a row with
 * status "paid") but with those columns left null and a `raw_payload`
 * marker noting it was cash, so this stays distinguishable from an online
 * payment on inspection while reusing every "is this registration paid?"
 * check already built around the payments table (buildReceiptPdf, the
 * registration status route, PaymentStatusPoller's due-notice banner).
 */

export async function isCashPaymentPaid(
  admin: AdminClient,
  registrationId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("payments")
    .select("id")
    .eq("registration_id", registrationId)
    .eq("status", "paid")
    .maybeSingle();
  return !!data;
}

/**
 * Marks a pay_at_venue registration as paid (cash collected at the venue).
 * Idempotent — clears any existing payment record for this registration
 * first, so re-marking doesn't create duplicates.
 */
export async function markCashPaymentPaid(
  admin: AdminClient,
  registrationId: string,
  markedByUserId: string,
): Promise<void> {
  const { data: registration, error: regError } = await admin
    .from("registrations")
    .select("amount_paise")
    .eq("id", registrationId)
    .single();
  if (regError || !registration) throw regError ?? new Error("registration not found");

  await admin.from("payments").delete().eq("registration_id", registrationId);

  const { error } = await admin.from("payments").insert({
    registration_id: registrationId,
    amount_paise: registration.amount_paise,
    status: "paid",
    raw_payload: {
      method: "cash",
      marked_by: markedByUserId,
      marked_at: new Date().toISOString(),
    },
  });
  if (error) throw error;
}

/** Reverts a cash "paid" mark — deletes the payment record for this registration. */
export async function markCashPaymentUnpaid(
  admin: AdminClient,
  registrationId: string,
): Promise<void> {
  const { error } = await admin
    .from("payments")
    .delete()
    .eq("registration_id", registrationId);
  if (error) throw error;
}
