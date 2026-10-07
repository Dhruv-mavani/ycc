import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { rejectBoxCricketPayment } from "@/lib/box-cricket-payment-verification";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const submissionId = body?.submissionId;
  const reason = body?.reason;
  if (typeof submissionId !== "string" || typeof reason !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await rejectBoxCricketPayment(submissionId, session.user.id, reason);
  } catch {
    return NextResponse.json({ error: "Could not reject submission" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
