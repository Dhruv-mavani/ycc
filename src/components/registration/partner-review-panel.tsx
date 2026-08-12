"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PartnerApplicationStatus } from "@/lib/supabase/types";

interface Reportee {
  id: string;
  name: string;
  email: string;
  mobile: string;
  instagram_handle: string;
  status: PartnerApplicationStatus;
  created_at: string;
}

export function PartnerReviewPanel({ childLabel }: { childLabel: string }) {
  const [reportees, setReportees] = useState<Reportee[] | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partner-program/reportees")
      .then((res) => res.json())
      .then((data) => setReportees(data.reportees ?? []))
      .catch(() => setReportees([]));
  }, []);

  async function review(id: string, status: "approved" | "rejected") {
    setReviewingId(id);
    try {
      const res = await fetch(`/api/partner-program/reportees/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error("Could not update status");
        return;
      }
      setReportees((prev) =>
        (prev ?? []).map((r) => (r.id === id ? { ...r, status } : r)),
      );
      toast.success(status === "approved" ? "Approved" : "Rejected");
    } finally {
      setReviewingId(null);
    }
  }

  if (reportees === null) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (reportees.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No {childLabel} applications have named you as their referrer yet.
      </p>
    );
  }

  const pending = reportees.filter((r) => r.status === "pending");
  const reviewed = reportees.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      {pending.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Pending ({pending.length})</h2>
          {pending.map((r) => (
            <ReporteeCard
              key={r.id}
              reportee={r}
              busy={reviewingId === r.id}
              onApprove={() => review(r.id, "approved")}
              onReject={() => review(r.id, "rejected")}
            />
          ))}
        </div>
      ) : null}

      {reviewed.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Reviewed</h2>
          {reviewed.map((r) => (
            <ReporteeCard
              key={r.id}
              reportee={r}
              busy={reviewingId === r.id}
              onApprove={() => review(r.id, "approved")}
              onReject={() => review(r.id, "rejected")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReporteeCard({
  reportee,
  busy,
  onApprove,
  onReject,
}: {
  reportee: Reportee;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isApproved = reportee.status === "approved";
  const isRejected = reportee.status === "rejected";

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${isApproved ? 'border-l-4 border-l-emerald-500' : isRejected ? 'border-l-4 border-l-destructive/50' : 'border-l-4 border-l-amber-500'}`}>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-base font-semibold leading-none">{reportee.name}</p>
            <Badge
              variant="secondary"
              className={`w-fit text-[10px] uppercase tracking-wider ${
                isApproved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isRejected
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {reportee.status}
            </Badge>
          </div>
          <div className="text-muted-foreground flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs bg-muted/30 p-2 rounded-md">
            <span className="flex items-center gap-1.5 min-w-0">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{reportee.email}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <Phone className="size-3.5 shrink-0" />
              <span className="truncate">{reportee.mobile}</span>
            </span>
          </div>
        </div>
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {!isApproved ? (
            <Button size="sm" className="flex-1 sm:flex-none shadow-sm" disabled={busy} onClick={onApprove}>
              Approve
            </Button>
          ) : null}
          {!isRejected ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none"
              disabled={busy}
              onClick={onReject}
            >
              {isApproved ? "Revoke" : "Reject"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
