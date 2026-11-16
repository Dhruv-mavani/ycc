import { NextResponse } from "next/server";
import { getLakhpatiLeaderboard } from "@/lib/public-leaderboard";

// Public — same pattern as /api/games/quiz-leaderboard, scoped to Kaun
// Banega Lakhpati's own game_slug so the two KBC-style games never mix
// standings despite sharing all their game logic.
export async function GET() {
  const rows = await getLakhpatiLeaderboard();
  return NextResponse.json({ rows });
}
