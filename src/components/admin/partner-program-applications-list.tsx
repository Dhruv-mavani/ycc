"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, Mail, Phone, PencilIcon, Search, Trash2Icon } from "lucide-react";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { ConfirmDialog } from "@/components/site/confirm-dialog";
import { EditPartnerProgramDialog } from "@/components/admin/edit-partner-program-dialog";
import type { PartnerApplicationStatus, PartnerType } from "@/lib/supabase/types";

interface PartnerProgramApplication {
  id: string;
  name: string;
  email: string;
  college_id: string | null;
  collegeName: string;
  stream: string | null;
  semester: string | null;
  mobile: string;
  instagram_handle: string;
  referred_by: string | null;
  agreed_to_terms: boolean;
  partner_type: PartnerType;
  status: PartnerApplicationStatus;
  referred_by_id: string | null;
  referredByName: string | null;
  created_at: string;
}

export function PartnerProgramApplicationsList({
  applications,
  activeType,
  colleges,
}: {
  applications: PartnerProgramApplication[];
  activeType: PartnerType;
  colleges: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(applications);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartnerProgramApplication | null>(null);
  const [editTarget, setEditTarget] = useState<PartnerProgramApplication | null>(null);

  useEffect(() => {
    localStorage.setItem("lastSeenPartnerProgramAt", new Date().toISOString());
  }, []);

  useAdminRealtime({
    onNewPartnerApplication: (row) => {
      if (row.partner_type !== activeType) return;
      setItems((prev) => {
        if (prev.some((a) => a.id === row.id)) return prev;
        const collegeName =
          colleges.find((c) => c.id === row.college_id)?.name ?? "Unknown college";
        return [{ ...row, collegeName, referredByName: null }, ...prev];
      });
    },
  });

  async function review(id: string, status: "approved" | "rejected") {
    setReviewingId(id);
    try {
      const res = await fetch(`/api/admin/partner-program/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error("Could not update application status");
        return;
      }
      setItems((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      toast.success(status === "approved" ? "Application approved" : "Application rejected");
    } finally {
      setReviewingId(null);
    }
  }

  async function confirmDeleteApplication() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/partner-program/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete application");
        return;
      }
      setItems((prev) => prev.filter((a) => a.id !== id));
      toast.success("Application deleted");
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredApplications = items.filter((app) => {
    if (!query.trim()) return true;

    const lowerQuery = query.toLowerCase();
    return (
      app.name.toLowerCase().includes(lowerQuery) ||
      app.email.toLowerCase().includes(lowerQuery) ||
      app.mobile.includes(lowerQuery)
    );
  });

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input
            placeholder="Search by name, email, or mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border/50 shadow-sm"
          />
        </div>
      )}

      <div className="space-y-3">
        {filteredApplications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-xl">{app.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{app.collegeName}</Badge>
                  <Badge
                    variant="secondary"
                    className={
                      app.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 capitalize"
                        : app.status === "rejected"
                          ? "bg-destructive/10 text-destructive border-destructive/20 capitalize"
                          : "capitalize"
                    }
                  >
                    {app.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditTarget(app)}
                    aria-label="Edit application"
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    disabled={deletingId === app.id}
                    onClick={() => setDeleteTarget(app)}
                    aria-label="Delete application"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex flex-col gap-1 mt-2">
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <CalendarDays className="size-3.5" />
                  {new Date(app.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" /> {app.mobile}
                  </span>
                  <span className="hidden sm:inline mx-1">•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" /> {app.email}
                  </span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Stream
                  </p>
                  <p className="font-medium">{app.stream ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Semester
                  </p>
                  <p className="font-medium">{app.semester ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Instagram
                  </p>
                  <p className="font-medium">@{app.instagram_handle}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Referred by
                  </p>
                  <p className="font-medium">
                    {app.referredByName ?? app.referred_by ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge
                  variant="outline"
                  className={
                    app.agreed_to_terms
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }
                >
                  {app.agreed_to_terms ? "Agreed to T&C" : "Did not agree to T&C"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {app.status !== "approved" ? (
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    disabled={reviewingId === app.id}
                    onClick={() => review(app.id, "approved")}
                  >
                    Approve
                  </Button>
                ) : null}
                {app.status !== "rejected" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={reviewingId === app.id}
                    onClick={() => review(app.id, "rejected")}
                  >
                    {app.status === "approved" ? "Revoke approval" : "Reject"}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredApplications.length === 0 && items.length > 0 ? (
          <div className="text-center py-8 bg-card rounded-lg border border-border/50 border-dashed">
            <p className="text-muted-foreground text-sm">
              No applications match your search.
            </p>
          </div>
        ) : null}

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No partner program applications yet.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete application?"
        description={`Permanently delete ${deleteTarget?.name ?? "this"}'s partner program application. This cannot be undone.`}
        loading={deletingId === deleteTarget?.id}
        onConfirm={confirmDeleteApplication}
      />

      <EditPartnerProgramDialog
        application={editTarget}
        colleges={colleges}
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onSaved={(updated) => {
          setItems((prev) =>
            prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
          );
        }}
      />
    </div>
  );
}
