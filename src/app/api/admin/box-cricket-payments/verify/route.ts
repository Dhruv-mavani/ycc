import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { verifyBoxCricketPayment } from "@/lib/box-cricket-payment-verification";

// Admin-only, deliberately — this is the one click that flips a
// registration to "paid" everywhere (receipts, the staff cash toggle),
// so it's gated to the same admins table every other money-moving action
// already requires, not staff. See the conversation this was built from
// for the full reasoning (screenshots carry PII; this is also the point
// where the admin is expected to have actually cross-checked the real
// bank statement, not just glanced at the image).
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const submissionId = body?.submissionId;
  if (typeof submissionId !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await verifyBoxCricketPayment(submissionId, session.user.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
