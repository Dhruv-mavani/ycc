import { NextResponse } from "next/server";
import { getStaffOrAdminSession } from "@/lib/auth";
import { searchRegistrationsForPayment } from "@/lib/payment-lookup";

export async function GET(request: Request) {
  const session = await getStaffOrAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const q = searchParams.get("q") ?? "";

  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const results = await searchRegistrationsForPayment(eventId, q);
  return NextResponse.json({ results });
}
