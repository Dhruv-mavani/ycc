import { NextResponse } from "next/server";
import { getPartnerAccessStatus } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PartnerType } from "@/lib/supabase/types";

const CHILD_TYPE: Partial<Record<PartnerType, PartnerType>> = {
  campus: "class",
  class: "classmate",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getPartnerAccessStatus();
  if (access.state !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const childType = CHILD_TYPE[access.application.partnerType];
  if (!childType) {
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

  // Verify this reportee actually belongs to the caller before touching it —
  // the caller only has authority over applicants who named them as referrer.
  const { data: target } = await admin
    .from("partner_program_applications")
    .select("id, referred_by_id, partner_type")
    .eq("id", id)
    .maybeSingle();

  if (
    !target ||
    target.referred_by_id !== access.application.id ||
    target.partner_type !== childType
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await admin
    .from("partner_program_applications")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: access.user.id,
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
