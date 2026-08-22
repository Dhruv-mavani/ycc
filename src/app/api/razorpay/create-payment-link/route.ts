import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay";

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

  const razorpay = getRazorpayClient();
  const eventName = (registration as { events?: { name?: string } }).events?.name ?? "YCC event";

  const paymentLink = await razorpay.paymentLink.create({
    amount: registration.amount_paise,
    currency: "INR",
    description: `${eventName} registration`,
    reference_id: registration.id,
    customer: {
      name: registration.captain_name ?? undefined,
      email: registration.captain_email ?? undefined,
      contact: registration.captain_phone,
    },
    // We already control the on-site confirmation UX (payment-status
    // poller) — skip Razorpay's own SMS/email notifications so the
    // applicant isn't messaged twice.
    notify: { sms: false, email: false },
    callback_url: `${SITE_URL}/payment/success?registration=${registration.id}`,
    callback_method: "get",
  });

  const { error: paymentError } = await admin.from("payments").insert({
    registration_id: registration.id,
    razorpay_payment_link_id: paymentLink.id,
    amount_paise: registration.amount_paise,
    status: "created",
  });

  if (paymentError) {
    return NextResponse.json(
      { error: "Could not create payment record" },
      { status: 500 },
    );
  }

  return NextResponse.json({ shortUrl: paymentLink.short_url });
}
