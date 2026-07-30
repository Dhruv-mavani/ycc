import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildReceiptPdf } from "@/lib/receipt-builder";
import { sendReceiptEmail } from "@/lib/email";

/**
 * Runs once a payment is confirmed (called from the Razorpay webhook /
 * verify-payment route): allocates unique IDs and, if a contact email was
 * collected, emails the receipt. Idempotent — unique_id allocation is a
 * no-op for participants that already have one — so it's safe to retry.
 * Auto-download on the success page is the primary delivery path; email is
 * best-effort since 01-spec.md's form doesn't collect an email address.
 */
export async function finalizeRegistration(registrationId: string) {
  const admin = createAdminClient();

  const { error: allocError } = await admin.rpc("allocate_unique_ids", {
    p_registration_id: registrationId,
  });
  if (allocError) throw allocError;

  const { pdfBuffer, registration } = await buildReceiptPdf(registrationId);

  if (!registration.captain_email) return;

  await sendReceiptEmail({
    to: registration.captain_email,
    subject: `YCC Registration Confirmed`,
    html: `<p>Hi ${registration.captain_name ?? ""},</p>
      <p>Your registration is confirmed.
      Your receipt with unique ID(s) and QR code(s) for venue entry is attached.</p>
      <p>See you there!<br/>Team YCC</p>`,
    pdfBuffer,
    filename: `YCC-Receipt-${registration.id}.pdf`,
  });
}
