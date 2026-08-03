import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("volunteer_applications").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Could not delete volunteer application" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
