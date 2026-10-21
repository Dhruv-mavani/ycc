import { NextResponse } from "next/server";
import { answerQuizQuestion } from "@/lib/games/quiz-session";

// Public — called every time a player's answer is revealed (including a
// timeout, sent as selectedSlot: null). The server is the only place that
// ever compares a selection against the correct slot — see
// quiz-session.ts's header comment.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, selectedSlot } = body as Record<string, unknown>;

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }
  if (selectedSlot !== null && typeof selectedSlot !== "number") {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  const outcome = await answerQuizQuestion({ token, selectedSlot });
  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }
  return NextResponse.json(outcome);
}
