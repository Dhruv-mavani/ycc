import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

const SOURCE_LABEL: Record<string, string> = {
  registration: "Team",
  partner: "Partner",
  school: "Super Champs",
  individual_free: "Jackpot Heist",
};

export default async function AdminGoaTripInterestPage() {
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("goa_trip_interest")
    .select("id, player_name, team_label, source, phone, created_at")
    .order("created_at", { ascending: false });

  const entries = rows ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4">
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

      <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            Goa Trip Interest
            <Badge variant="secondary">{entries.length}</Badge>
          </CardTitle>
          <CardDescription>
            Level Up players who lost both levels and said yes to
            &quot;Don&apos;t be sad — want to come to Goa with us?&quot;
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">Name</TableHead>
                <TableHead className="font-semibold text-foreground/80">Team</TableHead>
                <TableHead className="font-semibold text-foreground/80">Phone</TableHead>
                <TableHead className="font-semibold text-foreground/80">Source</TableHead>
                <TableHead className="font-semibold text-foreground/80 pr-6">Said yes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="pl-6 font-medium">{e.player_name}</TableCell>
                  <TableCell className="text-muted-foreground">{e.team_label}</TableCell>
                  <TableCell>
                    {e.phone ? (
                      <a href={`tel:${e.phone}`} className="font-mono hover:underline">
                        {e.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{SOURCE_LABEL[e.source] ?? e.source}</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground whitespace-nowrap">
                    {formatDate(e.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center py-12">
                    No one has said yes yet.
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
