import { NextResponse } from "next/server";
import { startQuizSession } from "@/lib/games/quiz-session";

// Public — called once when a player clicks "Start New Game" on Kaun
// Banega Lakhpati. Identical flow to /api/games/quiz/start, just tagged
// with this game's own game_slug (see quiz-session.ts's header comment
// for the full session-token design, shared by both KBC-style games).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { source, teamRefId, playerRefId, lang } = body as Record<string, unknown>;

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
  if (lang !== "en" && lang !== "hi" && lang !== "gu") {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const outcome = await startQuizSession({
    gameSlug: "kaun-banega-lakhpati",
    lang,
    source,
    teamRefId,
    playerRefId,
  });
  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }
  return NextResponse.json(outcome);
}
