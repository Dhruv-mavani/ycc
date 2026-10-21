import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { collegeCampusPartnerCertificateLookupSchema } from "@/lib/validations/college-campus-partner";
import { lookupCollegeCampusPartnerCertificate } from "@/lib/registration-lookup";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Resolves a mobile number OR the personalized code (e.g. "TEST7771") to
 * an applicationId, so the client can redirect to the no-auth certificate
 * download route — same pattern as the individual-free-registrations and
 * school-registrations certificate lookup routes.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`college-campus-partner-certificate-lookup:${ip}`, { max: 8, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = collegeCampusPartnerCertificateLookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const query = parsed.data.query.trim();
  const result = await lookupCollegeCampusPartnerCertificate(query);

  if (result) {
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "No certificate found for that mobile number or code" },
    { status: 404 },
  );
}
