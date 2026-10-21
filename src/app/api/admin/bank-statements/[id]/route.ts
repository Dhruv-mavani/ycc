import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getBankStatementFile,
  deleteBankStatement,
} from "@/lib/box-cricket-payment-verification";

// Admin-only, streamed through the server — same reasoning as the payment
// screenshot route (bank statements are far more sensitive, so this
// matters even more here).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getBankStatementFile(id);
  if (!result) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(result.data, {
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `inline; filename="${result.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteBankStatement(id);
  return NextResponse.json({ ok: true });
}
