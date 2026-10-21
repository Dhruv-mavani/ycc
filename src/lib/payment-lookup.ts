import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Strips characters that are syntactically meaningful inside a PostgREST
 * `.or()` filter string — `,` separates conditions and `(`/`)` group them —
 * so a search term containing them can't inject extra filter clauses
 * instead of being matched as literal text. */
function sanitizeForOrFilter(value: string): string {
  return value.replace(/[,()]/g, "");
}

export interface PaymentLookupParticipant {
  name: string;
  uniqueId: string | null;
  isCaptain: boolean;
}

export interface PaymentLookupResult {
  registrationId: string;
  type: "team" | "individual";
  teamName: string | null;
  captainName: string | null;
  collegeName: string;
  amountPaise: number;
  paid: boolean;
  participants: PaymentLookupParticipant[];
}

/**
 * Same search shape as searchParticipants (src/lib/lookup.ts) — exact
 * unique ID first, then a fuzzy match across participant name/phone and
 * team name/captain phone — but scoped to one (pay_at_venue) event and
 * returning cash-payment status instead of attendance status. Used by the
 * staff "Collect Payments" screen.
 */
export async function searchRegistrationsForPayment(
  eventId: string,
  query: string,
): Promise<PaymentLookupResult[]> {
  const admin = createAdminClient();
  const trimmed = query.trim();

  let registrationIds: string[] = [];
  if (!trimmed) {
    const { data: regs } = await admin
      .from("registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(200);
    registrationIds = (regs ?? []).map((r) => r.id);
  } else {
    const { data: exact } = await admin
      .from("participants")
      .select("registration_id")
      .eq("unique_id", trimmed.toUpperCase())
      .maybeSingle();

    if (exact) {
      registrationIds = [exact.registration_id];
    } else {
      const safeTrimmed = sanitizeForOrFilter(trimmed);
      const [{ data: byPhoneOrName }, { data: byCaptainPhoneOrTeam }] = await Promise.all([
        admin
          .from("participants")
          .select("registration_id")
          .or(`name.ilike.%${safeTrimmed}%,phone.ilike.%${safeTrimmed}%,unique_id.ilike.%${safeTrimmed}%`)
          .limit(100),
        admin
          .from("registrations")
          .select("id")
          .eq("event_id", eventId)
          .or(`captain_phone.ilike.%${safeTrimmed}%,team_name.ilike.%${safeTrimmed}%,captain_name.ilike.%${safeTrimmed}%`)
          .limit(50),
      ]);
      registrationIds = [
        ...new Set([
          ...(byPhoneOrName ?? []).map((m) => m.registration_id),
          ...(byCaptainPhoneOrTeam ?? []).map((r) => r.id),
        ]),
      ];
    }
  }

  if (registrationIds.length === 0) return [];

  const { data: registrations } = await admin
    .from("registrations")
    .select("*")
    .in("id", registrationIds)
    .eq("event_id", eventId)
    .eq("status", "confirmed");

  if (!registrations || registrations.length === 0) return [];

  const collegeIds = [...new Set(registrations.map((r) => r.college_id))];
  const registrationIdList = registrations.map((r) => r.id);

  const [{ data: colleges }, { data: participants }, { data: paidPayments }] =
    await Promise.all([
      admin.from("colleges").select("id, name").in("id", collegeIds),
      admin
        .from("participants")
        .select("registration_id, name, unique_id, is_captain")
        .in("registration_id", registrationIdList)
        .order("is_captain", { ascending: false })
        .order("created_at"),
      admin
        .from("payments")
        .select("registration_id")
        .in("registration_id", registrationIdList)
        .eq("status", "paid"),
    ]);

  const collegeNameById = new Map((colleges ?? []).map((c) => [c.id, c.name]));
  const paidSet = new Set((paidPayments ?? []).map((p) => p.registration_id));

  // Index once instead of re-filtering the full participants array inside
  // the map below for every registration — was O(registrations ×
  // participants), now O(registrations + participants).
  const participantsByReg = new Map<string, NonNullable<typeof participants>>();
  for (const p of participants ?? []) {
    const list = participantsByReg.get(p.registration_id) ?? [];
    list.push(p);
    participantsByReg.set(p.registration_id, list);
  }

  return registrations.map((reg) => ({
    registrationId: reg.id,
    type: reg.type as "team" | "individual",
    teamName: reg.team_name,
    captainName: reg.captain_name,
    collegeName: collegeNameById.get(reg.college_id) ?? "",
    amountPaise: reg.amount_paise,
    paid: paidSet.has(reg.id),
    participants: (participantsByReg.get(reg.id) ?? []).map((p) => ({
      name: p.name,
      uniqueId: p.unique_id,
      isCaptain: p.is_captain,
    })),
  }));
}
