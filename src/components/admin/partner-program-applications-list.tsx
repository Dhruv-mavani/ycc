"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Award, CalendarDays, Mail, Phone, PencilIcon, Search, Trash2Icon, Users } from "lucide-react";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { ConfirmDialog } from "@/components/site/confirm-dialog";
import { EditPartnerProgramDialog } from "@/components/admin/edit-partner-program-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { PartnerApplicationStatus, PartnerType } from "@/lib/supabase/types";

interface PartnerProgramApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  age: number | null;
  gender: string | null;
  instagram_handle: string;
  referred_by: string | null;
  agreed_to_terms: boolean;
  partner_type: PartnerType;
  status: PartnerApplicationStatus;
  referred_by_id: string | null;
  referredByName: string | null;
  college_id: string | null;
  collegeName: string | null;
  created_at: string;
}

interface ChildGroup {
  /** Singular label, e.g. "Co-Partner" or "Squad Member" — pluralized with a trailing "s". */
  label: string;
  map: Map<string, PartnerProgramApplication[]>;
}

interface CollegeOption {
  id: string;
  name: string;
}

export function PartnerProgramApplicationsList({
  applications,
  activeType,
  childGroups = [],
  colleges,
}: {
  applications: PartnerProgramApplication[];
  activeType: PartnerType;
  childGroups?: ChildGroup[];
  colleges: CollegeOption[];
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(applications);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartnerProgramApplication | null>(null);
  const [editTarget, setEditTarget] = useState<PartnerProgramApplication | null>(null);
  const [childrenDialog, setChildrenDialog] = useState<{
    app: PartnerProgramApplication;
    group: ChildGroup;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("lastSeenPartnerProgramAt", new Date().toISOString());
  }, []);

  useAdminRealtime({
    onNewPartnerApplication: (row) => {
      if (row.partner_type !== activeType) return;
      setItems((prev) => {
        if (prev.some((a) => a.id === row.id)) return prev;
        return [
          {
            ...row,
            referredByName: null,
            collegeName: colleges.find((c) => c.id === row.college_id)?.name ?? null,
          },
          ...prev,
        ];
      });
    },
  });

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
                <CardTitle className="text-xl">
                  <Link href={`/admin/partners/${app.id}`} className="hover:underline">
                    {app.name}
                  </Link>
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {childGroups.map((group) => {
                    const count = (group.map.get(app.id) ?? []).length;
                    return (
                      <Badge
                        key={group.label}
                        variant="outline"
                        className="cursor-pointer bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                        onClick={() => setChildrenDialog({ app, group })}
                      >
                        <Users className="size-3 mr-1" />
                        {count} {group.label}
                        {count === 1 ? "" : "s"}
                      </Badge>
                    );
                  })}
                  {app.partner_type !== "classmate" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
                      nativeButton={false}
                      aria-label="View certificate"
                      render={
                        <a
                          href={`/api/partner-program/certificate/${app.id}/download?view=true`}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                    >
                      <Award className="size-3.5" />
                    </Button>
                  ) : null}
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
                    timeZone: "Asia/Kolkata",
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
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:divide-x sm:divide-border">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Age
                  </p>
                  <p className="font-medium">{app.age ?? "—"}</p>
                </div>
                <div className="sm:pl-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Gender
                  </p>
                  <p className="font-medium capitalize">{app.gender ?? "—"}</p>
                </div>
                <div className="sm:pl-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    College
                  </p>
                  <p className="font-medium">{app.collegeName ?? "—"}</p>
                </div>
                <div className="sm:pl-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Instagram
                  </p>
                  <p className="font-medium">@{app.instagram_handle}</p>
                </div>
                <div className="sm:pl-4">
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
            prev.map((a) =>
              a.id === updated.id
                ? {
                    ...a,
                    ...updated,
                    collegeName: colleges.find((c) => c.id === updated.college_id)?.name ?? null,
                  }
                : a,
            ),
          );
        }}
      />

      <Dialog
        open={childrenDialog !== null}
        onOpenChange={(open) => {
          if (!open) setChildrenDialog(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {childrenDialog ? (
            <>
              {(() => {
                const list = childrenDialog.group.map.get(childrenDialog.app.id) ?? [];
                const label = childrenDialog.group.label;
                return (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        {childrenDialog.app.name}&apos;s {label}s
                      </DialogTitle>
                      <DialogDescription>
                        {list.length} {label}
                        {list.length === 1 ? "" : "s"} brought in so far.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      {list.map((cp) => (
                        <div
                          key={cp.id}
                          className="flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                          <div className="min-w-0">
                            <Link
                              href={`/admin/partners/${cp.id}`}
                              className="font-medium text-sm text-primary hover:underline truncate block"
                            >
                              {cp.name}
                            </Link>
                            <p className="text-muted-foreground text-xs truncate">
                              {cp.mobile}
                            </p>
                          </div>
                        </div>
                      ))}
                      {list.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          No {label}s yet.
                        </p>
                      ) : null}
                    </div>
                  </>
                );
              })()}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
