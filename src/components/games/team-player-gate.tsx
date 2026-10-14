"use client";

import { useState } from "react";
import { Crown, Loader2, Search } from "lucide-react";

// Sits above the Play button on every self-serve game's start screen.
// Resolves a code — any team member's Unique ID, a YCC Partner /
// Co-Partner's team code / Unique ID, a Super Champs personalized code, or
// a free-individual code (e.g. YCC Jackpot Heist) — into a roster via
// /api/games/team-lookup, then lets the player pick who's actually
// playing. A single-player roster (an individual registration, a Partner
// with no Squad attached, any Super Champs entry, or any Jackpot Heist
// entry) skips the dropdown and just shows that one name. The resolved
// selection is handed to the parent game via onSelectionChange so it can
// gate its own Play button, pick audience-specific copy/prizes, and report
// the eventual win/loss.
//
// `game` tells /api/games/team-lookup which game this gate is for, so it
// can flag teammates who've already used their one entry — purely a UX
// head start (so a code that's already played doesn't even get as far as
// picking a number); the real, unbypassable enforcement is server-side at
// the actual play/start endpoint (see hasAlreadyPlayed in
// src/lib/game-plays.ts), which this flag can never substitute for.

export type GameTeamSource = "registration" | "partner" | "school" | "individual_free";

export type GameIdentifier = "level-up" | "mystry-box" | "quiz-champion";

export interface GameTeamSelection {
  source: GameTeamSource;
  teamRefId: string;
  teamLabel: string;
  playerRefId: string;
  playerName: string;
  /** Only set for "registration" source — see GameTeamLookup.eventSlug. */
  eventSlug?: string;
}

interface RosterPlayer {
  id: string;
  name: string;
  isCaptain: boolean;
  alreadyPlayed?: boolean;
}

interface Roster {
  source: GameTeamSource;
  teamRefId: string;
  teamLabel: string;
  players: RosterPlayer[];
  eventSlug?: string;
}

type Status = "idle" | "loading" | "found" | "error";

export function TeamPlayerGate({
  game,
  onSelectionChange,
}: {
  game: GameIdentifier;
  onSelectionChange: (selection: GameTeamSelection | null) => void;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [roster, setRoster] = useState<Roster | null>(null);
  const [playerId, setPlayerId] = useState<string>("");

  function reset() {
    setStatus("idle");
    setError(null);
    setRoster(null);
    setPlayerId("");
    onSelectionChange(null);
  }

  async function find() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setStatus("loading");
    setError(null);
    setRoster(null);
    setPlayerId("");
    onSelectionChange(null);

    try {
      const res = await fetch(
        `/api/games/team-lookup?code=${encodeURIComponent(trimmed)}&game=${game}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "No team found for that code");
        return;
      }

      const team: Roster = data.team;
      setRoster(team);
      setStatus("found");

      // Single-player rosters normally auto-select straight into Play —
      // skipped here if that one player already used their entry, so
      // they land on the "already played" message below instead.
      if (team.players.length === 1 && !team.players[0].alreadyPlayed) {
        const only = team.players[0];
        setPlayerId(only.id);
        onSelectionChange({
          source: team.source,
          teamRefId: team.teamRefId,
          teamLabel: team.teamLabel,
          playerRefId: only.id,
          playerName: only.name,
          eventSlug: team.eventSlug,
        });
      }
    } catch {
      setStatus("error");
      setError("Network error — please try again");
    }
  }

  function selectPlayer(id: string) {
    const player = roster?.players.find((p) => p.id === id);
    if (!roster || !player || player.alreadyPlayed) return;
    setPlayerId(id);
    onSelectionChange({
      source: roster.source,
      teamRefId: roster.teamRefId,
      teamLabel: roster.teamLabel,
      playerRefId: player.id,
      playerName: player.name,
      eventSlug: roster.eventSlug,
    });
  }

  return (
    <div className="mt-8 w-full max-w-sm space-y-3">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status !== "idle") reset();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              find();
            }
          }}
          placeholder="Enter your code"
          className="h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 backdrop-blur-sm outline-none focus:border-amber-300/60"
        />
        <button
          type="button"
          onClick={find}
          disabled={status === "loading" || !code.trim()}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          Find
        </button>
      </div>

      {status === "error" && error ? (
        <p className="text-xs font-medium text-rose-300">{error}</p>
      ) : null}

      {status === "found" && roster ? (
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
            {roster.teamLabel}
          </p>
          {roster.players.length > 1 ? (
            roster.players.every((p) => p.alreadyPlayed) ? (
              <p className="text-sm font-medium text-rose-300">
                Everyone on this team has already played — one entry per code.
              </p>
            ) : (
              <select
                value={playerId}
                onChange={(e) => selectPlayer(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-300/60 [&>option]:bg-[#111]"
              >
                <option value="" disabled>
                  Who&apos;s playing?
                </option>
                {roster.players.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.alreadyPlayed}>
                    {p.name}
                    {p.isCaptain ? " (Captain)" : ""}
                    {p.alreadyPlayed ? " — already played" : ""}
                  </option>
                ))}
              </select>
            )
          ) : roster.players[0]?.alreadyPlayed ? (
            <p className="text-sm font-medium text-rose-300">
              {roster.players[0].name} has already played — one entry per code.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
              {roster.players[0]?.isCaptain ? (
                <Crown className="size-3.5 text-amber-300" />
              ) : null}
              {roster.players[0]?.name}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
