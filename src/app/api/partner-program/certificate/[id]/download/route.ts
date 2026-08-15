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
    .select("name, team_code, partner_type")
    .eq("id", id)
    .maybeSingle();

  if (!application || application.partner_type === "classmate") {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  if (!application.team_code) {
    return NextResponse.json(
      { error: "Your code is still being generated — try again in a moment" },
      { status: 404 },
    );
  }

  const pdfBuffer = await renderClassPartnerCertificatePdf({
    name: application.name,
    teamCode: application.team_code,
    partnerType: application.partner_type as "campus" | "class",
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="YCC-Certificate-${application.team_code}.pdf"`,
    },
  });
}
