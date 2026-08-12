import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateQrDataUrl } from "@/lib/qr";
import { renderReceiptPdf } from "@/lib/receipts";

/**
 * Rebuilds the receipt PDF for a confirmed registration from scratch (no
 * stored blob — regenerated on demand). Shared by the payment-confirmation
 * flow (email attachment), the immediate post-payment auto-download, and
 * the later re-download-by-unique-ID-or-mobile flow. Assumes unique IDs
 * have already been allocated (finalizeRegistration does this once, at
 * confirmation time).
 */
export async function buildReceiptPdf(registrationId: string): Promise<{
  pdfBuffer: Buffer;
  registration: {
    id: string;
    captain_name: string | null;
    captain_email: string | null;
  };
}> {
  const admin = createAdminClient();

  const { data: registration, error: regError } = await admin
    .from("registrations")
    .select("*")
    .eq("id", registrationId)
    .eq("status", "confirmed")
    .single();
  if (regError || !registration)
    throw regError ?? new Error("confirmed registration not found");

  const [{ data: event }, { data: college }, { data: participants }, { data: payment }] =
    await Promise.all([
      admin.from("events").select("*").eq("id", registration.event_id).single(),
      admin
        .from("colleges")
        .select("*")
        .eq("id", registration.college_id)
        .single(),
      admin
        .from("participants")
        .select("*")
        .eq("registration_id", registrationId)
        .order("is_captain", { ascending: false })
        .order("created_at"),
      admin
        .from("payments")
        .select("razorpay_payment_id, updated_at")
        .eq("registration_id", registrationId)
        .eq("status", "paid")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (!event) throw new Error("event not found");
  if (!college) throw new Error("college not found");

  const missingUniqueId = (participants ?? []).filter((p) => !p.unique_id);
  if (missingUniqueId.length > 0) {
    // Shouldn't happen for a confirmed registration (unique IDs are
    // allocated at confirmation time), but surfacing a clear cause here
    // beats generateQrDataUrl throwing an opaque "Invalid data" a few
    // lines down for a null unique_id.
    throw new Error(
      `Registration ${registrationId} is confirmed but ${missingUniqueId.length} participant(s) are missing a unique_id — check-in ID allocation may have failed`,
    );
  }

  const participantsWithQr = await Promise.all(
    (participants ?? []).map(async (p) => ({
      name: p.name,
      uniqueId: p.unique_id!,
      qrDataUrl: await generateQrDataUrl(p.unique_id!),
    })),
  );

  const pdfBuffer = await renderReceiptPdf({
    registrationId: registration.id,
    eventName: event.name,
    eventType: event.type,
    collegeName: college.name,
    collegeCity: college.city,
    teamName: registration.team_name,
    type: registration.type,
    basePaise: event.fee_paise,
    paidAt: payment?.updated_at ?? new Date().toISOString(),
    razorpayPaymentId: payment?.razorpay_payment_id ?? null,
    captainName: registration.captain_name,
    participants: participantsWithQr,
  });

  return { pdfBuffer, registration };
}
