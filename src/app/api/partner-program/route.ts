import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { partnerProgramApplicationSchema } from "@/lib/validations/partner-program";
import { isRateLimited } from "@/lib/rate-limit";
import { generatePartnerCode } from "@/lib/partner-approval";
import type { PartnerType } from "@/lib/supabase/types";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`partner-program-apply:${ip}`, { max: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = partnerProgramApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  // One application per person — without this, the same mobile number
  // could apply multiple times (as a Co-Partner under different Partners,
  // or twice under the same one), inflating the "X Co-Partners"/"Squad"
  // counts shown in the admin dashboard. A DB-level unique constraint on
  // `mobile` is the real safety net against races; this is just for a
  // friendlier error than a raw constraint-violation 500.
  const { data: existingApplication } = await admin
    .from("partner_program_applications")
    .select("id")
    .eq("mobile", input.mobile)
    .maybeSingle();

  if (existingApplication) {
    return NextResponse.json(
      { error: "This mobile number has already applied to the Partner Program" },
      { status: 409 },
    );
  }

  if (input.partnerType !== "campus") {
    // A Co-Partner's referrer must be a Partner. A Squad member can attach
    // to either a Co-Partner or, skipping a level, a Partner directly.
    const allowedParentTypes: PartnerType[] =
      input.partnerType === "class" ? ["campus"] : ["campus", "class"];
    const { data: referrer } = input.referredById
      ? await admin
          .from("partner_program_applications")
          .select("id")
          .eq("id", input.referredById)
          .in("partner_type", allowedParentTypes)
          .eq("status", "approved")
          .maybeSingle()
      : { data: null };

    if (!referrer) {
      return NextResponse.json({ error: "Select a valid referrer" }, { status: 400 });
    }
  }

  // Every partner type is active the moment they apply — no referrer or
  // admin review gate — so they can get their code and certificate
  // immediately. No account/login is created — the certificate download
  // (right after this call) and the mobile-number lookup page are the
  // only ways this application is ever retrieved again.
  const { data: application, error } = await admin
    .from("partner_program_applications")
    .insert({
      name: input.name,
      email: input.email,
      partner_type: input.partnerType,
      mobile: input.mobile,
      age: input.age,
      gender: input.gender,
      instagram_handle: input.instagramHandle,
      referred_by: input.partnerType === "campus" ? input.referredBy || null : null,
      referred_by_id: input.partnerType === "campus" ? null : input.referredById,
      agreed_to_terms: input.agreedToTerms,
      whatsapp_joined_at: new Date().toISOString(),
      instagram_joined_at: new Date().toISOString(),
      status: "approved",
    })
    .select("id")
    .single();

  if (error || !application) {
    return NextResponse.json(
      { error: "Could not submit application" },
      { status: 500 },
    );
  }

  await generatePartnerCode(admin, application.id);

  return NextResponse.json({ applicationId: application.id });
}
