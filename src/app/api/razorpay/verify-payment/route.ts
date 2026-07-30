import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { confirmPayment } from "@/lib/confirm-payment";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const orderId = body?.razorpay_order_id;
  const paymentId = body?.razorpay_payment_id;
  const signature = body?.razorpay_signature;

  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing payment fields" },
      { status: 400 },
    );
  }

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const result = await confirmPayment({ orderId, paymentId, signature });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    registrationId: result.registrationId,
  });
}
