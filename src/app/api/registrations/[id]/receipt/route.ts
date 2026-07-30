import { NextResponse } from "next/server";
import { buildReceiptPdf } from "@/lib/receipt-builder";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const isInline = url.searchParams.get("view") === "true";

  let pdfBuffer: Buffer;
  try {
    ({ pdfBuffer } = await buildReceiptPdf(id));
  } catch (err) {
    console.error("buildReceiptPdf failed for", id, err);
    return NextResponse.json(
      { error: "Receipt not found — registration may not be confirmed yet" },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="YCC-Receipt-${id}.pdf"`,
    },
  });
}
