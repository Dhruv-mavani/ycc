import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeRegistration } from "@/lib/finalize-registration";

/**
 * Marks a payment/registration paid+confirmed and runs receipt finalization.
 * Idempotent (keyed on payments.status) so it's safe to call multiple times
 * if Cashfree retries webhook delivery — whichever call lands first wins,
 * the rest no-op.
 *
 * Payment Links don't have a known order_id until the customer actually
 * pays, so the row is looked up by cashfreeLinkId (known at creation time)
 * — orderId is only available once payment succeeds and gets backfilled
 * onto the row for audit purposes.
 */
export async function confirmPayment({
  cashfreeLinkId,
  orderId,
  paymentId,
  rawPayload,
}: {
  cashfreeLinkId: string;
  orderId?: string;
  paymentId: string;
  rawPayload?: unknown;
}): Promise<
  { ok: true; registrationId: string } | { ok: false; error: string }
> {
  const admin = createAdminClient();

  const { data: paymentRow } = await admin
    .from("payments")
    .select("*")
    .eq("cashfree_link_id", cashfreeLinkId)
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
      cashfree_payment_id: paymentId,
      ...(orderId ? { cashfree_order_id: orderId } : {}),
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
