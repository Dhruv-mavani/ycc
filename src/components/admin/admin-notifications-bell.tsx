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

    // Mobile browsers (iOS Safari especially, but Chrome/Firefox/Samsung
    // Internet too, old and new) only allow audio.play() to succeed
    // reliably if it's ever been played during a real user gesture — a
    // WebSocket-triggered call later doesn't count on its own. So we
    // create one persistent, muted element and "unlock" it on the very
    // first tap/click anywhere on the page, then reuse that same element
    // (unmuted) for every real notification going forward.
    const audio = new Audio("/sounds/admin-notification.mp3");
    audio.muted = true;
    audioRef.current = audio;

    let unlocked = false;
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      const result = audio.play();
      if (result && typeof result.then === "function") {
        result
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
          })
          .catch(() => {
            audio.muted = false;
          });
      } else {
        audio.muted = false;
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
