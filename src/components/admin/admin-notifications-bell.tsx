"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BellIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

const MUTE_KEY = "admin-notifications-muted";
const LAST_SEEN_VOLUNTEERS_KEY = "lastSeenVolunteersAt";

export function AdminNotificationsBell() {
  const [pendingStaffCount, setPendingStaffCount] = useState(0);
  const [newVolunteerCount, setNewVolunteerCount] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(localStorage.getItem(MUTE_KEY) === "true");

    const since =
      localStorage.getItem(LAST_SEEN_VOLUNTEERS_KEY) ?? new Date(0).toISOString();
    fetch(`/api/admin/notifications/summary?since=${encodeURIComponent(since)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setPendingStaffCount(data.pendingStaffCount ?? 0);
        setNewVolunteerCount(data.newVolunteerCount ?? 0);
      })
      .catch(() => {});
  }, []);

  const playSound = useCallback(() => {
    if (localStorage.getItem(MUTE_KEY) === "true") return;
    new Audio("/sounds/admin-notification.mp3").play().catch(() => {});
  }, []);

  useAdminRealtime({
    onNewStaff: (row) => {
      setPendingStaffCount((c) => c + 1);
      toast.info(`New staff request: ${row.name ?? row.email}`);
      playSound();
    },
    onNewVolunteer: (row) => {
      setNewVolunteerCount((c) => c + 1);
      toast.info(`New volunteer application: ${row.name}`);
      playSound();
    },
  });

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    localStorage.setItem(MUTE_KEY, String(next));
  }

  const total = pendingStaffCount + newVolunteerCount;

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="outline"
        size="icon-sm"
        className="relative"
        nativeButton={false}
        render={
          <Link href="/admin" aria-label={`Notifications${total > 0 ? ` (${total} new)` : ""}`}>
            <BellIcon className="size-4" />
            {total > 0 ? (
              <Badge
                variant="destructive"
                className="absolute -top-1.5 -right-1.5 h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]"
              >
                {total > 99 ? "99+" : total}
              </Badge>
            ) : null}
          </Link>
        }
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={toggleMute}
        aria-label={muted ? "Unmute notifications" : "Mute notifications"}
      >
        {muted ? (
          <VolumeXIcon className="size-3.5 text-muted-foreground" />
        ) : (
          <Volume2Icon className="size-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
