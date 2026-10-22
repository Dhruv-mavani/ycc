import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEVEL_UP_SLUGS, isUnlimitedTestPlayer, type GameTeamSource } from "@/lib/game-plays";

// Public leaderboard for /games/leaderboard. game_plays has RLS enabled
// with no public policies (service-role-only — see migration 0033), so
// this reads through the admin client same as admin-stats.ts, even though
// the page itself is public with no auth gate. Short unstable_cache
// window (not force-dynamic) so a live event with many people repeatedly
// checking standings doesn't hit the DB on every request — same pattern
// as the homepage events grid (events-grid.tsx), just a shorter window
// since a leaderboard's freshness expectation is higher than a marketing
// page's. Excludes every UNLIMITED_TEST_PLAYERS identity (game-plays.ts)
// — a standing tester's plays must never appear on a public leaderboard.
//
// The one-entry-per-code rule (game-plays.ts) only applies going forward,
// so real historical duplicate plays exist from before it shipped — every
// query here dedupes to one row per player rather than trusting game_plays
// to already hold at most one.

export interface QuizLeaderboardRow {
  rank: number;
  playerName: string;
  teamLabel: string;
  source: GameTeamSource;
  questionsCorrect: number;
  totalQuestions: number;
  createdAt: string;
}

export interface WinnerRow {
  playerName: string;
  teamLabel: string;
  source: GameTeamSource;
  createdAt: string;
}

export interface LevelUpWinnerRow {
  rank: number;
  playerName: string;
  teamLabel: string;
  source: GameTeamSource;
  /** "full" = won both legs (Spin the Wheel + Roll a Dice), "mid" = won
   * exactly one. Ranked above "mid", same as the real win/lose outcome —
   * not the separate prize-tier draw layered on top (see game-plays.ts). */
  tier: "full" | "mid";
  /** The moment this ranking is based on — for "full" it's when the
   * *second* leg was won (that's when they actually became a full
   * winner), for "mid" it's their one win. Ties within a tier are broken
   * by whoever reached it earliest. */
  createdAt: string;
}

const QUIZ_LEADERBOARD_LIMIT = 50;
const LEVEL_UP_LEADERBOARD_LIMIT = 10;

async function getQuizLeaderboardUncached(): Promise<QuizLeaderboardRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("game_plays")
    .select("source, player_ref_id, player_name, team_label, detail, created_at")
    .eq("game_slug", "quiz-champion")
    .order("created_at", { ascending: true });

  // Rows arrive oldest-first, so only overwriting on a strictly higher
  // score keeps each player's best result with the earliest-reached
  // instance of that score as the natural tiebreak.
  const bestByPlayer = new Map<string, QuizLeaderboardRow>();
  for (const r of data ?? []) {
    const source = r.source as GameTeamSource;
    if (isUnlimitedTestPlayer(source, r.player_ref_id)) continue;
    const detail = r.detail as { questionsCorrect?: number; totalQuestions?: number } | null;
    const questionsCorrect = detail?.questionsCorrect ?? 0;
    const totalQuestions = detail?.totalQuestions ?? 15;
    const key = `${source}:${r.player_ref_id}`;
    const existing = bestByPlayer.get(key);
    if (!existing || questionsCorrect > existing.questionsCorrect) {
      bestByPlayer.set(key, {
        rank: 0,
        playerName: r.player_name,
        teamLabel: r.team_label,
        source,
        questionsCorrect,
        totalQuestions,
        createdAt: r.created_at,
      });
    }
  }

  return [...bestByPlayer.values()]
    .sort((a, b) =>
      b.questionsCorrect !== a.questionsCorrect
        ? b.questionsCorrect - a.questionsCorrect
        : a.createdAt.localeCompare(b.createdAt),
    )
    .slice(0, QUIZ_LEADERBOARD_LIMIT)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

