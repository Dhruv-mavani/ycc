import { NextResponse } from "next/server";
import {
  submitBoxCricketPayment,
  PaymentSubmissionError,
} from "@/lib/box-cricket-payment-verification";

// Public — captain uploads their transaction id and payment screenshot.
// This never touches the `payments` table or marks anything paid; it only
// records a "pending" row for an admin to manually verify against the
// real bank statement. See box-cricket-payment-verification.ts.
export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const registrationId = formData.get("registrationId");
  const transactionId = formData.get("transactionId");
  const screenshot = formData.get("screenshot");

  if (
    typeof registrationId !== "string" ||
    typeof transactionId !== "string" ||
    !(screenshot instanceof File)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await submitBoxCricketPayment({ registrationId, transactionId, screenshot });
  } catch (err) {
    if (err instanceof PaymentSubmissionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("submitBoxCricketPayment failed", err);
    return NextResponse.json({ error: "Could not submit payment — please try again" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
