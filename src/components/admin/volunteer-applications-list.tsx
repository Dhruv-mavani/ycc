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
import { EditVolunteerDialog } from "@/components/admin/edit-volunteer-dialog";

interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  college_id: string;
  collegeName: string;
  stream: string;
  semester: string;
  mobile: string;
  instagram_handle: string;
  referred_by: string | null;
  agreement_q1: string;
  agreement_q2: string;
  agreement_q3: string;
  created_at: string;
}

export function VolunteerApplicationsList({
  applications,
  colleges,
}: {
  applications: VolunteerApplication[];
  colleges: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(applications);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VolunteerApplication | null>(null);
  const [editTarget, setEditTarget] = useState<VolunteerApplication | null>(null);

  useEffect(() => {
    localStorage.setItem("lastSeenVolunteersAt", new Date().toISOString());
  }, []);

  useAdminRealtime({
    onNewVolunteer: (row) => {
      setItems((prev) => {
        if (prev.some((a) => a.id === row.id)) return prev;
        const collegeName =
          colleges.find((c) => c.id === row.college_id)?.name ?? "Unknown college";
        return [{ ...row, collegeName }, ...prev];
      });
    },
  });

  async function confirmDeleteApplication() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, { method: "DELETE" });
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
                  <p className="font-medium">{app.stream}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Semester
                  </p>
                  <p className="font-medium">{app.semester}</p>
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
                  <p className="font-medium">{app.referred_by || "—"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline">Q1: {app.agreement_q1}</Badge>
                <Badge variant="outline">Q2: {app.agreement_q2}</Badge>
                <Badge variant="outline">Q3: {app.agreement_q3}</Badge>
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
            No volunteer applications yet.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete application?"
        description={`Permanently delete ${deleteTarget?.name ?? "this"}'s volunteer application. This cannot be undone.`}
        loading={deletingId === deleteTarget?.id}
        onConfirm={confirmDeleteApplication}
      />

      <EditVolunteerDialog
        application={editTarget}
        colleges={colleges}
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onSaved={(updated) => {
          setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        }}
      />
    </div>
  );
}
