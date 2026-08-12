import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { partnerProgramApplicationSchema } from "@/lib/validations/partner-program";
import { isRateLimited } from "@/lib/rate-limit";
import { generatePartnerCode } from "@/lib/partner-approval";

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

  if (input.partnerType !== "campus") {
    const parentType = input.partnerType === "class" ? "campus" : "class";
    const { data: referrer } = input.referredById
      ? await admin
          .from("partner_program_applications")
          .select("id")
          .eq("id", input.referredById)
          .eq("partner_type", parentType)
          .eq("status", "approved")
          .maybeSingle()
      : { data: null };

    if (!referrer) {
      return NextResponse.json({ error: "Select a valid referrer" }, { status: 400 });
    }
  }

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name },
  });

  if (authError || !authUser.user) {
    const message = authError?.message.includes("already been registered")
      ? "An account with this email already exists — try logging in instead"
      : "Could not create your account";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  // YCC Partners and YCC Co-Partners skip approval entirely — they're
  // active the moment they apply, so they can get their code and
  // certificate immediately. Classmate Partners still wait for review
  // (that flow is being redesigned separately).
  const status = input.partnerType === "classmate" ? "pending" : "approved";

  const { data: application, error } = await admin
    .from("partner_program_applications")
    .insert({
      name: input.name,
      email: input.email,
      user_id: authUser.user.id,
      partner_type: input.partnerType,
      mobile: input.mobile,
      instagram_handle: input.instagramHandle,
      referred_by: input.partnerType === "campus" ? input.referredBy || null : null,
      referred_by_id: input.partnerType === "campus" ? null : input.referredById,
      agreed_to_terms: input.agreedToTerms,
      status,
    })
    .select("id")
    .single();

  if (error || !application) {
    // Don't leave an orphaned login with no application behind.
    await admin.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json(
      { error: "Could not submit application" },
      { status: 500 },
    );
  }

  if (status === "approved") {
    await generatePartnerCode(admin, application.id);
  }

  return NextResponse.json({ applicationId: application.id });
}
