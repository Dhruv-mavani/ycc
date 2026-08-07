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
  stream: string;
  semester: string;
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
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{reportee.name}</p>
            <Badge
              variant="secondary"
              className={
                reportee.status === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 capitalize"
                  : reportee.status === "rejected"
                    ? "bg-destructive/10 text-destructive border-destructive/20 capitalize"
                    : "capitalize"
              }
            >
              {reportee.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {reportee.stream}, Sem {reportee.semester}
          </p>
          <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <span className="flex items-center gap-1">
              <Mail className="size-3" /> {reportee.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="size-3" /> {reportee.mobile}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {reportee.status !== "approved" ? (
            <Button size="sm" className="h-7 text-xs" disabled={busy} onClick={onApprove}>
              Approve
            </Button>
          ) : null}
          {reportee.status !== "rejected" ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={busy}
              onClick={onReject}
            >
              {reportee.status === "approved" ? "Revoke" : "Reject"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
