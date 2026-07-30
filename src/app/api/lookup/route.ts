import { NextResponse } from "next/server";
import { getStaffOrAdminSession } from "@/lib/auth";
import { searchParticipants } from "@/lib/lookup";

export async function GET(request: Request) {
  const session = await getStaffOrAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const collegeId = searchParams.get("collegeId") ?? undefined;

  const results = await searchParticipants(q, collegeId);
  return NextResponse.json({ results });
}
