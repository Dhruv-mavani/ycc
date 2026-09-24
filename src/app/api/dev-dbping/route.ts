import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const bootedAt = Date.now();
let hits = 0;

export async function GET() {
  hits++;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const times: number[] = [];
  for (let i = 0; i < 4; i++) {
    const t = performance.now();
    await sb.from("events").select("id").limit(1);
    times.push(Math.round(performance.now() - t));
  }
  return NextResponse.json({ region: process.env.VERCEL_REGION, instanceAgeMs: Date.now() - bootedAt, hits, dbMs: times });
}
