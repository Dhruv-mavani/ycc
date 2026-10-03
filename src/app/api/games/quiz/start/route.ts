import { NextResponse } from "next/server";
import { startQuizSession } from "@/lib/games/quiz-session";

// Public — called once when a player clicks "Start New Game". Returns a
// signed session token plus the first question (text + 4 options, already
// shuffled, never which one is correct) — see quiz-session.ts's header
// comment for the full design.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { source, teamRefId, playerRefId } = body as Record<string, unknown>;

  if (
    source !== "registration" &&
    source !== "partner" &&
    source !== "school" &&
    source !== "individual_free"
  ) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }
  if (typeof teamRefId !== "string" || typeof playerRefId !== "string") {
    return NextResponse.json({ error: "Invalid team/player" }, { status: 400 });
  }

  const outcome = await startQuizSession({ source, teamRefId, playerRefId });
  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }
  return NextResponse.json(outcome);
}
