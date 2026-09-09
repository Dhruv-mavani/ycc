import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rate-limit";
import { schoolCertificateLookupSchema } from "@/lib/validations/registration";

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
  const admin = createAdminClient();

  // Code lookup — the personalized code (e.g. "MEGH9999") printed on the
  // certificate, always stored uppercase.
  const { data: byCode } = await admin
    .from("school_tournament_registrations")
    .select("id")
    .eq("code", query.toUpperCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byCode) {
    return NextResponse.json({ registrationId: byCode.id });
  }

  // WhatsApp number lookup — only attempted if the query looks like a
  // 10-digit Indian mobile number, same as the receipt lookup route.
  if (/^[6-9]\d{9}$/.test(query)) {
    const { data: byPhone } = await admin
      .from("school_tournament_registrations")
      .select("id")
      .eq("whatsapp", query)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byPhone) {
      return NextResponse.json({ registrationId: byPhone.id });
    }
  }

  return NextResponse.json(
    { error: "No certificate found for that WhatsApp number or code" },
    { status: 404 },
  );
}
