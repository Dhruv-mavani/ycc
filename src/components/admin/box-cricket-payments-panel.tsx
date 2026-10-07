"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ZoomIn,
  Upload,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  registrationId: string;
  teamName: string | null;
  captainName: string | null;
  amountPaise: number;
  transactionId: string;
  upiNote: string;
  status: "pending" | "verified" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

interface BankStatement {
  id: string;
  fileName: string;
  uploadedAt: string;
}

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

const TABS: { value: Submission["status"]; label: string }[] = [
  { value: "pending", label: "Pending review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export function BoxCricketPaymentsPanel({
  initialSubmissions,
  initialStatements,
}: {
  initialSubmissions: Submission[];
  initialStatements: BankStatement[];
}) {
  const [tab, setTab] = useState<Submission["status"]>("pending");
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [loading, setLoading] = useState(false);
  const [zoomSubmissionId, setZoomSubmissionId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [statements, setStatements] = useState<BankStatement[]>(initialStatements);
  const [uploadingStatement, setUploadingStatement] = useState(false);

  const loadSubmissions = useCallback(async (status: Submission["status"]) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/box-cricket-payments?status=${status}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not load submissions");
        return;
      }
      setSubmissions(data.results ?? []);
    } catch {
      toast.error("Network error — please check your connection and try again");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStatements = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bank-statements");
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStatements(data.results ?? []);
    } catch {
      // Non-critical — the statements list is a convenience, not blocking.
    }
  }, []);

  // Tab switches fetch directly from the click handler (not a useEffect
  // keyed on `tab`) — `pending` already has its data from the server-
  // rendered initial load, so only switching away from it needs a fetch.
  function handleTabChange(next: Submission["status"]) {
    setTab(next);
    loadSubmissions(next);
  }

  async function handleVerify(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/box-cricket-payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not verify payment");
        return;
      }
      toast.success("Marked as paid");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Network error — please check your connection and try again");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/box-cricket-payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id, reason: rejectReason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not reject submission");
        return;
      }
      toast.success("Rejected — captain can resubmit");
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch {
      toast.error("Network error — please check your connection and try again");
    } finally {
      setBusyId(null);
    }
  }

  async function handleStatementUpload(file: File) {
    setUploadingStatement(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/bank-statements/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload file");
        return;
      }
      toast.success("Uploaded");
      loadStatements();
    } catch {
      toast.error("Network error — please check your connection and try again");
    } finally {
      setUploadingStatement(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => handleTabChange(t.value)}
            className={cn(
              "px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors",
              tab === t.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm py-12">
          No {tab} submissions.
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-lg">
                    {s.teamName ?? s.captainName ?? "—"}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {formatRupees(s.amountPaise)}
                  </Badge>
                </div>
                <CardDescription>
                  Captain: {s.captainName ?? "—"} · Submitted {formatDate(s.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Transaction ID
                    </p>
                    <p className="font-mono font-medium break-all">{s.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      UPI note
                    </p>
                    <p className="font-medium break-words">{s.upiNote}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setZoomSubmissionId(s.id)}
                  className="group relative block w-full max-w-xs overflow-hidden rounded-xl border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-only, auth-gated route, not a next/image-eligible static asset */}
                  <img
                    src={`/api/admin/box-cricket-payments/screenshot/${s.id}`}
                    alt="Payment screenshot"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <ZoomIn className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>

                {s.status === "pending" ? (
                  rejectingId === s.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Why couldn't this be verified? (shown to the captain)"
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={busyId === s.id}
                          onClick={() => handleReject(s.id)}
                        >
                          {busyId === s.id ? (
                            <Loader2 className="size-4 shrink-0 animate-spin" />
                          ) : (
                            <XCircle className="size-4 shrink-0" />
                          )}
                          Confirm reject
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={busyId === s.id}
                        onClick={() => handleVerify(s.id)}
                      >
                        {busyId === s.id ? (
                          <Loader2 className="size-4 shrink-0 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4 shrink-0" />
                        )}
                        Verify &amp; mark paid
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setRejectingId(s.id)}
                      >
                        <XCircle className="size-4 shrink-0" />
                        Reject
                      </Button>
                    </div>
                  )
                ) : s.status === "verified" ? (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                    <CheckCircle2 className="size-4 shrink-0" /> Verified
                    {s.reviewedAt ? ` · ${formatDate(s.reviewedAt)}` : ""}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <XCircle className="size-4 shrink-0" />
                    <span className="font-semibold">
                      Rejected{s.reviewedAt ? ` · ${formatDate(s.reviewedAt)}` : ""}
                    </span>
                    {s.rejectionReason ? (
                      <span className="text-muted-foreground">
                        — {s.rejectionReason}
                      </span>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!zoomSubmissionId}
        onOpenChange={(open) => !open && setZoomSubmissionId(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment screenshot</DialogTitle>
          </DialogHeader>
          {zoomSubmissionId ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-only, auth-gated route
            <img
              src={`/api/admin/box-cricket-payments/screenshot/${zoomSubmissionId}`}
              alt="Payment screenshot, full size"
              className="w-full h-auto rounded-lg"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" /> Bank statements
          </CardTitle>
          <CardDescription>
            Upload statements here for your own reference while cross-checking
            submissions above — not auto-matched, just a central place
            instead of WhatsApp/email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-sm font-medium transition-colors",
              uploadingStatement
                ? "border-slate-200 bg-slate-50 text-slate-400"
                : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100",
            )}
          >
            {uploadingStatement ? (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : (
              <Upload className="size-4 shrink-0" />
            )}
            {uploadingStatement ? "Uploading..." : "Upload statement (PDF, CSV, JPEG, PNG)"}
            <input
              type="file"
              accept="application/pdf,text/csv,image/jpeg,image/png"
              className="hidden"
              disabled={uploadingStatement}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleStatementUpload(file);
                e.target.value = "";
              }}
            />
          </label>

          {statements.length > 0 ? (
            <ul className="space-y-1.5">
              {statements.map((st) => (
                <li key={st.id} className="flex items-center justify-between gap-2 text-sm">
                  <a
                    href={`/api/admin/bank-statements/${st.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-2 truncate"
                  >
                    {st.fileName}
                  </a>
                  <span className="text-muted-foreground text-xs shrink-0 flex items-center gap-1">
                    <Clock className="size-3" /> {formatDate(st.uploadedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs text-center py-2">
              No statements uploaded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
