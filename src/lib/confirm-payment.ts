import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeRegistration } from "@/lib/finalize-registration";

/**
 * Marks a payment/registration paid+confirmed and runs receipt finalization.
 * Idempotent (keyed on payments.status) so it's safe to call from the
 * checkout verify-payment endpoint (immediate UX) and both Razorpay webhook
 * event types (durable source of truth) — whichever lands first wins, the
 * others no-op.
 *
 * Orders-flow payments are looked up by orderId (known at creation time).
 * Payment Links don't have an order_id until the customer actually pays, so
 * those are looked up by paymentLinkId instead — pass orderId too when it's
 * available (e.g. from the payment_link.paid webhook payload) and it'll be
 * backfilled onto the row for audit purposes.
 */
export async function confirmPayment({
  orderId,
  paymentLinkId,
  paymentId,
  signature,
  rawPayload,
}: {
  orderId?: string;
  paymentLinkId?: string;
  paymentId: string;
  signature: string;
  rawPayload?: unknown;
}): Promise<
  { ok: true; registrationId: string } | { ok: false; error: string }
> {
  const admin = createAdminClient();

  const { data: paymentRow } = paymentLinkId
    ? await admin
        .from("payments")
        .select("*")
        .eq("razorpay_payment_link_id", paymentLinkId)
        .maybeSingle()
    : orderId
      ? await admin
          .from("payments")
          .select("*")
          .eq("razorpay_order_id", orderId)
          .maybeSingle()
      : { data: null };

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
      razorpay_signature: signature,
      ...(orderId ? { razorpay_order_id: orderId } : {}),
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
