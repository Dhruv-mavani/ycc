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
  /** Level Up only — which leg this win was on. */
  level?: "Spin the Wheel" | "Roll a Dice";
}

const QUIZ_LEADERBOARD_LIMIT = 50;

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

async function getLevelUpWinnersUncached(): Promise<WinnerRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("game_plays")
    .select("game_slug, source, player_ref_id, player_name, team_label, created_at")
    .in("game_slug", LEVEL_UP_SLUGS)
    .eq("result", "won")
    .order("created_at", { ascending: true });

  // Keyed per leg too — a win on Spin the Wheel and a win on Roll a Dice
  // are both worth showing, same player or not.
  const firstWinByPlayerAndLeg = new Map<string, WinnerRow>();
  for (const r of data ?? []) {
    const source = r.source as GameTeamSource;
    if (isUnlimitedTestPlayer(source, r.player_ref_id)) continue;
    const key = `${r.game_slug}:${source}:${r.player_ref_id}`;
    if (!firstWinByPlayerAndLeg.has(key)) {
      firstWinByPlayerAndLeg.set(key, {
        playerName: r.player_name,
        teamLabel: r.team_label,
        source,
        createdAt: r.created_at,
        level: r.game_slug === "spin-wheel" ? "Spin the Wheel" : "Roll a Dice",
      });
    }
  }
  return [...firstWinByPlayerAndLeg.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
