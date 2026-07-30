import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed this file to proxy.ts, but that convention appears not
// to be recognized by Vercel's production routing yet (build succeeds, but
// every route 404s at request time). middleware.ts is deprecated but still
// fully supported by Next.js 16 and is the long-established convention
// Vercel's platform reliably routes through.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
