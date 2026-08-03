"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BellIcon, BellOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

const MUTE_KEY = "admin-notifications-muted";

export function AdminNotificationsBell() {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMuted(localStorage.getItem(MUTE_KEY) === "true");

    // Some mobile browsers only allow audio.play() to succeed reliably
    // if it's ever been played during a real user gesture — a
    // WebSocket-triggered call later doesn't count on its own. We prime
    // that unlock with a genuinely silent clip (not the real notification
    // sound muted-then-unmuted — some browsers don't honor `.muted`
    // consistently during a gesture-triggered play, which would otherwise
    // play the actual notification audibly on the very first tap). The
    // notification element itself is only ever played from playSound().
    const audio = new Audio("/sounds/admin-notification.mp3");
    audioRef.current = audio;

    let unlocked = false;
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      const silent = new Audio("/sounds/silence.mp3");
      const result = silent.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {});
      }
      events.forEach((e) => document.removeEventListener(e, unlock));
    }

    const events = ["pointerdown", "touchstart", "click", "keydown"] as const;
    events.forEach((e) => document.addEventListener(e, unlock, { once: true }));
    return () => events.forEach((e) => document.removeEventListener(e, unlock));
  }, []);

  const playSound = useCallback(() => {
    if (localStorage.getItem(MUTE_KEY) === "true") return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    const result = audio.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
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
