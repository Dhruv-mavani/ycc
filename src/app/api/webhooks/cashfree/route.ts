import { NextResponse } from "next/server";
import { verifyAndParseWebhook } from "@/lib/cashfree";
import { confirmPayment } from "@/lib/confirm-payment";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
  }

  const payload = verifyAndParseWebhook(rawBody, signature, timestamp);
  if (!payload) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // We only ever create Payment Links (not raw orders/checkout), so
  // PAYMENT_LINK_EVENT is the only event type we care about — it fires on
  // every link status transition (ACTIVE -> PAID / EXPIRED / CANCELLED).
  const type = payload.type as string | undefined;
  if (type !== "PAYMENT_LINK_EVENT") {
    return NextResponse.json({ received: true });
  }

  const data = (payload.data ?? {}) as {
    link_id?: string;
    link_status?: string;
    order?: { order_id?: string; transaction_id?: string };
  };

  if (data.link_status !== "PAID" || !data.link_id) {
    return NextResponse.json({ received: true });
  }

  const result = await confirmPayment({
    cashfreeLinkId: data.link_id,
    orderId: data.order?.order_id,
    paymentId: data.order?.transaction_id ?? data.order?.order_id ?? data.link_id,
    rawPayload: payload,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ received: true });
}
