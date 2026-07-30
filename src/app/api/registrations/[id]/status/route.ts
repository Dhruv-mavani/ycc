import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: registration } = await admin
    .from("registrations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: event } = await admin
    .from("events")
    .select("name, slug")
    .eq("id", registration.event_id)
    .single();

  let participants: { name: string; uniqueId: string | null }[] = [];
  if (registration.status === "confirmed") {
    const { data } = await admin
      .from("participants")
      .select("name, unique_id")
      .eq("registration_id", id)
      .order("is_captain", { ascending: false })
      .order("created_at");
    participants = (data ?? []).map((p) => ({
      name: p.name,
      uniqueId: p.unique_id,
    }));
  }

  return NextResponse.json({
    status: registration.status,
    eventName: event?.name ?? "",
    teamName: registration.team_name,
    amountPaise: registration.amount_paise,
    participants,
  });
}