async function getMysteryBoxWinnersUncached(): Promise<WinnerRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("game_plays")
    .select("source, player_ref_id, player_name, team_label, created_at")
    .eq("game_slug", "mystry-box")
    .eq("result", "won")
    .order("created_at", { ascending: true });

  const firstWinByPlayer = new Map<string, WinnerRow>();
  for (const r of data ?? []) {
    const source = r.source as GameTeamSource;
    if (isUnlimitedTestPlayer(source, r.player_ref_id)) continue;
    const key = `${source}:${r.player_ref_id}`;
    if (!firstWinByPlayer.has(key)) {
      firstWinByPlayer.set(key, {
        playerName: r.player_name,
        teamLabel: r.team_label,
        source,
        createdAt: r.created_at,
      });
    }
  }
  return [...firstWinByPlayer.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getLevelUpWinnersUncached(): Promise<LevelUpWinnerRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("game_plays")
    .select("game_slug, source, player_ref_id, player_name, team_label, created_at")
    .in("game_slug", LEVEL_UP_SLUGS)
    .eq("result", "won")
    .order("created_at", { ascending: true });

  // First win per player per leg (earliest attempt that actually won that
  // leg — a player can have up to 2 attempts with this code).
  const firstWinByPlayerAndLeg = new Map<
    string,
    { playerName: string; teamLabel: string; createdAt: string }
  >();
  for (const r of data ?? []) {
    const source = r.source as GameTeamSource;
    if (isUnlimitedTestPlayer(source, r.player_ref_id)) continue;
    const key = `${r.game_slug}:${source}:${r.player_ref_id}`;
    if (!firstWinByPlayerAndLeg.has(key)) {
      firstWinByPlayerAndLeg.set(key, {
        playerName: r.player_name,
        teamLabel: r.team_label,
        createdAt: r.created_at,
      });
    }
  }

  // Group per player across both legs — "full" (won both) outranks "mid"
  // (won one), tiebroken by whoever reached that tier earliest.
  const byPlayer = new Map<
    string,
    {
      playerName: string;
      teamLabel: string;
      source: GameTeamSource;
      spinWinAt?: string;
      diceWinAt?: string;
    }
  >();
  for (const [key, win] of firstWinByPlayerAndLeg) {
    const [slug, source, playerRefId] = key.split(":");
    const playerKey = `${source}:${playerRefId}`;
    const entry = byPlayer.get(playerKey) ?? {
      playerName: win.playerName,
      teamLabel: win.teamLabel,
      source: source as GameTeamSource,
    };
    if (slug === "spin-wheel") entry.spinWinAt = win.createdAt;
    else entry.diceWinAt = win.createdAt;
    byPlayer.set(playerKey, entry);
  }

  const rows = [...byPlayer.values()].map((p) => {
    const tier: "full" | "mid" = p.spinWinAt && p.diceWinAt ? "full" : "mid";
    const createdAt =
      tier === "full"
        ? p.spinWinAt! > p.diceWinAt! ? p.spinWinAt! : p.diceWinAt!
        : (p.spinWinAt ?? p.diceWinAt)!;
    return { playerName: p.playerName, teamLabel: p.teamLabel, source: p.source, tier, createdAt };
  });

  return rows
    .sort((a, b) =>
      a.tier !== b.tier
        ? a.tier === "full" ? -1 : 1
        : a.createdAt.localeCompare(b.createdAt),
    )
    .slice(0, LEVEL_UP_LEADERBOARD_LIMIT)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

const CACHE_OPTS = { revalidate: 15, tags: ["game-plays"] };

export const getQuizLeaderboard = unstable_cache(
  getQuizLeaderboardUncached,
  ["quiz-leaderboard"],
  CACHE_OPTS,
);

export const getMysteryBoxWinners = unstable_cache(
  getMysteryBoxWinnersUncached,
  ["mystery-box-winners"],
  CACHE_OPTS,
);

export const getLevelUpWinners = unstable_cache(
  getLevelUpWinnersUncached,
  ["level-up-winners"],
  CACHE_OPTS,
);
