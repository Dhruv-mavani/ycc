import "server-only";
import { Cashfree, CFEnvironment } from "cashfree-pg";

export function getCashfreeClient() {
  return new Cashfree(
    process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID!,
    process.env.CASHFREE_SECRET_KEY!,
  );
}

/**
 * Verifies the `x-webhook-signature` header on an incoming webhook request
 * and returns the parsed payload on success, or null on an invalid
 * signature. Unlike Razorpay (HMAC over the raw body alone, hex-encoded),
 * Cashfree signs `timestamp + rawBody` and encodes as base64 — the SDK
 * handles both the verification and the parsing in one call.
 */
export function verifyAndParseWebhook(
  rawBody: string,
  signature: string,
  timestamp: string,
): Record<string, unknown> | null {
  try {
    const event = getCashfreeClient().PGVerifyWebhookSignature(signature, rawBody, timestamp);
    return event.object as Record<string, unknown>;
  } catch {
    return null;
  }
}
