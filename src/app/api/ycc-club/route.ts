import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { yccClubApplicationSchema } from "@/lib/validations/ycc-club";
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
  if (isRateLimited(`ycc-club-apply:${ip}`, { max: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = yccClubApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  const { data: existingApplication } = await admin
    .from("ycc_club_applications")
    .select("id")
    .eq("mobile", input.mobile)
    .maybeSingle();

  if (existingApplication) {
    return NextResponse.json(
      { error: "This mobile number has already joined YCC Club" },
      { status: 409 },
    );
  }

  const { data: application, error } = await admin
    .from("ycc_club_applications")
    .insert({
      name: input.name,
      mobile: input.mobile,
      gender: input.gender,
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

  return NextResponse.json({ applicationId: application.id });
}
