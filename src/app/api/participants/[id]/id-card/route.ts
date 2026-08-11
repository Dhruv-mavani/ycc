import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateQrDataUrl } from "@/lib/qr";
import { renderBoxCricketIdCardPdf } from "@/lib/box-cricket-id-card";
import { renderQuizIdCardPdf } from "@/lib/quiz-id-card";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const isInline = url.searchParams.get("view") === "true";

  const admin = createAdminClient();

  const { data: participant, error: participantError } = await admin
    .from("participants")
    .select("id, name, unique_id, registration_id")
    .eq("id", id)
    .single();

  if (participantError || !participant || !participant.unique_id) {
    return NextResponse.json(
      { error: "ID card not found — payment may not be confirmed yet" },
      { status: 404 },
    );
  }

  const { data: registration, error: regError } = await admin
    .from("registrations")
    .select("event_id, college_id, status")
    .eq("id", participant.registration_id)
    .eq("status", "confirmed")
    .single();

  if (regError || !registration) {
    return NextResponse.json(
      { error: "ID card not found — payment may not be confirmed yet" },
      { status: 404 },
    );
  }

  const [{ data: event }, { data: college }] = await Promise.all([
    admin.from("events").select("type").eq("id", registration.event_id).single(),
    admin.from("colleges").select("name, city").eq("id", registration.college_id).single(),
  ]);

  if (!event || !college) {
    return NextResponse.json({ error: "ID card not found" }, { status: 404 });
  }

  const qrDataUrl = await generateQrDataUrl(participant.unique_id);
  const data = {
    playerName: participant.name,
    collegeName: college.name,
    city: college.city,
    uniqueId: participant.unique_id,
    qrDataUrl,
  };

  const pdfBuffer =
    event.type === "quiz"
      ? await renderQuizIdCardPdf(data)
      : await renderBoxCricketIdCardPdf(data);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="YCC-ID-Card-${participant.unique_id}.pdf"`,
    },
  });
}
