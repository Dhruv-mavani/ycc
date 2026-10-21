import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { schoolCertificateLookupSchema } from "@/lib/validations/registration";
import { lookupSchoolCertificate } from "@/lib/registration-lookup";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Resolves a WhatsApp number OR the personalized code (e.g. "MEGH9999") to
 * a registrationId, so the client can redirect to the no-auth certificate
 * download route — same "either field" pattern as the general receipt
 * lookup (unique ID or mobile number).
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`school-certificate-lookup:${ip}`, { max: 8, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schoolCertificateLookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const query = parsed.data.query.trim();
  const result = await lookupSchoolCertificate(query);

  if (result) {
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "No certificate found for that WhatsApp number or code" },
    { status: 404 },
  );
}
