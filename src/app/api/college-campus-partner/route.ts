import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { collegeCampusPartnerApplicationSchema } from "@/lib/validations/college-campus-partner";
import { isRateLimited } from "@/lib/rate-limit";
import { generateCollegeCampusPartnerCode } from "@/lib/college-campus-partner-approval";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`college-campus-partner-apply:${ip}`, { max: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = collegeCampusPartnerApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  const { data: existingApplication } = await admin
    .from("college_campus_partner_applications")
    .select("id")
    .eq("mobile", input.mobile)
    .maybeSingle();

  if (existingApplication) {
    return NextResponse.json(
      { error: "This mobile number has already applied" },
      { status: 409 },
    );
  }

  const { data: application, error } = await admin
    .from("college_campus_partner_applications")
    .insert({
      college_id: input.collegeId,
      stream: input.stream,
      year: input.year,
      semester: input.semester,
      name: input.name,
      mobile: input.mobile,
      email: input.email,
      instagram_handle: input.instagramHandle,
      age: input.age,
      gender: input.gender,
      agreed_to_terms: input.agreedToTerms,
      whatsapp_joined_at: new Date().toISOString(),
      instagram_joined_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !application) {
    return NextResponse.json(
      { error: "Could not submit application" },
      { status: 500 },
    );
  }

  await generateCollegeCampusPartnerCode(admin, application.id);

  return NextResponse.json({ applicationId: application.id });
}
