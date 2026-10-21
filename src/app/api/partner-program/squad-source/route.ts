import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Squad-building for the general Box Cricket Championship's team
// registration form: pick a YCC Partner or YCC Co-Partner, and their
// downstream roster becomes the squad to trim down to size.
//
// A Co-Partner's roster is their direct Squad members (one level).
// A Partner's roster is broader: their direct Co-Partners, PLUS every
// Squad member recruited by any of those Co-Partners, PLUS any Squad
// member who attached directly to the Partner (skipping the Co-Partner
// level). `role` on each roster entry tells the UI which kind it is.
//
// registrations.college_id is required but Partner Program applications
// don't collect one, so each referrer gets its own find-or-create college
// row keyed by their team_code (guaranteed unique), which also gives each
// referrer their own unique-ID group series instead of sharing one bucket.

type RosterRole = "co-partner" | "squad";
interface RosterEntry {
  id: string;
  name: string;
  mobile: string;
  role: RosterRole;
}

async function buildRoster(
  admin: SupabaseClient<Database>,
  referrerType: "campus" | "class",
  referrerId: string,
): Promise<RosterEntry[]> {
  if (referrerType === "class") {
    const { data } = await admin
      .from("partner_program_applications")
      .select("id, name, mobile")
      .eq("referred_by_id", referrerId)
      .eq("partner_type", "classmate")
      .eq("status", "approved")
      .order("created_at", { ascending: true });
    return (data ?? []).map((m) => ({ ...m, role: "squad" as const }));
  }

  const [{ data: coPartners }, { data: directSquad }] = await Promise.all([
    admin
      .from("partner_program_applications")
      .select("id, name, mobile")
      .eq("referred_by_id", referrerId)
      .eq("partner_type", "class")
      .eq("status", "approved")
      .order("created_at", { ascending: true }),
    admin
      .from("partner_program_applications")
      .select("id, name, mobile")
      .eq("referred_by_id", referrerId)
      .eq("partner_type", "classmate")
      .eq("status", "approved")
      .order("created_at", { ascending: true }),
  ]);

  const coPartnerIds = (coPartners ?? []).map((c) => c.id);
  const { data: squadViaCoPartners } =
    coPartnerIds.length > 0
      ? await admin
          .from("partner_program_applications")
          .select("id, name, mobile")
          .in("referred_by_id", coPartnerIds)
          .eq("partner_type", "classmate")
          .eq("status", "approved")
          .order("created_at", { ascending: true })
      : { data: [] as { id: string; name: string; mobile: string }[] };

  return [
    ...(coPartners ?? []).map((c) => ({ ...c, role: "co-partner" as const })),
    ...(squadViaCoPartners ?? []).map((m) => ({ ...m, role: "squad" as const })),
    ...(directSquad ?? []).map((m) => ({ ...m, role: "squad" as const })),
  ];
}

// POST, not GET — this handler writes (upserts a college row), and a GET
// with side effects is prefetchable and forgeable via a plain cross-site
// request with no CSRF protection.
export async function POST(request: Request) {
  const body: { type?: string; id?: string } | null = await request
    .json()
    .catch(() => null);
  const referrerType = body?.type;
  const referrerId = body?.id;

  if (
    (referrerType !== "campus" && referrerType !== "class") ||
    !referrerId
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: referrer } = await admin
    .from("partner_program_applications")
    .select("id, name, mobile, team_code")
    .eq("id", referrerId)
    .eq("partner_type", referrerType)
    .eq("status", "approved")
    .maybeSingle();

  if (!referrer) {
    return NextResponse.json(
      { error: "Referrer not found or not yet approved" },
      { status: 404 },
    );
  }

  if (!referrer.team_code) {
    return NextResponse.json(
      { error: "This referrer doesn't have a partner code yet — contact support" },
      { status: 409 },
    );
  }

  const [roster, { data: college, error: collegeError }] = await Promise.all([
    buildRoster(admin, referrerType, referrer.id),
    admin
      .from("colleges")
      .upsert(
        { name: referrer.name, initials: referrer.team_code, is_public: false },
        { onConflict: "initials" },
      )
      .select("id")
      .single(),
  ]);

  if (collegeError || !college) {
    return NextResponse.json(
      { error: "Could not set up this squad's registration" },
      { status: 500 },
    );
  }

  // A roster bigger than 6 gets split across multiple team registrations —
  // anyone already locked into an earlier one (by phone, since the roster
  // and registered participants are separate tables with no direct FK)
  // can't be picked again for a new team.
  const { data: existingRegs } = await admin
    .from("registrations")
    .select("id")
    .eq("college_id", college.id)
    .in("status", ["pending_payment", "confirmed"]);

  const existingRegIds = (existingRegs ?? []).map((r) => r.id);
  const { data: existingParticipants } =
    existingRegIds.length > 0
      ? await admin
          .from("participants")
          .select("phone")
          .in("registration_id", existingRegIds)
      : { data: [] as { phone: string | null }[] };

  const allottedPhones = new Set(
    (existingParticipants ?? []).map((p) => p.phone).filter((p): p is string => !!p),
  );

  return NextResponse.json({
    collegeId: college.id,
    captain: { name: referrer.name, phone: referrer.mobile },
    roster: roster.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.mobile,
      role: r.role,
      alreadyAllotted: allottedPhones.has(r.mobile),
    })),
  });
}
