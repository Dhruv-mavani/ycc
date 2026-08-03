"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, HeartHandshake, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

const LAST_SEEN_VOLUNTEERS_KEY = "lastSeenVolunteersAt";

export function AdminNavButtons({
  initialPendingStaffCount,
}: {
  initialPendingStaffCount: number;
}) {
  const [pendingStaffCount, setPendingStaffCount] = useState(
    initialPendingStaffCount,
  );
  const [newVolunteerCount, setNewVolunteerCount] = useState(0);

  useEffect(() => {
    const since =
      localStorage.getItem(LAST_SEEN_VOLUNTEERS_KEY) ?? new Date(0).toISOString();
    fetch(`/api/admin/notifications/summary?since=${encodeURIComponent(since)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setNewVolunteerCount(data.newVolunteerCount ?? 0);
      })
      .catch(() => {});
  }, []);

  useAdminRealtime({
    onNewStaff: () => setPendingStaffCount((c) => c + 1),
    onNewVolunteer: () => setNewVolunteerCount((c) => c + 1),
  });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
        nativeButton={false}
        render={
          <Link href="/admin/staff">
            <ShieldAlert className="size-4" />
            Staff access
            {pendingStaffCount > 0 ? (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0 min-w-[20px] text-center">
                {pendingStaffCount}
              </Badge>
            ) : null}
          </Link>
        }
      />
      <Button
        variant="outline"
        className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
        nativeButton={false}
        render={
          <a href="/api/admin/export/payments">
            <Download className="size-4" />
            Export CSV
          </a>
        }
      />
      <Button
        variant="outline"
        className="hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors"
        nativeButton={false}
        render={
          <Link href="/admin/volunteers">
            <HeartHandshake className="size-4" />
            Volunteers
            {newVolunteerCount > 0 ? (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0 min-w-[20px] text-center">
                {newVolunteerCount}
              </Badge>
            ) : null}
          </Link>
        }
      />
    </div>
  );
}
