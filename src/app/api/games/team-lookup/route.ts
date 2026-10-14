import { NextResponse } from "next/server";
import { lookupGameTeamByCode, alreadyPlayedPlayerIds, LEVEL_UP_SLUGS, type GameSlug } from "@/lib/game-plays";
import { isRateLimited } from "@/lib/rate-limit";

// Maps the public game identifier (sent by TeamPlayerGate's `game` prop) to
// the game_slug(s) that count as "already played" for it — Level Up's two
// legs count as one game here (see LEVEL_UP_SLUGS).
const GAME_SLUG_GROUPS: Record<string, readonly GameSlug[]> = {
  "level-up": LEVEL_UP_SLUGS,
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

  const played = await alreadyPlayedPlayerIds(
    slugGroup,
    team.source,
    team.players.map((p) => p.id),
  );
  return NextResponse.json({
    team: {
      ...team,
      players: team.players.map((p) => ({ ...p, alreadyPlayed: played.has(p.id) })),
    },
  });
}
