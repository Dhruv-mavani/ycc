"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { StaffStatus } from "@/lib/supabase/types";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

interface StaffRow {
  user_id: string;
  name: string | null;
  email: string;
  status: StaffStatus;
  requested_at: string;
}

export function StaffApprovalPanel({ staff }: { staff: StaffRow[] }) {
  const [rows, setRows] = useState(staff);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useAdminRealtime({
    onNewStaff: (row) => {
      setRows((prev) =>
        prev.some((r) => r.user_id === row.user_id) ? prev : [row, ...prev],
      );
    },
  });

  async function review(userId: string, status: "approved" | "rejected") {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/staff/${userId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error("Could not update staff status");
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.user_id === userId ? { ...r, status } : r)),
      );
      toast.success(status === "approved" ? "Staff approved" : "Staff rejected");
    } finally {
      setLoadingId(null);
    }
  }

  const pending = rows.filter((r) => r.status === "pending");
  const reviewed = rows.filter((r) => r.status !== "pending");

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No staff sign-in requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">
            Pending ({pending.length})
          </h2>
          {pending.map((s) => (
            <Card key={s.user_id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-medium">{s.name ?? "(no name)"}</p>
                  <p className="text-muted-foreground text-xs">{s.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={loadingId === s.user_id}
                    onClick={() => review(s.user_id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingId === s.user_id}
                    onClick={() => review(s.user_id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {reviewed.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">All staff</h2>
          {reviewed.map((s) => (
            <Card key={s.user_id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-medium">{s.name ?? "(no name)"}</p>
                  <p className="text-muted-foreground text-xs">{s.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={s.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200 capitalize" : "capitalize"}
                  >
                    {s.status}
                  </Badge>
                  {s.status === "approved" ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      disabled={loadingId === s.user_id}
                      onClick={() => review(s.user_id, "rejected")}
                    >
                      Revoke Access
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                      disabled={loadingId === s.user_id}
                      onClick={() => review(s.user_id, "approved")}
                    >
                      Approve Access
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
