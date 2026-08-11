import { NextResponse } from "next/server";
import { getPartnerAccessStatus } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Read-only view for a YCC Partner: each of their YCC Co-Partner
 * reportees, together with that YCC Co-Partner's own Classmate Partner
 * reportees (name/contact/team) — one level deeper than the regular
 * reportees endpoint, which only ever returns direct children.
 */
export async function GET() {
  const access = await getPartnerAccessStatus();
  if (access.state !== "approved" || access.application.partnerType !== "campus") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: classPartners, error: classPartnersError } = await admin
    .from("partner_program_applications")
    .select("id, name, status")
    .eq("referred_by_id", access.application.id)
    .eq("partner_type", "class")
    .order("name");

  if (classPartnersError) {
    return NextResponse.json({ error: "Could not load class partners" }, { status: 500 });
  }

  const classPartnerIds = (classPartners ?? []).map((c) => c.id);
  const { data: classmates, error: classmatesError } =
    classPartnerIds.length > 0
      ? await admin
          .from("partner_program_applications")
          .select(
            "id, name, email, mobile, stream, semester, status, team, referred_by_id",
          )
          .in("referred_by_id", classPartnerIds)
          .eq("partner_type", "classmate")
          .order("name")
      : { data: [], error: null };

  if (classmatesError) {
    return NextResponse.json({ error: "Could not load classmates" }, { status: 500 });
  }

  const result = (classPartners ?? []).map((cp) => ({
    ...cp,
    classmates: (classmates ?? []).filter((cm) => cm.referred_by_id === cp.id),
  }));

  return NextResponse.json({ classPartners: result });
}
