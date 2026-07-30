import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: payments } = await admin
    .from("payments")
    .select("*")
    .eq("status", "paid")
    .order("created_at");

  const registrationIds = [...new Set((payments ?? []).map((p) => p.registration_id))];
  const { data: registrations } =
    registrationIds.length > 0
      ? await admin.from("registrations").select("*").in("id", registrationIds)
      : { data: [] as { id: string; event_id: string; college_id: string; type: string; team_name: string | null; captain_name: string | null }[] };

  const eventIds = [...new Set((registrations ?? []).map((r) => r.event_id))];
  const collegeIds = [...new Set((registrations ?? []).map((r) => r.college_id))];

  const [{ data: events }, { data: colleges }] = await Promise.all([
    eventIds.length > 0
      ? admin.from("events").select("id, name").in("id", eventIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    collegeIds.length > 0
      ? admin.from("colleges").select("id, name").in("id", collegeIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const registrationById = new Map((registrations ?? []).map((r) => [r.id, r]));
  const eventNameById = new Map((events ?? []).map((e) => [e.id, e.name]));
  const collegeNameById = new Map((colleges ?? []).map((c) => [c.id, c.name]));

  const header = [
    "razorpay_order_id",
    "razorpay_payment_id",
    "amount_rupees",
    "paid_at",
    "event",
    "college",
    "type",
    "team_name",
    "captain_name",
  ];

  const rows = (payments ?? []).map((p) => {
    const reg = registrationById.get(p.registration_id);
    return [
      p.razorpay_order_id,
      p.razorpay_payment_id ?? "",
      (p.amount_paise / 100).toFixed(2),
      p.updated_at,
      reg ? (eventNameById.get(reg.event_id) ?? "") : "",
      reg ? (collegeNameById.get(reg.college_id) ?? "") : "",
      reg?.type ?? "",
      reg?.team_name ?? "",
      reg?.captain_name ?? "",
    ]
      .map((v) => csvEscape(String(v)))
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ycc-payments-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
