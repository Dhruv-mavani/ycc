"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Search, CheckCircle2, Clock, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamLookupResult {
  registrationId: string;
  teamName: string | null;
  captainName: string | null;
  amountPaise: number;
  paid: boolean;
  pendingReview: boolean;
  rejected: boolean;
  rejectionReason: string | null;
}

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function PaymentLinkForm() {
  const [code, setCode] = useState("");
  const [looking, setLooking] = useState(false);
  const [team, setTeam] = useState<TeamLookupResult | null>(null);

  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLooking(true);
    setTeam(null);
    setJustSubmitted(false);
    try {
      const res = await fetch(
        `/api/box-cricket-payment/lookup?code=${encodeURIComponent(code.trim())}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "No team found for that code");
        return;
      }
      setTeam(data.result);
    } catch {
      toast.error("Network error — please check your connection and try again");
    } finally {
      setLooking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!team) return;
    if (!screenshot) {
      toast.error("Please attach your payment screenshot");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("registrationId", team.registrationId);
      formData.append("transactionId", transactionId.trim());
      formData.append("screenshot", screenshot);

      const res = await fetch("/api/box-cricket-payment/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not submit — please try again");
        return;
      }
      setJustSubmitted(true);
    } catch {
      toast.error("Network error — please check your connection and try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <Image
              src="/999-QR.png"
              alt="Scan to pay ₹999 via UPI"
              width={280}
              height={280}
              className="h-auto w-56 sm:w-64"
            />
          </div>
          <p className="text-center text-sm font-medium text-slate-600">
            Scan with any UPI app (Google Pay, PhonePe, Paytm...) to pay the{" "}
            <span className="font-bold text-slate-900">₹999 Team Entry Fee</span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Find your team</CardTitle>
          <CardDescription>
            Enter the Captain&apos;s (or any team member&apos;s) unique ID — it&apos;s
            on your ID card or invitation pass.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={lookup} className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CPG5016"
              className="flex-1"
            />
            <Button type="submit" disabled={looking}>
              {looking ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : (
                <Search className="size-4 shrink-0" />
              )}
              Find
            </Button>
          </form>
        </CardContent>
      </Card>

      {team ? (
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {team.teamName ?? team.captainName ?? "Your team"}
            </CardTitle>
            <CardDescription>
              Captain: {team.captainName ?? "—"} · Entry Fee: {formatRupees(team.amountPaise)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {team.paid ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="size-5 shrink-0" />
                <p className="text-sm font-semibold">
                  Already paid — you&apos;re all set for the tournament!
                </p>
              </div>
            ) : team.pendingReview && !justSubmitted ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <Clock className="size-5 shrink-0" />
                <p className="text-sm font-semibold">
                  Your payment is submitted and under review. We&apos;ll update
                  your status within 24 hours.
                </p>
              </div>
            ) : justSubmitted ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="size-5 shrink-0" />
                <p className="text-sm font-semibold">
                  Submitted! We&apos;ll verify your payment and update your
                  status within 24 hours.
                </p>
              </div>
            ) : (
              <>
                {team.rejected ? (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                    <AlertCircle className="size-5 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <span className="font-semibold">
                        Your previous submission couldn&apos;t be verified
                        {team.rejectionReason ? `: ${team.rejectionReason}` : "."}
                      </span>{" "}
                      Please double-check your payment and submit again below.
                    </p>
                  </div>
                ) : null}

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <span className="font-semibold">Important:</span> Your
                  screenshot must clearly show the{" "}
                  <span className="font-semibold">full transaction ID</span>.
                  Without it, we cannot verify your payment went through, and
                  your registration will not be confirmed as paid.
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Transaction ID</Label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="UPI transaction / reference number"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment screenshot</Label>
                    <label
                      className={cn(
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                        screenshot
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-300 bg-slate-50 hover:bg-slate-100",
                      )}
                    >
                      <Upload className="size-5 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {screenshot ? screenshot.name : "Add Screenshot"}
                      </span>
                      <span className="text-xs text-slate-500">
                        JPEG, PNG, or WebP — up to 4MB
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                        required
                      />
                    </label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 shrink-0 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit for verification"
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
