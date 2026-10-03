import Link from "next/link";
import { ArrowLeftIcon, Users, Mars, Venus, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default async function AdminYccClubPage() {
  const admin = createAdminClient();
  const { data: members } = await admin
    .from("ycc_club_applications")
    .select("id, name, mobile, gender, created_at")
    .order("created_at", { ascending: false });

  const rows = members ?? [];
  const maleCount = rows.filter((m) => m.gender === "male").length;
  const femaleCount = rows.filter((m) => m.gender === "female").length;
  const otherCount = rows.length - maleCount - femaleCount;

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

      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total members"
          value={rows.length}
          icon={Users}
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
        />
        <StatCard
          label="Male"
          value={maleCount}
          icon={Mars}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-500/10"
        />
        <StatCard
          label="Female"
          value={femaleCount}
          icon={Venus}
          colorClass="text-pink-500"
          bgClass="bg-pink-500/10"
        />
        <StatCard
          label="Other"
          value={otherCount}
          icon={UserRound}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
        />
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            YCC Club Members
            <Badge variant="secondary">{rows.length}</Badge>
          </CardTitle>
          <CardDescription>
            Everyone who&apos;s joined YCC Club — confirmed the WhatsApp
            channel and Instagram follow at signup.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">Name</TableHead>
                <TableHead className="font-semibold text-foreground/80">WhatsApp</TableHead>
                <TableHead className="font-semibold text-foreground/80">Gender</TableHead>
                <TableHead className="font-semibold text-foreground/80 pr-6">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="pl-6 font-medium">{m.name}</TableCell>
                  <TableCell>{m.mobile}</TableCell>
                  <TableCell className="capitalize">{m.gender}</TableCell>
                  <TableCell className="pr-6 text-muted-foreground whitespace-nowrap">
                    {formatDate(m.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center py-12">
                    No YCC Club members yet.
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

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass = "text-blue-500",
  bgClass = "bg-blue-500/10",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass?: string;
  bgClass?: string;
}) {
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow duration-300 border-border/50 bg-card/50 backdrop-blur-sm p-0 gap-0">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className={cn("p-2.5 rounded-xl transition-colors", bgClass, colorClass)}>
            <Icon className="size-5" />
          </div>
        </div>
        <div>
          <p className="text-xl min-[360px]:text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {value}
          </p>
          <p className="text-muted-foreground text-[11px] sm:text-xs font-semibold uppercase tracking-wider mt-1">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
