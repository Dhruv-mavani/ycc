import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderSuperChampsCertificatePdf } from "@/lib/superchamps-certificate";

/**
 * No-auth certificate download, keyed by registration id (an unguessable
 * UUID) — same trust model as the partner-program/event receipt routes.
 * Used for the instant auto-download right after form submission.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const isInline = url.searchParams.get("view") === "true";

  const admin = createAdminClient();

  const { data: registration } = await admin
    .from("school_tournament_registrations")
    .select("name, code")
    .eq("id", id)
    .maybeSingle();

  if (!registration) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const pdfBuffer = await renderSuperChampsCertificatePdf({
    name: registration.name,
    code: registration.code,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="YCC-Certificate-${registration.code}.pdf"`,
    },
  });
}
