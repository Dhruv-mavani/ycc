import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftIcon, Crown, Gamepad2, Trophy, XCircle } from "lucide-react";
import { getGameInsights } from "@/lib/admin-stats";
import { GAMES } from "@/lib/games";
import { GameFilter } from "@/components/admin/game-filter";
import { GamePlaySearch } from "@/components/admin/game-play-search";
import { GameResultFilter } from "@/components/admin/game-result-filter";
import { PageSpinner } from "@/components/site/page-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const GAME_TITLE_BY_SLUG = new Map(GAMES.map((g) => [g.slug, g.title]));

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; q?: string; result?: "won" | "lost" }>;
}) {
  const { game, q, result } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/admin">
              <ArrowLeftIcon className="size-4" />
              Back to overview
            </Link>
          }
        />
        <div className="flex flex-col min-[480px]:flex-row gap-2 w-full sm:w-auto">
          <GameFilter />
          <GameResultFilter />
          <GamePlaySearch />
        </div>
      </div>

      <Suspense key={`${game ?? "all"}-${q ?? ""}-${result ?? "all"}`} fallback={<PageSpinner className="min-h-[40vh]" />}>
        <GamesData gameSlug={game} search={q} result={result} />
      </Suspense>
    </div>
  );
}

async function GamesData({
  gameSlug,
  search,
  result,
}: {
  gameSlug?: string;
  search?: string;
  result?: "won" | "lost";
}) {
  const { summary, recentPlays } = await getGameInsights(gameSlug, search, result);
  const resultLabel = result === "won" ? "won" : result === "lost" ? "lost" : null;
  const totalPlays = summary.reduce((sum, s) => sum + s.plays, 0);
  const totalWins = summary.reduce((sum, s) => sum + s.wins, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
              <Gamepad2 className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{totalPlays}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {gameSlug ? "Plays" : "Total plays"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
              <Trophy className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{totalWins}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {gameSlug ? "Wins" : "Total wins"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-500">
              <XCircle className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {totalPlays - totalWins}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {gameSlug ? "Losses" : "Total losses"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          summary.length > 1 ? "sm:grid-cols-2" : "sm:max-w-sm",
        )}
      >
        {summary.length === 0 ? (
          <Card className="sm:col-span-2">
            <CardContent className="py-10 text-center text-muted-foreground">
              No rounds played yet.
            </CardContent>
          </Card>
        ) : (
          summary.map((s) => {
            const winRate = s.plays > 0 ? Math.round((s.wins / s.plays) * 100) : 0;
            return (
              <Card key={s.gameSlug}>
                <CardHeader>
                  <CardTitle>{GAME_TITLE_BY_SLUG.get(s.gameSlug) ?? s.gameSlug}</CardTitle>
                  <CardDescription>{s.plays} rounds played</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{s.wins}</p>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-rose-600">{s.losses}</p>
                    <p className="text-xs text-muted-foreground">Losses</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{winRate}%</p>
                    <p className="text-xs text-muted-foreground">Win rate</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            Recent plays
            <Badge variant="secondary">{recentPlays.length}</Badge>
          </CardTitle>
          <CardDescription>
            {gameSlug
              ? `Most recent 200 matching rounds of ${GAME_TITLE_BY_SLUG.get(gameSlug) ?? gameSlug}`
              : "Most recent 200 matching rounds"}
            {resultLabel ? ` that ${resultLabel}` : ""}
            {search ? ` — filtered to "${search}"` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">Player</TableHead>
                <TableHead className="font-semibold text-foreground/80">Team</TableHead>
                {gameSlug ? null : (
                  <TableHead className="font-semibold text-foreground/80">Game</TableHead>
                )}
                <TableHead className="font-semibold text-foreground/80">Result</TableHead>
                <TableHead className="font-semibold text-foreground/80 pr-6">Played</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPlays.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {p.isCaptain ? (
                        <Crown className="size-3.5 text-amber-500" />
                      ) : null}
                      {p.playerName}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.teamLabel}
                    <span className="ml-1.5 text-xs text-muted-foreground/60">
                      ({p.source === "partner" ? "Partner" : "Team"})
                    </span>
                  </TableCell>
                  {gameSlug ? null : (
                    <TableCell>{GAME_TITLE_BY_SLUG.get(p.gameSlug) ?? p.gameSlug}</TableCell>
                  )}
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        p.result === "won"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200",
                      )}
                    >
                      {p.result === "won" ? "Won" : "Lost"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground whitespace-nowrap">
                    {formatDate(p.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {recentPlays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={gameSlug ? 4 : 5} className="text-muted-foreground text-center py-12">
                    No rounds played yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
