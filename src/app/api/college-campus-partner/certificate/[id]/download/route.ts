import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderCollegeCampusPartnerCertificatePdf } from "@/lib/college-campus-partner-certificate";

/**
 * No-auth certificate download, keyed by applicationId (an unguessable
 * UUID) — same trust model as the Partner Program certificate route. Used
 * both for the instant auto-download right after signup and by the public
 * mobile-number lookup page.
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
    .from("college_campus_partner_applications")
    .select("name, code")
    .eq("id", id)
    .maybeSingle();

  if (!application) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  if (!application.code) {
    return NextResponse.json(
      { error: "Your code is still being generated — try again in a moment" },
      { status: 404 },
    );
  }

  const pdfBuffer = await renderCollegeCampusPartnerCertificatePdf({
    name: application.name,
    code: application.code,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="YCC-College-Campus-Partner-${application.code}.pdf"`,
    },
  });
}
