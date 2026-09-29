import { NextResponse } from "next/server";
import { lookupGameTeamByCode } from "@/lib/game-plays";
import { isRateLimited } from "@/lib/rate-limit";

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
  return NextResponse.json({ team });
}
