import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ id }, body] = await Promise.all([
    params,
    request.json().catch(() => null),
  ]);
  const status = body?.status;

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("partner_program_applications")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.user.id,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Could not update application status" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
