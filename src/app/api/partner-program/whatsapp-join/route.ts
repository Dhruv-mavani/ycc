import { NextResponse } from "next/server";
import { getPartnerAccessStatus } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const access = await getPartnerAccessStatus();

  if (access.state !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("partner_program_applications")
    .update({ whatsapp_joined_at: new Date().toISOString() })
    .eq("id", access.application.id);

  if (error) {
    return NextResponse.json({ error: "Could not confirm" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
