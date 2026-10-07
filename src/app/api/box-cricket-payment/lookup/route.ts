import { NextResponse } from "next/server";
import { lookupBoxCricketTeam } from "@/lib/box-cricket-payment-verification";

// Public — exact unique-ID match only (no fuzzy/partial search), so this
// can't be used to enumerate other teams' names. See
// lookupBoxCricketTeam's own comment for the full reasoning.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";

  const result = await lookupBoxCricketTeam(code);
  if (!result) {
    return NextResponse.json({ error: "No team found for that code" }, { status: 404 });
  }

  return NextResponse.json({ result });
}
