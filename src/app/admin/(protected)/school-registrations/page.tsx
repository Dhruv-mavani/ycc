import Link from "next/link";
import { ArrowLeftIcon, Download, FileText } from "lucide-react";
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
  });
}

export default async function AdminSchoolRegistrationsPage() {
  const admin = createAdminClient();
  const { data: registrations } = await admin
    .from("school_tournament_registrations")
    .select(
      "id, name, email, whatsapp, instagram_handle, age, gender, code, created_at, school_id, event_id",
    )
    .order("created_at", { ascending: false });

  const [{ data: schools }, { data: events }] = await Promise.all([
    admin.from("schools").select("id, name"),
    admin.from("events").select("id, name"),
  ]);

  const schoolNameById = new Map((schools ?? []).map((s) => [s.id, s.name]));
  const eventNameById = new Map((events ?? []).map((e) => [e.id, e.name]));

  const rows = (registrations ?? []).map((r) => ({
    ...r,
    schoolName: r.school_id ? (schoolNameById.get(r.school_id) ?? null) : null,
    eventName: eventNameById.get(r.event_id) ?? null,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4">
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
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
          nativeButton={false}
          render={
            <a href="/api/admin/export/school-registrations">
              <Download className="size-4" />
              Export CSV
            </a>
          }
        />
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            School Registrations
            <Badge variant="secondary">{rows.length}</Badge>
          </CardTitle>
          <CardDescription>
            Free, individual registrations for school-targeted events like
            YCC Super Champs — no team, no payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">Name</TableHead>
                <TableHead className="font-semibold text-foreground/80">Code</TableHead>
                <TableHead className="font-semibold text-foreground/80">WhatsApp</TableHead>
                <TableHead className="font-semibold text-foreground/80">Email</TableHead>
                <TableHead className="font-semibold text-foreground/80">Instagram</TableHead>
                <TableHead className="font-semibold text-foreground/80">Age</TableHead>
                <TableHead className="font-semibold text-foreground/80">Gender</TableHead>
                <TableHead className="font-semibold text-foreground/80">School</TableHead>
                <TableHead className="font-semibold text-foreground/80">Event</TableHead>
                <TableHead className="font-semibold text-foreground/80 pr-6">Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="pl-6 font-medium">{r.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">{r.code}</Badge>
                      <a
                        href={`/api/school-registrations/${r.id}/certificate?view=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View certificate"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <FileText className="size-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{r.whatsapp}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.instagram_handle ?? "—"}
                  </TableCell>
                  <TableCell>{r.age}</TableCell>
                  <TableCell className="capitalize">{r.gender}</TableCell>
                  <TableCell>{r.schoolName ?? "—"}</TableCell>
                  <TableCell>{r.eventName ?? "—"}</TableCell>
                  <TableCell className="pr-6 text-muted-foreground whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-muted-foreground text-center py-12">
                    No school registrations yet.
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
