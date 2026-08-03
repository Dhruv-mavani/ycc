import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// `next` arrives from the URL and controls a post-auth redirect — only
// allow same-origin relative paths. Rejects protocol-relative ("//evil.com")
// and absolute ("https://evil.com" or "javascript:...") values so this
// can't be turned into an open redirect via a crafted callback link.
function safeNext(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/auth-error?next=${encodeURIComponent(next)}`,
  );
}
