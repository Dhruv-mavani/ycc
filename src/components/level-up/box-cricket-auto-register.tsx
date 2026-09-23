"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { GameTeamSelection } from "@/components/games/team-player-gate";

type Status = "idle" | "loading" | "confirmed" | "declined" | "error";

// Only rendered for a team that entered via a real Go Goa Gone registration
// code (see the eventSlug check where this is used) — the captain already
// typed college/team name/squad once for that event, so instead of sending
// them through the Box Cricket form again, one tap here clones that same
// roster into a fresh Box Cricket registration via
// /api/registrations/clone-team. That route still runs every real
// validation (registration open, squad size, duplicate team/phones) —
// this component just supplies the source team and shows the result.
export function BoxCricketAutoRegister({ selection }: { selection: GameTeamSelection }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleYes() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/registrations/clone-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceRegistrationId: selection.teamRefId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong — please register manually instead.");
        setStatus("error");
        return;
      }
      setStatus("confirmed");
    } catch {
      setError("Network error — please try again, or register manually below.");
      setStatus("error");
    }
  }

  if (status === "confirmed") {
    return (
      <div className="mt-8 mb-6 w-full max-w-md rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-left">
        <p className="flex items-center gap-2 font-bold text-emerald-300">
          <CheckCircle2 className="size-5 shrink-0" /> {selection.teamLabel} is in!
        </p>
        <p className="mt-1 text-sm text-emerald-100/80">
          Registered for the Box Cricket Tournament — pay ₹999 in cash at
          the venue to confirm your spot.
        </p>
      </div>
    );
  }

  if (status === "declined") return null;

  return (
    <div className="mb-6 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
      <p className="font-bold text-white">
        Enter {selection.teamLabel} for Box Cricket too?
      </p>
      <p className="mt-1 text-sm text-white/70">
        Same squad, no retyping — ₹999 entry, payable in cash at the venue.
      </p>
      {status === "error" && error ? (
        <p className="mt-2 text-sm text-rose-300">{error}</p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleYes}
          disabled={status === "loading"}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="mx-auto size-4 animate-spin" />
          ) : (
            "Yes, register us"
          )}
        </button>
        <button
          type="button"
          onClick={() => setStatus("declined")}
          disabled={status === "loading"}
          className="flex-1 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
