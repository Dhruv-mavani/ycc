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

  let participants: { id: string; name: string; uniqueId: string | null }[] = [];
  let paymentDue = false;
  if (registration.status === "confirmed") {
    const [{ data }, { data: paidPayment }] = await Promise.all([
      admin
        .from("participants")
        .select("id, name, unique_id")
        .eq("registration_id", id)
        .order("is_captain", { ascending: false })
        .order("created_at"),
      admin
        .from("payments")
        .select("id")
        .eq("registration_id", id)
        .eq("status", "paid")
        .maybeSingle(),
    ]);
    participants = (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      uniqueId: p.unique_id,
    }));
    // No online (Cashfree) payment on record for a fee-owing registration
    // means it's a pay_at_venue entry — cash is still due at the venue.
    paymentDue = !paidPayment && registration.amount_paise > 0;
  }

  return NextResponse.json({
    status: registration.status,
    eventName: event?.name ?? "",
    teamName: registration.team_name,
    amountPaise: registration.amount_paise,
    paymentDue,
    participants,
  });
}
