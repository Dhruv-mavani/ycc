import { NextResponse } from "next/server";
import { lookupGameTeamByCode } from "@/lib/game-plays";

// Public — called from the self-serve game pages before a round starts, no
// staff/admin session. Only ever returns names + ids, never phone/email.
export async function GET(request: Request) {
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
