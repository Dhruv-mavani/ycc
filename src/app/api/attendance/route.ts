import { NextResponse } from "next/server";
import { getStaffOrAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const session = await getStaffOrAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const participantId = body?.participantId;
  const status = body?.status;

  if (
    typeof participantId !== "string" ||
    (status !== "present" && status !== "absent")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("attendance").upsert(
    {
      participant_id: participantId,
      status,
      marked_by: session.userId,
      marked_at: new Date().toISOString(),
    },
    { onConflict: "participant_id" },
  );

  if (error) {
    return NextResponse.json(
      { error: "Could not update attendance" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
