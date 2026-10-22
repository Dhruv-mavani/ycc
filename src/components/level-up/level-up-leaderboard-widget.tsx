"use client";

import { useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WinnerRow {
  rank: number;
  playerName: string;
  teamLabel: string;
  tier: "full" | "mid";
}

// Self-contained button + dialog, mounted independently on every Level Up
// screen (gate, Level 1, Level 2, summary — see the {muteButton}-style
// insertion points in level-up-game.tsx/spin-wheel-level.tsx/roll-dice-
// level.tsx) so the live winners list is reachable at every point in a
// run, not just after finishing — same pattern as QuizLeaderboardWidget
// in solo-quiz-game.tsx. A real ranked Top 10 (full win outranks a win on
// just one level, tiebroken by speed) — see getLevelUpWinnersUncached in
// public-leaderboard.ts. Fetches from /api/games/level-up-winners (a thin
// public wrapper around the same cached getLevelUpWinners() that backs
// /games/leaderboard) each time it's opened.
export function LevelUpLeaderboardWidget() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<WinnerRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function openLeaderboard() {
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/games/level-up-winners");
      const data = await res.json().catch(() => null);
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openLeaderboard}
        aria-label="View winners"
        className="absolute left-4 top-4 z-10 text-white/70 hover:text-white"
      >
        <Trophy className="size-7 md:size-8" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-2 border-violet-500 bg-violet-950 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-white">Kismat Ke Khiladi — Top 10</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-white/70" />
            </div>
          ) : !rows || rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/70">
              No wins yet on Spin the Wheel or Roll a Dice — give it a shot.
            </p>
          ) : (
            <div className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
              {rows.map((w) => (
                <div
                  key={`${w.rank}-${w.playerName}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate font-medium">
                    <span className="text-white/50">{w.rank}.</span> {w.playerName}{" "}
                    <span className="text-white/50">— {w.teamLabel}</span>
                  </span>
                  <span
                    className={
                      w.tier === "full"
                        ? "shrink-0 rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-300"
                        : "shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60"
                    }
                  >
                    {w.tier === "full" ? "Won Both" : "Won 1"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <a
            href="/games/leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-xs font-semibold text-violet-300 underline-offset-2 hover:underline"
          >
            View full leaderboard (+ Quiz Champion &amp; Mystery Box) ↗
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
}
