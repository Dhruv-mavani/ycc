import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getPartnerProgramApplications } from "@/lib/admin-stats";
import { renderPartnerProgramApplicationsPdf } from "@/lib/partner-program-applications-pdf";

// Well above any realistic Partner Program filter result — the chat tool's
// own default cap (50) is for keeping the LLM's context small, not a real
// ceiling on how many applications exist, so an export should never be
// truncated by that same limit.
const PDF_EXPORT_ROW_LIMIT = 5000;

function parsePartnerType(value: string | null): "campus" | "class" | undefined {
  return value === "campus" || value === "class" ? value : undefined;
}

function parseStatus(value: string | null): "pending" | "approved" | "rejected" | undefined {
  return value === "pending" || value === "approved" || value === "rejected" ? value : undefined;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate") ?? undefined;
  const endDate = url.searchParams.get("endDate") ?? undefined;
  const partnerType = parsePartnerType(url.searchParams.get("partnerType"));
  const status = parseStatus(url.searchParams.get("status"));
  const search = url.searchParams.get("search") ?? undefined;

  const result = await getPartnerProgramApplications(
    startDate,
    endDate,
    partnerType,
    status,
    search,
    PDF_EXPORT_ROW_LIMIT,
  );

  const rangeLabel =
    startDate && endDate && startDate === endDate
      ? new Date(`${startDate}T00:00:00`).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : startDate || endDate
        ? `${startDate ?? "earliest"} to ${endDate ?? "latest"}`
        : "All time";

  const filterBits = [
    partnerType ? (partnerType === "campus" ? "YCC Partner" : "YCC Co-Partner") : null,
    status ?? null,
    search ? `matching "${search}"` : null,
  ].filter((b): b is string => !!b);

  const pdfBuffer = await renderPartnerProgramApplicationsPdf({
    title: "YCC Partner & Co-Partner Program — Applications",
    subtitle: `${rangeLabel}${filterBits.length ? " · " + filterBits.join(" · ") : ""} — times in IST`,
    ...result,
  });

  const filenameDate = startDate && endDate && startDate === endDate ? startDate : "export";

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="YCC-Partner-Program-${filenameDate}.pdf"`,
    },
  });
}
