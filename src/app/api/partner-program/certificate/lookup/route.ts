import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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
 * Resolves a mobile number + password to an applicationId, so the client
 * can redirect to the no-auth certificate download route. Verifies the
 * password via a throwaway (non-persisting) Supabase client — deliberately
 * not the request-bound server client, so this never mutates the caller's
 * own browser session with someone else's login.
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
      { error: parsed.error.issues[0]?.message ?? "Invalid mobile number or password" },
      { status: 400 },
    );
  }

  const { mobile, password } = parsed.data;
  const admin = createAdminClient();
  const { data: application } = await admin
    .from("partner_program_applications")
    .select("id, email, partner_type")
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

  const authClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error: authError } = await authClient.auth.signInWithPassword({
    email: application.email,
    password,
  });

  if (authError) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  return NextResponse.json({ applicationId: application.id });
}
