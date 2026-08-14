import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rate-limit";
import { partnerCertificateLookupSchema } from "@/lib/validations/partner-program";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Resolves a mobile number to an applicationId, so the client can redirect
 * to the no-auth certificate download route. No password check — the
 * team code printed on the certificate is meant to be shared with
 * downstream partners anyway, so this isn't guarding anything sensitive.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`partner-certificate-lookup:${ip}`, { max: 8, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = partnerCertificateLookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid mobile number" },
      { status: 400 },
    );
  }

  const { mobile } = parsed.data;
  const admin = createAdminClient();
  const { data: application } = await admin
    .from("partner_program_applications")
    .select("id")
    .eq("mobile", mobile)
    .in("partner_type", ["campus", "class"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!application) {
    return NextResponse.json(
      { error: "No certificate found for that mobile number" },
      { status: 404 },
    );
  }

  return NextResponse.json({ applicationId: application.id });
}
