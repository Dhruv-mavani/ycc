import { NextResponse } from "next/server";
import { getPrizeSlots, claimPrizeSlot } from "@/lib/games/kismat-prize-claim";

// Public — backs the numbered prize picker on Level Up's summary screen
// for a Kismat Ke Khiladi top-tier win. Both GET and POST re-verify the
// win server-side (see getPrizeSlots/claimPrizeSlot in
// kismat-prize-claim.ts) — a request here can't be forged into a claim
// without a real, already-recorded top-tier roll-a-dice row.

function parseSource(value: unknown) {
  return value === "registration" || value === "partner" || value === "school" || value === "individual_free"
    ? value
    : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = parseSource(searchParams.get("source"));
  const playerRefId = searchParams.get("playerRefId");
  const levelUpSessionId = searchParams.get("levelUpSessionId");
  if (!source || !playerRefId || !levelUpSessionId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const outcome = await getPrizeSlots(source, playerRefId, levelUpSessionId);
  if (!outcome.ok) return NextResponse.json({ error: outcome.error }, { status: 400 });
  return NextResponse.json(outcome);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { source, playerRefId, levelUpSessionId, slotNumber } = body as Record<string, unknown>;
  const parsedSource = parseSource(source);
  if (!parsedSource || typeof playerRefId !== "string" || typeof levelUpSessionId !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!Number.isInteger(slotNumber) || (slotNumber as number) < 1 || (slotNumber as number) > 10) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const outcome = await claimPrizeSlot(parsedSource, playerRefId, levelUpSessionId, slotNumber as number);
  if (!outcome.ok) return NextResponse.json({ error: outcome.error }, { status: 409 });
  return NextResponse.json(outcome);
}
