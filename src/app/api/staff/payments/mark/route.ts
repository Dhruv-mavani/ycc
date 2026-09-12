import { NextResponse } from "next/server";
import { getStaffOrAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { markCashPaymentPaid, markCashPaymentUnpaid } from "@/lib/pay-at-venue-payment";

export async function POST(request: Request) {
  const session = await getStaffOrAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const registrationId = body?.registrationId;
  const paid = body?.paid;

  if (typeof registrationId !== "string" || typeof paid !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    if (paid) {
      await markCashPaymentPaid(admin, registrationId, session.userId);
    } else {
      await markCashPaymentUnpaid(admin, registrationId);
    }
  } catch {
    return NextResponse.json(
      { error: "Could not update payment status" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
