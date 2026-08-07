import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { partnerProgramApplicationSchema } from "@/lib/validations/partner-program";
import { isRateLimited } from "@/lib/rate-limit";

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

  const { data: college } = await admin
    .from("colleges")
    .select("id")
    .eq("id", input.collegeId)
    .maybeSingle();

  if (!college) {
    return NextResponse.json({ error: "Select a valid college" }, { status: 400 });
  }

  const { data: application, error } = await admin
    .from("partner_program_applications")
    .insert({
      name: input.name,
      email: input.email,
      college_id: college.id,
      stream: input.stream,
      semester: input.semester,
      mobile: input.mobile,
      instagram_handle: input.instagramHandle,
      referred_by: input.referredBy || null,
      agreement_q1: input.agreementQ1,
      agreement_q2: input.agreementQ2,
      agreement_q3: input.agreementQ3,
    })
    .select("id")
    .single();

  if (error || !application) {
    return NextResponse.json(
      { error: "Could not submit application" },
      { status: 500 },
    );
  }

  return NextResponse.json({ applicationId: application.id });
}
