import { NextResponse } from "next/server";
import { applyQuizLifeline, type Lifeline } from "@/lib/games/quiz-session";

const LIFELINES: Lifeline[] = ["fiftyFifty", "audiencePoll", "askGenius", "flip"];

// Public — called whenever a player taps a lifeline button. The server
// enforces "once per game" per lifeline itself (via the signed token), not
// just the client's disabled-button state.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, lifeline } = body as Record<string, unknown>;

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }
  if (typeof lifeline !== "string" || !LIFELINES.includes(lifeline as Lifeline)) {
    return NextResponse.json({ error: "Invalid lifeline" }, { status: 400 });
  }

  const outcome = await applyQuizLifeline({ token, lifeline: lifeline as Lifeline });
  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }
  return NextResponse.json(outcome);
}
