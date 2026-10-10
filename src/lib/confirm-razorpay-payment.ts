import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeRegistration } from "@/lib/finalize-registration";

/**
 * Sibling to confirm-payment.ts (Cashfree) — same idempotent shape, keyed
 * on razorpay_order_id instead of a Cashfree link id since that's what's
 * known at order-creation time (see /api/razorpay/create-order).
 * Idempotent on payments.status so a retried webhook delivery (Razorpay
 * retries on non-2xx, and can also just send duplicates) safely no-ops.
 */
export async function confirmRazorpayPayment({
  razorpayOrderId,
  paymentId,
  signature,
  rawPayload,
}: {
  razorpayOrderId: string;
  paymentId: string;
  signature?: string;
  rawPayload?: unknown;
}): Promise<{ ok: true; registrationId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();

  const { data: paymentRow } = await admin
    .from("payments")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (!paymentRow) {
    return { ok: false, error: "Unknown payment" };
  }

  if (paymentRow.status === "paid") {
    return { ok: true, registrationId: paymentRow.registration_id };
  }

  await admin
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      ...(signature ? { razorpay_signature: signature } : {}),
      raw_payload: (rawPayload as Record<string, unknown> | null) ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRow.id);

  await admin
    .from("registrations")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", paymentRow.registration_id);

  try {
    await finalizeRegistration(paymentRow.registration_id);
  } catch (err) {
    // Payment is already confirmed in the DB at this point; ID/receipt/email
    // generation failing shouldn't undo that. Log for manual follow-up.
    console.error("finalizeRegistration failed (razorpay)", err);
  }

  return { ok: true, registrationId: paymentRow.registration_id };
}
