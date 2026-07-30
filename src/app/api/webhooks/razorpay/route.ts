import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { confirmPayment } from "@/lib/confirm-payment";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;

  // Only "payment.captured" confirms funds actually landed.
  if (event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const paymentEntity = payload.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id as string | undefined;
  const paymentId = paymentEntity?.id as string | undefined;

  if (!orderId || !paymentId) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const result = await confirmPayment({
    orderId,
    paymentId,
    signature,
    rawPayload: payload,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ received: true });
}
