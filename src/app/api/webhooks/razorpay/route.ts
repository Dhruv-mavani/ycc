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

  // "payment.captured" confirms funds landed for the Orders-flow checkout.
  // "payment_link.paid" is the equivalent for Payment Links — they don't
  // have a known order_id until this fires, so that flow is looked up by
  // the payment_link's own id instead (see confirmPayment).
  if (event !== "payment.captured" && event !== "payment_link.paid") {
    return NextResponse.json({ received: true });
  }

  const paymentEntity = payload.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id as string | undefined;
  const paymentId = paymentEntity?.id as string | undefined;
  const paymentLinkId =
    event === "payment_link.paid"
      ? (payload.payload?.payment_link?.entity?.id as string | undefined)
      : undefined;

  if (!paymentId || (event === "payment.captured" && !orderId) || (event === "payment_link.paid" && !paymentLinkId)) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const result = await confirmPayment({
    orderId,
    paymentLinkId,
    paymentId,
    signature,
    rawPayload: payload,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ received: true });
}
