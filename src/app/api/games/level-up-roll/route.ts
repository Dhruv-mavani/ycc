import { NextResponse } from "next/server";
import { rollAndRecordLevelUpPlay } from "@/lib/game-plays";

// Public — called by spin-wheel-level.tsx / roll-dice-level.tsx the moment
// a player hits "Spin"/"Roll". Unlike /api/games/record-play (which the
// older mystery-box game still uses, and which trusts a client-reported
// result), this endpoint decides the outcome itself — see
// rollAndRecordLevelUpPlay's doc comment in src/lib/game-plays.ts for why.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { level, source, teamRefId, playerRefId, picked, eventSlug, levelUpSessionId } =
    body as Record<string, unknown>;

  if (level !== "spin-wheel" && level !== "roll-a-dice") {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
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
  if (typeof levelUpSessionId !== "string" || !levelUpSessionId) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const outcome = await rollAndRecordLevelUpPlay({
    level,
    source,
    teamRefId,
    playerRefId,
    picked,
    eventSlug: typeof eventSlug === "string" ? eventSlug : undefined,
    levelUpSessionId,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }
  return NextResponse.json(outcome);
}
