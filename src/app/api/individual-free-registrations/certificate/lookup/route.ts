import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { individualFreeCertificateLookupSchema } from "@/lib/validations/registration";
import { lookupIndividualFreeCertificate } from "@/lib/registration-lookup";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Resolves a WhatsApp number OR the personalized code (e.g. "DHRU9825") to
 * a registrationId — same pattern as the school-registrations certificate
 * lookup route.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`individual-free-certificate-lookup:${ip}`, { max: 8, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = individualFreeCertificateLookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const query = parsed.data.query.trim();
  const result = await lookupIndividualFreeCertificate(query);

  if (result) {
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "No certificate found for that WhatsApp number or code" },
    { status: 404 },
  );
}
