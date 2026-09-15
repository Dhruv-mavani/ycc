import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const CSV_HEADER = [
  "name",
  "code",
  "whatsapp",
  "email",
  "age",
  "gender",
  "college",
  "event",
  "attendance_status",
  "registered_at",
];

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: registrations } = await admin
    .from("individual_free_registrations")
    .select(
      "name, code, whatsapp, email, age, gender, college_id, event_id, attendance_status, created_at",
    )
    .order("created_at");

  const collegeIds = [
    ...new Set((registrations ?? []).map((r) => r.college_id).filter((id): id is string => !!id)),
  ];
  const eventIds = [...new Set((registrations ?? []).map((r) => r.event_id))];

  const [{ data: colleges }, { data: events }] = await Promise.all([
    collegeIds.length > 0
      ? admin.from("colleges").select("id, name").in("id", collegeIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    eventIds.length > 0
      ? admin.from("events").select("id, name").in("id", eventIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const collegeNameById = new Map((colleges ?? []).map((c) => [c.id, c.name]));
  const eventNameById = new Map((events ?? []).map((e) => [e.id, e.name]));

  const rows = (registrations ?? []).map((r) =>
    [
      r.name,
      r.code,
      r.whatsapp,
      r.email,
      r.age ?? "",
      r.gender ?? "",
      r.college_id ? (collegeNameById.get(r.college_id) ?? "") : "",
      eventNameById.get(r.event_id) ?? "",
      r.attendance_status,
      r.created_at,
    ]
      .map((v) => csvEscape(String(v)))
      .join(","),
  );

  const csv = [CSV_HEADER.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ycc-individual-free-registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
