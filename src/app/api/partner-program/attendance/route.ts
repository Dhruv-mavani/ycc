import { NextResponse } from "next/server";
import { getStaffOrAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const session = await getStaffOrAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const applicationId = body?.applicationId;
  const status = body?.status;

  if (
    typeof applicationId !== "string" ||
    (status !== "present" && status !== "absent")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("partner_program_applications")
    .update({
      attendance_status: status,
      attendance_marked_by: session.userId,
      attendance_marked_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) {
    return NextResponse.json(
      { error: "Could not update attendance" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
