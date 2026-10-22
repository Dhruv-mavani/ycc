import type { Metadata } from "next";
import { BackButton } from "@/components/site/back-button";
import {
  getQuizLeaderboard,
  getMysteryBoxWinners,
  getLevelUpWinners,
  type QuizLeaderboardRow,
  type WinnerRow,
  type LevelUpWinnerRow,
} from "@/lib/public-leaderboard";
import { Crown, Gift, Sparkles, Trophy } from "lucide-react";
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

export const metadata: Metadata = {
  title: "Leaderboard | YCC",
  description: "See who's topping Quiz Champion, and who's won Mystery Box and Kismat Ke Khiladi.",
};

function sourceLabel(source: WinnerRow["source"] | QuizLeaderboardRow["source"]) {
  return source === "partner"
    ? "Partner"
    : source === "school"
      ? "Super Champs"
      : source === "individual_free"
        ? "Jackpot Heist"
        : "Team";
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default async function LeaderboardPage() {
  const [quizRows, mysteryBoxWinners, levelUpWinners] = await Promise.all([
    getQuizLeaderboard(),
    getMysteryBoxWinners(),
    getLevelUpWinners(),
  ]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-16 lg:px-8">
        <BackButton className="mb-6 sm:mb-8" />

        <div className="mb-10 flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 mb-5 text-xs sm:text-sm font-medium text-primary shadow-sm backdrop-blur-md">
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Live Standings</span>
          </div>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Leaderboard</h1>
          <p className="max-w-2xl text-muted-foreground text-xs sm:text-base md:text-lg leading-relaxed">
            Quiz Champion ranked by score. Mystery Box and Kismat Ke Khiladi
            have no running score to rank by — just who&apos;s won so far.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
            <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-5 text-amber-500" /> Quiz Champion
              </CardTitle>
              <CardDescription>Top {quizRows.length > 0 ? quizRows.length : ""} by score, earliest to reach it first on a tie.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground/80 pl-6">#</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Player</TableHead>
                    <TableHead className="font-semibold text-foreground/80">Team</TableHead>
                    <TableHead className="font-semibold text-foreground/80 text-right pr-6">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizRows.map((row) => (
                    <TableRow key={`${row.source}-${row.rank}`} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="pl-6 font-semibold text-muted-foreground">
                        {row.rank <= 3 ? (
                          <Crown
                            className={
                              row.rank === 1
                                ? "size-4 text-amber-500"
                                : row.rank === 2
                                  ? "size-4 text-slate-400"
                                  : "size-4 text-amber-700"
                            }
                          />
                        ) : (
                          row.rank
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row.playerName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.teamLabel}
                        <span className="ml-1.5 text-xs text-muted-foreground/60">
                          ({sourceLabel(row.source)})
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right font-semibold">
                        {row.questionsCorrect}/{row.totalQuestions}
                      </TableCell>
                    </TableRow>
                  ))}
                  {quizRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground text-center py-10">
                        No one&apos;s cracked the quiz yet — be the first!
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <WinnersCard
            title="Mystery Box"
            icon={<Gift className="size-5 text-amber-500" />}
            emptyCopy="No one's landed their number yet — a real 0.25% shot, so maybe you'll be the first."
            winners={mysteryBoxWinners}
          />

          <LevelUpLeaderboardCard winners={levelUpWinners} />
        </div>
      </div>
    </div>
  );
}

function WinnersCard({
  title,
  icon,
  emptyCopy,
  winners,
}: {
  title: string;
  icon: React.ReactNode;
  emptyCopy: string;
  winners: WinnerRow[];
}) {
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
      <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          {icon} {title}
          <Badge variant="secondary">{winners.length} winner{winners.length === 1 ? "" : "s"}</Badge>
        </CardTitle>
        <CardDescription>Newest first.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {winners.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">{emptyCopy}</p>
        ) : (
          <ul className="space-y-2">
            {winners.map((w, i) => (
              <li
                key={`${w.source}-${w.playerName}-${w.createdAt}-${i}`}
                className="flex flex-col gap-0.5 rounded-xl border border-border/50 bg-card/50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium">
                  {w.playerName}{" "}
                  <span className="text-muted-foreground">
                    — {w.teamLabel} ({sourceLabel(w.source)})
                  </span>
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatWhen(w.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// Unlike WinnersCard above (a flat "newest first" feed), Level Up has a
// real Top 10 ranking: full win (both legs) outranks a win on just one,
// tiebroken by whoever reached that tier earliest — see
// getLevelUpWinnersUncached in public-leaderboard.ts. Same ranked-table
// look as the Quiz Champion table above, rather than WinnersCard's list.
function LevelUpLeaderboardCard({ winners }: { winners: LevelUpWinnerRow[] }) {
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
      <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-indigo-500" /> Kismat Ke Khiladi
          <Badge variant="secondary">Top {winners.length}</Badge>
        </CardTitle>
        <CardDescription>Won both levels, then earliest first.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {winners.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">
            No wins yet on Spin the Wheel or Roll a Dice — give it a shot.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">#</TableHead>
                <TableHead className="font-semibold text-foreground/80">Player</TableHead>
                <TableHead className="font-semibold text-foreground/80">Team</TableHead>
                <TableHead className="font-semibold text-foreground/80 text-right pr-6">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((row) => (
                <TableRow key={`${row.source}-${row.rank}`} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="pl-6 font-semibold text-muted-foreground">
                    {row.rank <= 3 ? (
                      <Crown
                        className={
                          row.rank === 1
                            ? "size-4 text-amber-500"
                            : row.rank === 2
                              ? "size-4 text-slate-400"
                              : "size-4 text-amber-700"
                        }
                      />
                    ) : (
                      row.rank
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{row.playerName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.teamLabel}
                    <span className="ml-1.5 text-xs text-muted-foreground/60">
                      ({sourceLabel(row.source)})
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Badge
                      variant="outline"
                      className={
                        row.tier === "full"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {row.tier === "full" ? "Won Both" : "Won 1 Level"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
