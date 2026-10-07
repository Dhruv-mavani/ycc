import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { listBoxCricketPaymentSubmissions } from "@/lib/box-cricket-payment-verification";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as
    | "pending"
    | "verified"
    | "rejected"
    | "all"
    | null;

  const results = await listBoxCricketPaymentSubmissions(status ?? "pending");
  return NextResponse.json({ results });
}
