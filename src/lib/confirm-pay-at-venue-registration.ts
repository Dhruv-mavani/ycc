import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import { finalizeRegistration } from "@/lib/finalize-registration";

/**
 * Confirms a registration for a `pay_at_venue` event immediately, with no
 * Cashfree checkout — same end state (status "confirmed", unique IDs
 * allocated, receipt emailed) as `confirmPayment` reaches after a webhook,
 * minus the payment step. Deliberately does NOT insert a `payments` row:
 * that table represents actual Cashfree transactions, and its absence here
 * is exactly the signal (see buildReceiptPdf) that the fee is still owed in
 * cash at the venue, not "paid online for ₹0".
 */
export async function confirmPayAtVenueRegistration(
  admin: ReturnType<typeof createAdminClient>,
  registrationId: string,
) {
  await admin
    .from("registrations")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", registrationId);

  try {
    await finalizeRegistration(registrationId);
  } catch (err) {
    // Registration is already confirmed at this point; ID/receipt/email
    // generation failing shouldn't undo that. Log for manual follow-up.
    console.error("finalizeRegistration failed (pay-at-venue registration)", err);
  }
}
