import Link from "next/link";
import { Suspense } from "react";
import { Users, Banknote, CalendarCheck, UserCheck, UserX, type LucideIcon } from "lucide-react";
import { getEventOverview } from "@/lib/admin-stats";
import { createAdminClient } from "@/lib/supabase/admin";
import { EventFilter } from "@/components/admin/event-filter";
import { CollegeRevenueChart } from "@/components/admin/college-revenue-chart";
import { AdminNavButtons } from "@/components/admin/admin-nav-buttons";
import { PageSpinner } from "@/components/site/page-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: eventId } = await searchParams;

  // Filter-independent data — fetched once, outside the Suspense boundary
  // below, so the dropdown and nav buttons never unmount/reload when the
  // selected event changes. Only the data that actually depends on eventId
  // suspends.
  const [{ data: events }, { count: pendingStaffCount }] = await Promise.all([
    createAdminClient().from("events").select("id, name, type").order("created_at"),
    createAdminClient()
      .from("staff")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
        <EventFilter events={events ?? []} />
        <AdminNavButtons initialPendingStaffCount={pendingStaffCount ?? 0} />
      </div>

      <Suspense key={eventId ?? "all"} fallback={<PageSpinner className="min-h-[50vh]" />}>
        <DashboardData eventId={eventId} />
      </Suspense>
    </div>
  );
}

async function DashboardData({ eventId }: { eventId?: string }) {
  const overview = await getEventOverview(eventId || undefined);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Registrations"
          value={overview.overall.registrations}
          icon={CalendarCheck}
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
        />
        <StatCard
          label="Participants"
          value={overview.overall.participants}
          icon={Users}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-500/10"
        />
        <StatCard
          label="Revenue"
          value={formatRupees(overview.overall.revenuePaise)}
          icon={Banknote}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
        />
        <StatCard
          label="Present"
          value={overview.overall.present}
          icon={UserCheck}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
        />
        <StatCard
          label="Absent"
          value={overview.overall.absent}
          icon={UserX}
          colorClass="text-rose-500"
          bgClass="bg-rose-500/10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by college</CardTitle>
          <CardDescription>Top 10 colleges by amount collected</CardDescription>
        </CardHeader>
        <CardContent>
          <CollegeRevenueChart data={overview.byCollege} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
          <CardTitle>Colleges Overview</CardTitle>
          <CardDescription>Click a college name to view full registration details</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">College Name</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80">Registrations</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80">Participants</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80">Revenue</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80">Present</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80 pr-6">Absent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.byCollege.map((c) => (
                <TableRow key={c.collegeId} className="hover:bg-primary/5 transition-colors group">
                  <TableCell className="pl-6">
                    <Link
                      href={`/admin/colleges/${c.collegeId}${eventId ? `?event=${eventId}` : ""}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.collegeName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">{c.registrations}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">{c.participants}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">
                    {formatRupees(c.revenuePaise)}
                  </TableCell>
                  <TableCell className="text-right text-amber-600 font-medium">{c.present}</TableCell>
                  <TableCell className="text-right text-rose-600 font-medium pr-6">{c.absent}</TableCell>
                </TableRow>
              ))}
              {overview.byCollege.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-muted/50 rounded-full">
                        <Users className="size-6 text-muted-foreground" />
                      </div>
                      <p>No confirmed registrations yet.</p>
                    </div>
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
  bgClass = "bg-blue-500/10"
}: { 
  label: string; 
  value: string | number;
  icon: LucideIcon;
  colorClass?: string;
  bgClass?: string;
}) {
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm p-0 gap-0">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className={cn("p-2.5 rounded-xl transition-colors", bgClass, colorClass)}>
            <Icon className="size-5" />
          </div>
        </div>
        <div>
          <p className="text-xl min-[360px]:text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{value}</p>
          <p className="text-muted-foreground text-[11px] sm:text-xs font-semibold uppercase tracking-wider mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
