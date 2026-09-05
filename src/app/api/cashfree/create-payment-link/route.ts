import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCashfreeClient } from "@/lib/cashfree";

const SITE_URL = "https://www.ycct10.in";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const registrationId = body?.registrationId;

  if (typeof registrationId !== "string") {
    return NextResponse.json(
      { error: "registrationId is required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: registration } = await admin
    .from("registrations")
    .select("*, events(name)")
    .eq("id", registrationId)
    .maybeSingle();

  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 },
    );
  }
  if (registration.status !== "pending_payment") {
    return NextResponse.json(
      { error: `Registration is already ${registration.status}` },
      { status: 409 },
    );
  }

  const cashfree = getCashfreeClient();
  const eventName = (registration as { events?: { name?: string } }).events?.name ?? "YCC event";

  // Cashfree link_ids can't be reused (409 link_already_exists) — suffix
  // with a timestamp so a retried/abandoned payment always gets a fresh
  // link rather than colliding with a previous attempt's id.
  const linkId = `${registration.id}-${Date.now()}`;

  const response = await cashfree.PGCreateLink({
    link_id: linkId,
    // Cashfree amounts are decimal rupees, not paise.
    link_amount: registration.amount_paise / 100,
    link_currency: "INR",
    link_purpose: `${eventName} registration`,
    customer_details: {
      customer_phone: registration.captain_phone,
      customer_name: registration.captain_name ?? undefined,
      customer_email: registration.captain_email ?? undefined,
    },
    // We already control the on-site confirmation UX (payment-status
    // poller) — skip Cashfree's own SMS/email notifications so the
    // applicant isn't messaged twice.
    link_notify: { send_sms: false, send_email: false },
    link_notes: { registrationId: registration.id },
    link_meta: {
      return_url: `${SITE_URL}/payment/success?registration=${registration.id}`,
      notify_url: `${SITE_URL}/api/webhooks/cashfree`,
    },
  });

  const { error: paymentError } = await admin.from("payments").insert({
    registration_id: registration.id,
    cashfree_link_id: linkId,
    amount_paise: registration.amount_paise,
    status: "created",
  });

  if (paymentError) {
    return NextResponse.json(
      { error: "Could not create payment record" },
      { status: 500 },
    );
  }

  return NextResponse.json({ shortUrl: response.data.link_url });
}
