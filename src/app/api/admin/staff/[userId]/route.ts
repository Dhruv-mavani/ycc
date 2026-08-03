import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("staff").delete().eq("user_id", userId);

  if (error) {
    return NextResponse.json(
      { error: "Could not delete staff record" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
