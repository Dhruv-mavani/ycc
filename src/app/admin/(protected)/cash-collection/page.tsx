import Link from "next/link";
import { ArrowLeftIcon, Banknote, CheckCircle2, Clock, Wallet } from "lucide-react";
import { getCashCollectionOverview } from "@/lib/admin-stats";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default async function AdminCashCollectionPage() {
  const cashCollection = await getCashCollectionOverview();

  const totalConfirmed = cashCollection.reduce((sum, c) => sum + c.confirmedRegistrations, 0);
  const totalPaidPaise = cashCollection.reduce((sum, c) => sum + c.paidPaise, 0);
  const totalPendingPaise = cashCollection.reduce((sum, c) => sum + c.pendingPaise, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4">
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
        </>
      )}
    </div>
  );
}
