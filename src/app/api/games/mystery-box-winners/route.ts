import { NextResponse } from "next/server";
import { getMysteryBoxWinners } from "@/lib/public-leaderboard";

// Public — the same data shown on /games/leaderboard's Mystery Box
// section, exposed here so the game itself can show live winners without
// leaving the game or losing an in-progress session's client-side state.
export async function GET() {
  const rows = await getMysteryBoxWinners();
  return NextResponse.json({ rows });
}
