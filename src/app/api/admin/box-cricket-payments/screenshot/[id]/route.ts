import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBoxCricketPaymentScreenshot } from "@/lib/box-cricket-payment-verification";

// Admin-only, and deliberately streamed through the server rather than a
// signed URL — screenshots can contain PII (payer name, partial UPI/bank
// details), so access is re-checked on every single view, not just once
// at link-generation time. Staff do NOT get this — only the paid/unpaid
// flag itself is staff-visible (via the existing Collect Payments panel).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getBoxCricketPaymentScreenshot(id);
  if (!result) {
    return NextResponse.json({ error: "Screenshot not found" }, { status: 404 });
  }

  return new NextResponse(result.data, {
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
