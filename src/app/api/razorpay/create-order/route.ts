import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay";
import { isRazorpayEnabled } from "@/lib/app-settings";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const registrationId = body?.registrationId;

  if (typeof registrationId !== "string") {
    return NextResponse.json({ error: "registrationId is required" }, { status: 400 });
  }

  // Belt-and-braces — the kill switch is primarily enforced at
  // registration-creation time (confirmed immediately via cash instead of
  // ever reaching "pending_payment"), but checking again here means a
  // stale/cached page can't still fire a live Razorpay charge after the
  // switch was flipped off mid-session.
  if (!(await isRazorpayEnabled())) {
    return NextResponse.json(
      { error: "Online payment is temporarily unavailable — please pay in cash at the venue" },
      { status: 503 },
    );
  }

  const admin = createAdminClient();
  const { data: registration } = await admin
    .from("registrations")
    .select("*, events(name)")
    .eq("id", registrationId)
    .maybeSingle();

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }
  if (registration.status !== "pending_payment") {
    return NextResponse.json(
      { error: `Registration is already ${registration.status}` },
      { status: 409 },
    );
  }

  const razorpay = getRazorpayClient();
  const eventName = (registration as { events?: { name?: string } }).events?.name ?? "YCC event";

  // Razorpay receipt strings are capped at 40 chars and must be unique per
  // order attempt (a retried/abandoned order shouldn't collide) — same
  // reasoning as Cashfree's timestamp-suffixed link_id.
  const receipt = `${registration.id}-${Date.now()}`.slice(0, 40);

  const order = await razorpay.orders.create({
    amount: registration.amount_paise,
    currency: "INR",
    receipt,
    notes: { registrationId: registration.id, eventName },
  });

  const { error: paymentError } = await admin.from("payments").insert({
    registration_id: registration.id,
    razorpay_order_id: order.id,
    amount_paise: registration.amount_paise,
    status: "created",
  });

  if (paymentError) {
    return NextResponse.json({ error: "Could not create payment record" }, { status: 500 });
  }

  return NextResponse.json({
    orderId: order.id,
    amountPaise: registration.amount_paise,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    eventName,
    captainName: registration.captain_name,
    captainEmail: registration.captain_email,
    captainPhone: registration.captain_phone,
  });
}
