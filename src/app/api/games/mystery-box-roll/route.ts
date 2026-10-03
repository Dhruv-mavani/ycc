import { NextResponse } from "next/server";
import { rollAndRecordMysteryBoxPlay } from "@/lib/game-plays";

// Public — called by mystery-box-game.tsx the moment a player hits "Open
// the Mystery Box". Like /api/games/level-up-roll, this decides the
// outcome itself — see rollAndRecordMysteryBoxPlay's doc comment in
// src/lib/game-plays.ts — and never reads a client-supplied `result`.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { source, teamRefId, playerRefId, picked } = body as Record<string, unknown>;

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
  if (typeof picked !== "number") {
    return NextResponse.json({ error: "Invalid pick" }, { status: 400 });
  }

  const outcome = await rollAndRecordMysteryBoxPlay({ source, teamRefId, playerRefId, picked });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }
  return NextResponse.json(outcome);
}
