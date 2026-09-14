import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rate-limit";
import { individualFreeCertificateLookupSchema } from "@/lib/validations/registration";

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
  const admin = createAdminClient();

  const { data: byCode } = await admin
    .from("individual_free_registrations")
    .select("id")
    .eq("code", query.toUpperCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byCode) {
    return NextResponse.json({ registrationId: byCode.id });
  }

  if (/^[6-9]\d{9}$/.test(query)) {
    const { data: byPhone } = await admin
      .from("individual_free_registrations")
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
