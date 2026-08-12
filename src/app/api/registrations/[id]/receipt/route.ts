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
    const missingIds = err instanceof Error && err.message.includes("missing a unique_id");
    return NextResponse.json(
      {
        error: missingIds
          ? `Receipt isn't ready yet — contact support with registration ID ${id}`
          : "Receipt not found — registration may not be confirmed yet",
      },
      { status: missingIds ? 500 : 404 },
    );
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="YCC-Receipt-${id}.pdf"`,
    },
  });
}
