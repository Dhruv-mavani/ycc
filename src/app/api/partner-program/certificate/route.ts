import { NextResponse } from "next/server";
import { getPartnerAccessStatus } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeClassPartnerApproval } from "@/lib/partner-approval";
import { generateQrDataUrl } from "@/lib/qr";
import { renderClassPartnerCertificatePdf } from "@/lib/class-partner-certificate";

export async function GET() {
  const access = await getPartnerAccessStatus();
  if (access.state !== "approved" || access.application.partnerType !== "class") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  let { data: application } = await admin
    .from("partner_program_applications")
    .select("name, team_code")
    .eq("id", access.application.id)
    .single();

  if (!application?.team_code) {
    // Approval normally generates this — fall back for any pre-existing
    // approved row from before this feature shipped.
    await finalizeClassPartnerApproval(admin, access.application.id);
    ({ data: application } = await admin
      .from("partner_program_applications")
      .select("name, team_code")
      .eq("id", access.application.id)
      .single());
  }

  if (!application?.team_code) {
    return NextResponse.json(
      { error: "Could not generate your certificate" },
      { status: 500 },
    );
  }

  const qrDataUrl = await generateQrDataUrl(application.team_code);
  const pdfBuffer = await renderClassPartnerCertificatePdf({
    name: application.name,
    teamCode: application.team_code,
    qrDataUrl,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="YCC-Class-Partner-Certificate-${application.team_code}.pdf"`,
    },
  });
}
