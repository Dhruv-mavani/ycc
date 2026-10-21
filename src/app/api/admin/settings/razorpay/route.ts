import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { isRazorpayEnabled, setRazorpayEnabled } from "@/lib/app-settings";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ enabled: await isRazorpayEnabled() });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const enabled = body?.enabled;
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await setRazorpayEnabled(enabled, session.user.id);
  } catch {
    return NextResponse.json({ error: "Could not update setting" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enabled });
}
