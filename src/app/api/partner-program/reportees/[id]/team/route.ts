import { NextResponse } from "next/server";
import { getPartnerAccessStatus } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getPartnerAccessStatus();

  // Only a Class Partner sorts their Classmate Partners into teams.
  if (access.state !== "approved" || access.application.partnerType !== "class") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ id }, body] = await Promise.all([
    params,
    request.json().catch(() => null),
  ]);
  const team = body?.team;

  if (team !== "A" && team !== "B" && team !== null) {
    return NextResponse.json({ error: "Invalid team" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify this classmate actually belongs to the caller and is approved —
  // unapproved applicants can't be sorted into a team yet.
  const { data: target } = await admin
    .from("partner_program_applications")
    .select("id, referred_by_id, partner_type, status")
    .eq("id", id)
    .maybeSingle();

  if (
    !target ||
    target.referred_by_id !== access.application.id ||
    target.partner_type !== "classmate" ||
    target.status !== "approved"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await admin
    .from("partner_program_applications")
    .update({ team })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not update team" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
