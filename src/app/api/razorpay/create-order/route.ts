import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay";

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
    .select("*")
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
  const order = await razorpay.orders.create({
    amount: registration.amount_paise,
    currency: "INR",
    receipt: registration.id,
    notes: { registrationId: registration.id },
  });

  const { error: paymentError } = await admin.from("payments").insert({
    registration_id: registration.id,
    razorpay_order_id: order.id,
    amount_paise: registration.amount_paise,
    status: "created",
  });

  if (paymentError) {
    return NextResponse.json(
      { error: "Could not create payment record" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    orderId: order.id,
    amountPaise: registration.amount_paise,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    registrationId: registration.id,
    captainName: registration.captain_name,
    captainEmail: registration.captain_email,
    captainPhone: registration.captain_phone,
  });
}
