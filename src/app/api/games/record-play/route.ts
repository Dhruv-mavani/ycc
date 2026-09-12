import { NextResponse } from "next/server";
import { GAME_SLUGS, recordGamePlay } from "@/lib/game-plays";

// Public — fired client-side once a round settles. teamRefId/playerRefId
// are re-validated against the DB inside recordGamePlay, so this can't be
// used to attribute a play to an arbitrary team/player.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { gameSlug, source, teamRefId, playerRefId, result, detail } =
    body as Record<string, unknown>;

  if (typeof gameSlug !== "string" || !GAME_SLUGS.includes(gameSlug as never)) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }
  if (source !== "registration" && source !== "partner" && source !== "school") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }
  if (typeof teamRefId !== "string" || typeof playerRefId !== "string") {
    return NextResponse.json({ error: "Invalid team/player" }, { status: 400 });
  }
  if (result !== "won" && result !== "lost") {
    return NextResponse.json({ error: "Invalid result" }, { status: 400 });
  }

  const outcome = await recordGamePlay({
    gameSlug: gameSlug as (typeof GAME_SLUGS)[number],
    source,
    teamRefId,
    playerRefId,
    result,
    detail:
      detail && typeof detail === "object"
        ? (detail as Record<string, unknown>)
        : undefined,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
