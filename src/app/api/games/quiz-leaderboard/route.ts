import { NextResponse } from "next/server";
import { getQuizLeaderboard } from "@/lib/public-leaderboard";

// Public — the same data shown on /games/leaderboard, exposed here so the
// quiz itself (solo-quiz-game.tsx) can show a live leaderboard without
// leaving the game or losing an in-progress session's client-side state.
export async function GET() {
  const rows = await getQuizLeaderboard();
  return NextResponse.json({ rows });
}
