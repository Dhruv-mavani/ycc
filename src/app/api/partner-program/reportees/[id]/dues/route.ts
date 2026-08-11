import { NextResponse } from "next/server";
import { getPartnerAccessStatus } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Lets a Class Partner check/uncheck whether a Classmate Partner has paid
// them their share of the team fee — separate bookkeeping from the actual
// Razorpay payment, which the captain makes as one lump sum per team.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getPartnerAccessStatus();

  if (access.state !== "approved" || access.application.partnerType !== "class") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ id }, body] = await Promise.all([
    params,
    request.json().catch(() => null),
  ]);
  const duesPaid = body?.duesPaid;

  if (typeof duesPaid !== "boolean") {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  }

  const admin = createAdminClient();

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
    .update({ dues_paid: duesPaid })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
