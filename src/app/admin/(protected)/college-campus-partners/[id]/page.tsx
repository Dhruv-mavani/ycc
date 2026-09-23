import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, Award, Trophy, Users, ArrowRightLeft } from "lucide-react";
import { getCollegeCampusPartnerInsights } from "@/lib/admin-stats";
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

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export default async function AdminCollegeCampusPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const insights = await getCollegeCampusPartnerInsights(id);

  if (!insights) notFound();

  const { profile, teams, totalPlayers, convertedCount } = insights;
  const conversionRate =
    teams.length > 0 ? Math.round((convertedCount / teams.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-2xl break-words">{profile.name}</CardTitle>
              <CardDescription className="break-words">
                YCC College Campus Partner
                {profile.collegeName ? ` · ${profile.collegeName}` : ""}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {profile.code ? (
                <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
                  {profile.code}
                </Badge>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={`/api/college-campus-partner/certificate/${profile.id}/download?view=true`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Award className="size-3.5" />
                    Certificate
                  </a>
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Mobile</p>
            <p className="font-medium">{profile.mobile}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Email</p>
            <p className="font-medium truncate">{profile.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Age / Gender</p>
            <p className="font-medium capitalize">
              {profile.age} · {profile.gender}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Instagram</p>
            <p className="font-medium">@{profile.instagramHandle}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Stream</p>
            <p className="font-medium">{profile.stream}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Year / Semester</p>
            <p className="font-medium">
              {profile.year} / Sem {profile.semester}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Joined</p>
            <p className="font-medium">{formatJoinDate(profile.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{teams.length}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Teams joined
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-500">
              <Trophy className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{totalPlayers}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                People joined
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
              <ArrowRightLeft className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {convertedCount}
                <span className="text-muted-foreground text-base font-normal">
                  {" "}
                  / {teams.length} ({conversionRate}%)
                </span>
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Converted to Box Cricket
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
          <CardTitle>Teams registered under this code</CardTitle>
          <CardDescription>
            Kismat Ke Khiladi ft. Go Goa Gone registrations that entered{" "}
            {profile.name}&apos;s code — and whether each one went on to also
            register for the Box Cricket Tournament.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[560px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">Team</TableHead>
                <TableHead className="font-semibold text-foreground/80">Captain</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80">Squad</TableHead>
                <TableHead className="font-semibold text-foreground/80">Box Cricket</TableHead>
                <TableHead className="font-semibold text-foreground/80 pr-6">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((t) => (
                <TableRow key={t.registrationId} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="pl-6 font-medium">{t.teamName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{t.captainName ?? "—"}</TableCell>
                  <TableCell className="text-right">{t.squadSize}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        t.convertedToBoxCricket
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {t.convertedToBoxCricket ? "Converted" : "Not yet"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground whitespace-nowrap">
                    {formatJoinDate(t.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center py-12">
                    No one has registered for Go Goa Gone with this code yet.
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
