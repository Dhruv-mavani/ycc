"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BellIcon, BellOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

const MUTE_KEY = "admin-notifications-muted";

export function AdminNotificationsBell() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(localStorage.getItem(MUTE_KEY) === "true");
  }, []);

  const playSound = useCallback(() => {
    if (localStorage.getItem(MUTE_KEY) === "true") return;
    new Audio("/sounds/admin-notification.mp3").play().catch(() => {});
  }, []);

  useAdminRealtime({
    onNewStaff: (row) => {
      toast.info(`New staff request: ${row.name ?? row.email}`);
      playSound();
    },
    onNewVolunteer: (row) => {
      toast.info(`New volunteer application: ${row.name}`);
      playSound();
    },
  });

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    localStorage.setItem(MUTE_KEY, String(next));
    toast.success(next ? "Notifications muted" : "Notifications on");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleMute}
      aria-label={muted ? "Turn notifications on" : "Turn notifications off"}
      aria-pressed={!muted}
    >
      {muted ? (
        <BellOffIcon className="size-4 text-muted-foreground" />
      ) : (
        <BellIcon className="size-4" />
      )}
    </Button>
  );
}
