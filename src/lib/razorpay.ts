import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";

export function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/**
 * Verifies the `x-razorpay-signature` header on an incoming webhook
 * request — HMAC-SHA256 of the raw request body using the separate
 * webhook secret (configured in the Razorpay dashboard, not the API
 * key_secret), hex-encoded. This is the one that actually matters for
 * confirming a payment; see confirm-razorpay-payment.ts.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
