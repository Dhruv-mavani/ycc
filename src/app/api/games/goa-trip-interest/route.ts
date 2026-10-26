import { NextResponse } from "next/server";
import { recordGoaTripInterest } from "@/lib/games/goa-trip-interest";

// Public — backs the "want to come to Goa with us?" opt-in on Level Up's
// summary screen. Re-verifies the player server-side (see
// recordGoaTripInterest) rather than trusting the client's name/team.

function parseSource(value: unknown) {
  return value === "registration" ||
    value === "partner" ||
    value === "school" ||
    value === "individual_free"
    ? value
    : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { source, teamRefId, playerRefId } = body as Record<string, unknown>;
  const parsedSource = parseSource(source);
  if (!parsedSource || typeof teamRefId !== "string" || typeof playerRefId !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const outcome = await recordGoaTripInterest(parsedSource, teamRefId, playerRefId);
  if (!outcome.ok) return NextResponse.json({ error: outcome.error }, { status: 400 });
  return NextResponse.json(outcome);
}
