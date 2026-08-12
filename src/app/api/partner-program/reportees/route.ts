import { NextResponse } from "next/server";
import { getPartnerAccessStatus } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PartnerType } from "@/lib/supabase/types";

const CHILD_TYPE: Partial<Record<PartnerType, PartnerType>> = {
  campus: "class",
  class: "classmate",
};

export async function GET() {
  const access = await getPartnerAccessStatus();
  if (access.state !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const childType = CHILD_TYPE[access.application.partnerType];
  if (!childType) {
    return NextResponse.json({ reportees: [] });
  }

  const admin = createAdminClient();
  const { data: reportees, error } = await admin
    .from("partner_program_applications")
    .select(
      "id, name, email, mobile, instagram_handle, status, team, dues_paid, created_at",
    )
    .eq("referred_by_id", access.application.id)
    .eq("partner_type", childType)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load reportees" }, { status: 500 });
  }

  return NextResponse.json({ reportees: reportees ?? [] });
}
