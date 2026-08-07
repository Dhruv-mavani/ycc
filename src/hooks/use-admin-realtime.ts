"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AgreementYesAbsolutelyNo, AgreementYesNo, StaffStatus } from "@/lib/supabase/types";

export interface RealtimeStaffRow {
  user_id: string;
  name: string | null;
  email: string;
  status: StaffStatus;
  requested_at: string;
}

export interface RealtimePartnerProgramRow {
  id: string;
  name: string;
  email: string;
  college_id: string;
  stream: string;
  semester: string;
  mobile: string;
  instagram_handle: string;
  referred_by: string | null;
  agreement_q1: AgreementYesNo;
  agreement_q2: AgreementYesNo;
  agreement_q3: AgreementYesAbsolutelyNo;
  created_at: string;
}

/**
 * Subscribes to new pending staff requests and new partner program
 * applications via Supabase Realtime. Each caller gets its own channel —
 * safe to use from multiple components at once (e.g. the header bell plus
 * whichever list page is currently open).
 */
export function useAdminRealtime({
  onNewStaff,
  onNewPartnerApplication,
}: {
  onNewStaff?: (row: RealtimeStaffRow) => void;
  onNewPartnerApplication?: (row: RealtimePartnerProgramRow) => void;
}) {
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Postgres Changes are RLS-gated: the Realtime connection needs the
    // current session's access token explicitly synced before the channel
    // joins, otherwise it authorizes as anon (which has no SELECT policy
    // on these tables) and silently receives nothing — no error, no event.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        supabase.realtime.setAuth(session.access_token);
      }

      channel = supabase
        .channel(`admin-notifications-${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "staff", filter: "status=eq.pending" },
          (payload) => onNewStaff?.(payload.new as RealtimeStaffRow),
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "partner_program_applications" },
          (payload) => onNewPartnerApplication?.(payload.new as RealtimePartnerProgramRow),
        )
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("[admin-realtime] subscription failed:", status, err);
          }
        });
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
