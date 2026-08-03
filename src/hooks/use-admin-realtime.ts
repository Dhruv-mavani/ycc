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

export interface RealtimeVolunteerRow {
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
 * Subscribes to new pending staff requests and new volunteer applications
 * via Supabase Realtime. Each caller gets its own channel — safe to use
 * from multiple components at once (e.g. the header bell plus whichever
 * list page is currently open).
 */
export function useAdminRealtime({
  onNewStaff,
  onNewVolunteer,
}: {
  onNewStaff?: (row: RealtimeStaffRow) => void;
  onNewVolunteer?: (row: RealtimeVolunteerRow) => void;
}) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-notifications-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "staff", filter: "status=eq.pending" },
        (payload) => onNewStaff?.(payload.new as RealtimeStaffRow),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "volunteer_applications" },
        (payload) => onNewVolunteer?.(payload.new as RealtimeVolunteerRow),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
