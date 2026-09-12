import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowLeftIcon,
  Banknote,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  Wallet,
} from "lucide-react";
import { getCashCollectionOverview, getCashCollectionDetail } from "@/lib/admin-stats";
import { CashCollectionSearch } from "@/components/admin/cash-collection-search";
import { CashCollectionStatusFilter } from "@/components/admin/cash-collection-status-filter";
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

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminCashCollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: "all" | "paid" | "pending" }>;
}) {
  const { q, status } = await searchParams;
  const cashCollection = await getCashCollectionOverview();

  const totalConfirmed = cashCollection.reduce((sum, c) => sum + c.confirmedRegistrations, 0);
  const totalPaidPaise = cashCollection.reduce((sum, c) => sum + c.paidPaise, 0);
  const totalPendingPaise = cashCollection.reduce((sum, c) => sum + c.pendingPaise, 0);

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

      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
          <Wallet className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Cash collection</h1>
          <p className="text-muted-foreground text-sm">
            Pay-at-venue events — cash entry fees, split into paid vs. still-pending.
          </p>
        </div>
      </div>

      {cashCollection.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No pay-at-venue events are active right now.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
                  <Banknote className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{totalConfirmed}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirmed
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{formatRupees(totalPaidPaise)}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Paid
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{formatRupees(totalPendingPaise)}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pending
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {cashCollection.map((c) => (
              <Card key={c.eventId}>
                <CardHeader>
                  <CardTitle>{c.eventName}</CardTitle>
                  <CardDescription>
                    &quot;Revenue&quot; on the main dashboard counts a
                    registration&apos;s fee as soon as it&apos;s confirmed, before
                    cash is actually collected at the venue — this breaks that
                    same money into paid vs. still-pending.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">
                        Confirmed
                      </p>
                      <p className="text-lg font-bold">{c.confirmedRegistrations}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">
                        Paid
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        {c.paidRegistrations}{" "}
                        <span className="text-sm font-medium">
                          ({formatRupees(c.paidPaise)})
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">
                        Pending
                      </p>
                      <p className="text-lg font-bold text-amber-600">
                        {c.pendingRegistrations}{" "}
                        <span className="text-sm font-medium">
                          ({formatRupees(c.pendingPaise)})
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">
                        Total due
                      </p>
                      <p className="text-lg font-bold">
                        {formatRupees(c.paidPaise + c.pendingPaise)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Full breakdown</h2>
            <div className="flex flex-col min-[480px]:flex-row gap-2 w-full sm:w-auto">
              <CashCollectionSearch />
              <CashCollectionStatusFilter />
            </div>
          </div>

          <Suspense key={`${q ?? ""}-${status ?? "all"}`} fallback={<PageSpinner className="min-h-[30vh]" />}>
            <CashCollectionTable search={q} status={status} />
          </Suspense>
        </>
      )}
    </div>
  );
}

async function CashCollectionTable({
  search,
  status,
}: {
  search?: string;
  status?: "all" | "paid" | "pending";
}) {
  const details = await getCashCollectionDetail(search);
  const filtered =
    status === "paid"
      ? details.filter((d) => d.paid)
      : status === "pending"
        ? details.filter((d) => !d.paid)
        : details;

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
      <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          Registrations
          <Badge variant="secondary">{filtered.length}</Badge>
        </CardTitle>
        <CardDescription>
          Every confirmed pay-at-venue registration — who they are, whether
          and when the cash was collected, and by whom.
          {search ? ` Filtered to "${search}".` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground/80 pl-6">Team / Captain</TableHead>
              <TableHead className="font-semibold text-foreground/80">College</TableHead>
              <TableHead className="font-semibold text-foreground/80">Phone</TableHead>
              <TableHead className="font-semibold text-foreground/80">Participants</TableHead>
              <TableHead className="text-right font-semibold text-foreground/80">Amount</TableHead>
              <TableHead className="font-semibold text-foreground/80">Registered</TableHead>
              <TableHead className="font-semibold text-foreground/80">Status</TableHead>
              <TableHead className="font-semibold text-foreground/80">Paid at</TableHead>
              <TableHead className="font-semibold text-foreground/80">Marked by</TableHead>
              <TableHead className="font-semibold text-foreground/80 pr-6">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.registrationId} className="hover:bg-primary/5 transition-colors">
                <TableCell className="pl-6">
                  <div className="font-medium text-foreground">
                    {d.teamName ?? d.captainName ?? "—"}
                  </div>
                  {d.teamName && d.captainName ? (
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Crown className="size-3 text-amber-500" />
                      {d.captainName}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="text-muted-foreground">{d.collegeName}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {d.captainPhone}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span title={d.participants.map((p) => p.uniqueId ?? p.name).join(", ")}>
                    {d.participants.length}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatRupees(d.amountPaise)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDate(d.registeredAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      d.paid
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200",
                    )}
                  >
                    {d.paid ? "Paid" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {d.paidAt ? formatDate(d.paidAt) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.markedByName ?? "—"}
                </TableCell>
                <TableCell className="pr-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={
                      <a
                        href={`/api/registrations/${d.registrationId}/receipt?view=true`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Eye className="size-4" />
                        View
                      </a>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-muted-foreground text-center py-12">
                  No matching registrations.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
