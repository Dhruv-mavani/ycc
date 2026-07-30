import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rate-limit";

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

  const admin = createAdminClient();

  // Unique ID lookup — go via participants, since that's what the ID identifies.
  const { data: participant } = await admin
    .from("participants")
    .select("registration_id")
    .eq("unique_id", query.toUpperCase())
    .maybeSingle();

  if (participant) {
    const { data: registration } = await admin
      .from("registrations")
      .select("id")
      .eq("id", participant.registration_id)
      .eq("status", "confirmed")
      .maybeSingle();
    if (registration) {
      return NextResponse.json({ registrationId: registration.id });
    }
  }

  // Mobile number lookup — matches the registration's primary contact number.
  if (/^[6-9]\d{9}$/.test(query)) {
    const { data: registration } = await admin
      .from("registrations")
      .select("id")
      .eq("captain_phone", query)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (registration) {
      return NextResponse.json({ registrationId: registration.id });
    }
  }

  return NextResponse.json(
    { error: "No confirmed registration found for that ID or mobile number" },
    { status: 404 },
  );
}
