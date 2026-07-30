import "server-only";
import Razorpay from "razorpay";
import crypto from "node:crypto";

export function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

function safeCompare(expectedHex: string, actualHex: string) {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(actualHex, "hex");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

/** Verifies the `x-razorpay-signature` header on incoming webhook requests. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return safeCompare(expected, signature);
}

/** Verifies the client-side checkout success signature, if used as a secondary check. */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeCompare(expected, signature);
}
