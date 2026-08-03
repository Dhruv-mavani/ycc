import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since") ?? new Date(0).toISOString();

  const admin = createAdminClient();
  const [{ count: pendingStaffCount }, { count: newVolunteerCount }] =
    await Promise.all([
      admin
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      admin
        .from("volunteer_applications")
        .select("*", { count: "exact", head: true })
        .gt("created_at", since),
    ]);

  return NextResponse.json({
    pendingStaffCount: pendingStaffCount ?? 0,
    newVolunteerCount: newVolunteerCount ?? 0,
  });
}
