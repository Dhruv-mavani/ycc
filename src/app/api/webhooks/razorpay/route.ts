import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { confirmRazorpayPayment } from "@/lib/confirm-razorpay-payment";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
  }
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
        };
      };
    };
  };

  // "payment.captured" is the one event that means money has actually
  // settled — "payment.authorized" can still fail capture, and
  // "order.paid" fires for the same underlying event, so acting on just
  // this one avoids double-processing via two different event names.
  if (payload.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const payment = payload.payload?.payment?.entity;
  if (!payment?.order_id || !payment.id) {
    return NextResponse.json({ received: true });
  }

  const result = await confirmRazorpayPayment({
    razorpayOrderId: payment.order_id,
    paymentId: payment.id,
    rawPayload: payload,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ received: true });
}
