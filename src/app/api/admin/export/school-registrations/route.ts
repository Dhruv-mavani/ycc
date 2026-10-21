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
  "instagram_handle",
  "age",
  "gender",
  "school",
  "event",
  "registered_at",
];

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: registrations } = await admin
    .from("school_tournament_registrations")
    .select(
      "name, code, whatsapp, email, instagram_handle, age, gender, created_at, school_id, event_id",
    )
    .order("created_at");

  const schoolIds = [...new Set((registrations ?? []).map((r) => r.school_id).filter((id): id is string => !!id))];
  const eventIds = [...new Set((registrations ?? []).map((r) => r.event_id))];

  const [{ data: schools }, { data: events }] = await Promise.all([
    schoolIds.length > 0
      ? admin.from("schools").select("id, name").in("id", schoolIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    eventIds.length > 0
      ? admin.from("events").select("id, name").in("id", eventIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const schoolNameById = new Map((schools ?? []).map((s) => [s.id, s.name]));
  const eventNameById = new Map((events ?? []).map((e) => [e.id, e.name]));

  const rows = (registrations ?? []).map((r) =>
    [
      r.name,
      r.code,
      r.whatsapp,
      r.email ?? "",
      r.instagram_handle ?? "",
      r.age,
      r.gender,
      r.school_id ? (schoolNameById.get(r.school_id) ?? "") : "",
      eventNameById.get(r.event_id) ?? "",
      r.created_at,
    ]
      .map((v) => csvEscape(String(v)))
      .join(","),
  );

  const csv = [CSV_HEADER.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ycc-school-registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
