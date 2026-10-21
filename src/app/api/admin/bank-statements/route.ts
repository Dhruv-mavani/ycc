import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { listBankStatements } from "@/lib/box-cricket-payment-verification";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await listBankStatements();
  return NextResponse.json({ results });
}
