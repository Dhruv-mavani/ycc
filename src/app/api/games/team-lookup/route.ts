import { NextResponse } from "next/server";
import { lookupGameTeamByCode, playCountsByPlayerId, MAX_PLAYS_PER_CODE, type GameSlug } from "@/lib/game-plays";
import { isRateLimited } from "@/lib/rate-limit";

// Maps the public game identifier (sent by TeamPlayerGate's `game` prop) to
// the game_slug used to COUNT plays for it. Level Up deliberately counts
// only "spin-wheel", not both legs (LEVEL_UP_SLUGS) — a run always writes
// exactly one spin-wheel row, so that alone counts runs; counting both
// legs would double every run's real count.
const GAME_SLUG_GROUPS: Record<string, readonly GameSlug[]> = {
  "level-up": ["spin-wheel"],
  "mystry-box": ["mystry-box"],
  "quiz-champion": ["quiz-champion"],
};

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Public — called from the self-serve game pages before a round starts, no
// staff/admin session. Only ever returns names + ids, never phone/email.
// Rate-limited like every other by-code lookup route (certificate lookups,
// receipt lookup) — codes here are short structured serials, not random
// UUIDs, so without a limit they're guessable/enumerable by brute force.
export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`games-team-lookup:${ip}`, { max: 8, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a minute" },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";
  if (!code.trim()) {
    return NextResponse.json({ error: "Enter a code" }, { status: 400 });
  }

  const team = await lookupGameTeamByCode(code);
  if (!team) {
    return NextResponse.json(
      { error: "No team found for that code" },
      { status: 404 },
    );
  }

  const slugGroup = GAME_SLUG_GROUPS[searchParams.get("game") ?? ""];
  if (!slugGroup) return NextResponse.json({ team });

  const counts = await playCountsByPlayerId(
    slugGroup,
    team.source,
    team.players.map((p) => p.id),
  );
  return NextResponse.json({
    team: {
      ...team,
      players: team.players.map((p) => {
        const playCount = counts.get(p.id) ?? 0;
        return {
          ...p,
          alreadyPlayed: playCount >= MAX_PLAYS_PER_CODE,
          playCount,
          attemptNumber: Math.min(playCount + 1, MAX_PLAYS_PER_CODE),
        };
      }),
    },
  });
}
