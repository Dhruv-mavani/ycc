import Link from "next/link";
import { ArrowLeftIcon, Crown, Gamepad2, Trophy, XCircle } from "lucide-react";
import { getGameInsights } from "@/lib/admin-stats";
import { GAMES } from "@/lib/games";
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

export default async function AdminGamesPage() {
  const { summary, recentPlays } = await getGameInsights();
  const totalPlays = summary.reduce((sum, s) => sum + s.plays, 0);
  const totalWins = summary.reduce((sum, s) => sum + s.wins, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
              <Gamepad2 className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{totalPlays}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total plays
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
                Total wins
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
                Total losses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            Most recent 200 rounds — who played, for which team, and the
            result.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">Player</TableHead>
                <TableHead className="font-semibold text-foreground/80">Team</TableHead>
                <TableHead className="font-semibold text-foreground/80">Game</TableHead>
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
                  <TableCell>{GAME_TITLE_BY_SLUG.get(p.gameSlug) ?? p.gameSlug}</TableCell>
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
                  <TableCell colSpan={5} className="text-muted-foreground text-center py-12">
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
