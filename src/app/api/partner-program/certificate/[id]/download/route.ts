import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderClassPartnerCertificatePdf } from "@/lib/class-partner-certificate";

/**
 * No-auth certificate download, keyed by applicationId (an unguessable
 * UUID) — same trust model as the tournament receipt/ID-card routes.
 * Used both for the instant auto-download right after signup and by the
 * public mobile-number lookup page (which resolves to this URL once the
 * mobile number matches).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const isInline = url.searchParams.get("view") === "true";

  const admin = createAdminClient();

  const { data: application } = await admin
    .from("partner_program_applications")
    .select("name, team_code, unique_id, partner_type")
    .eq("id", id)
    .maybeSingle();

  if (!application) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const isSquad = application.partner_type === "classmate";
  // Squad's certificate shows their own personal ID (not a recruiting
  // code — they don't recruit anyone), so it depends on allocate_partner_
  // unique_id having run instead of just the team_code assignment.
  const code = isSquad ? application.unique_id : application.team_code;

  if (!code) {
    return NextResponse.json(
      { error: "Your code is still being generated — try again in a moment" },
      { status: 404 },
    );
  }

  const pdfBuffer = await renderClassPartnerCertificatePdf({
    name: application.name,
    teamCode: code,
    partnerType: application.partner_type as "campus" | "class" | "classmate",
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="YCC-Certificate-${application.team_code}.pdf"`,
    },
  });
}
