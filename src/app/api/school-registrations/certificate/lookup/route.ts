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
 * Resolves a WhatsApp number to a registrationId, so the client can redirect
 * to the no-auth certificate download route — same pattern as the Partner
 * Program's certificate lookup.
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
      { error: parsed.error.issues[0]?.message ?? "Invalid WhatsApp number" },
      { status: 400 },
    );
  }

  const { whatsapp } = parsed.data;
  const admin = createAdminClient();
  const { data: registration } = await admin
    .from("school_tournament_registrations")
    .select("id")
    .eq("whatsapp", whatsapp)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!registration) {
    return NextResponse.json(
      { error: "No certificate found for that WhatsApp number" },
      { status: 404 },
    );
  }

  return NextResponse.json({ registrationId: registration.id });
}
