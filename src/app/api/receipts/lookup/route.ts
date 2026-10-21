import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { lookupReceiptRegistration } from "@/lib/registration-lookup";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`receipt-lookup:${ip}`, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "Enter a unique ID or mobile number" }, { status: 400 });
  }

  const result = await lookupReceiptRegistration(query);
  if (result) {
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "No confirmed registration found for that ID or mobile number" },
    { status: 404 },
  );
}
