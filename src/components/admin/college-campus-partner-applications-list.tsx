"use client";

import { useState } from "react";
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
import { Award, CalendarDays, Mail, Phone, PencilIcon, Search, Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "@/components/site/confirm-dialog";
import { EditCollegeCampusPartnerDialog } from "@/components/admin/edit-college-campus-partner-dialog";

interface CollegeCampusPartnerApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  age: number;
  gender: string;
  instagram_handle: string;
  stream: string;
  year: number;
  semester: number;
  code: string | null;
  agreed_to_terms: boolean;
  college_id: string;
  collegeName: string | null;
  created_at: string;
}

interface CollegeOption {
  id: string;
  name: string;
}

export function CollegeCampusPartnerApplicationsList({
  applications,
  colleges,
}: {
  applications: CollegeCampusPartnerApplication[];
  colleges: CollegeOption[];
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(applications);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CollegeCampusPartnerApplication | null>(null);
  const [editTarget, setEditTarget] = useState<CollegeCampusPartnerApplication | null>(null);

  async function confirmDeleteApplication() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/college-campus-partner/${id}`, { method: "DELETE" });
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
      app.mobile.includes(lowerQuery) ||
      (app.code ?? "").toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input
            placeholder="Search by name, email, mobile, or code..."
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
                <div className="flex flex-wrap items-center gap-2">
                  {app.code ? (
                    <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
                      {app.code}
                    </Badge>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    nativeButton={false}
                    aria-label="View certificate"
                    render={
                      <a
                        href={`/api/college-campus-partner/certificate/${app.id}/download?view=true`}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    <Award className="size-3.5" />
                  </Button>
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
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:divide-x sm:divide-border">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    College
                  </p>
                  <p className="font-medium">{app.collegeName ?? "—"}</p>
                </div>
                <div className="sm:pl-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Stream
                  </p>
                  <p className="font-medium">{app.stream}</p>
                </div>
                <div className="sm:pl-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Year / Semester
                  </p>
                  <p className="font-medium">{app.year} / Sem {app.semester}</p>
                </div>
                <div className="sm:pl-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Age / Gender
                  </p>
                  <p className="font-medium capitalize">{app.age} · {app.gender}</p>
                </div>
                <div className="sm:pl-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Instagram
                  </p>
                  <p className="font-medium">@{app.instagram_handle}</p>
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
            No College Campus Partner applications yet.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete application?"
        description={`Permanently delete ${deleteTarget?.name ?? "this"}'s College Campus Partner application. This cannot be undone.`}
        loading={deletingId === deleteTarget?.id}
        onConfirm={confirmDeleteApplication}
      />

      <EditCollegeCampusPartnerDialog
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
