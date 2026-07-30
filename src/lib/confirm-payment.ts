import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeRegistration } from "@/lib/finalize-registration";

/**
 * Marks a payment/registration paid+confirmed and runs receipt finalization.
 * Idempotent (keyed on payments.status) so it's safe to call from both the
 * checkout verify-payment endpoint (immediate UX) and the Razorpay webhook
 * (durable source of truth) — whichever lands first wins, the other no-ops.
 */
export async function confirmPayment({
  orderId,
  paymentId,
  signature,
  rawPayload,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  rawPayload?: unknown;
}): Promise<
  { ok: true; registrationId: string } | { ok: false; error: string }
> {
  const admin = createAdminClient();

  const { data: paymentRow } = await admin
    .from("payments")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (!paymentRow) {
    return { ok: false, error: "Unknown order" };
  }

  if (paymentRow.status === "paid") {
    return { ok: true, registrationId: paymentRow.registration_id };
  }

  await admin
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
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
    console.error("finalizeRegistration failed", err);
  }

  return { ok: true, registrationId: paymentRow.registration_id };
}
