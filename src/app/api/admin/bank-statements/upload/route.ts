import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  uploadBankStatement,
  PaymentSubmissionError,
} from "@/lib/box-cricket-payment-verification";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    await uploadBankStatement(file, session.user.id);
  } catch (err) {
    if (err instanceof PaymentSubmissionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not upload file" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
