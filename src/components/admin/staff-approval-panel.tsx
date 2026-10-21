"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { StaffStatus } from "@/lib/supabase/types";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { ConfirmDialog } from "@/components/site/confirm-dialog";

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
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<StaffRow | null>(null);

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

  async function confirmDeleteStaff() {
    if (!deleteTarget) return;
    const userId = deleteTarget.user_id;
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/staff/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete staff record");
        return;
      }
      setRows((prev) => prev.filter((r) => r.user_id !== userId));
      toast.success("Staff record deleted");
      setDeleteTarget(null);
    } finally {
      setLoadingId(null);
    }
  }

  const filteredRows = rows.filter((r) => {
    if (!query.trim()) return true;
    const lowerQuery = query.toLowerCase();
    return (
      (r.name ?? "").toLowerCase().includes(lowerQuery) ||
      r.email.toLowerCase().includes(lowerQuery)
    );
  });

  const pending = filteredRows.filter((r) => r.status === "pending");
  const reviewed = filteredRows.filter((r) => r.status !== "pending");

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No staff sign-in requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-11 bg-card border-border/50 shadow-sm"
        />
      </div>

      {pending.length === 0 && reviewed.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No staff match your search.
        </p>
      ) : null}

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
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    disabled={loadingId === s.user_id}
                    onClick={() => setDeleteTarget(s)}
                    aria-label="Delete staff record"
                  >
                    <Trash2Icon className="size-3.5" />
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    disabled={loadingId === s.user_id}
                    onClick={() => setDeleteTarget(s)}
                    aria-label="Delete staff record"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete staff record?"
        description={`Permanently delete ${deleteTarget?.name ?? "this person"}'s staff record (${deleteTarget?.email ?? ""}). This cannot be undone.`}
        loading={loadingId === deleteTarget?.user_id}
        onConfirm={confirmDeleteStaff}
      />
    </div>
  );
}
