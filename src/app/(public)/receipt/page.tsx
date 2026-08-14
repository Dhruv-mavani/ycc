"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { BackButton } from "@/components/site/back-button";
import { downloadFileOrThrow } from "@/lib/download-file";

export default function ReceiptLookupPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/receipts/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Could not find that registration");
        return;
      }

      const data = await res.json();
      await downloadFileOrThrow(
        `/api/registrations/${data.registrationId}/receipt`,
        `YCC-Receipt-${data.registrationId}.pdf`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Network error — please check your connection and try again",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen pb-20 flex flex-col pt-10">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

      <div className="relative mx-auto w-full max-w-md px-4 flex-1 flex flex-col justify-center z-10">
        <BackButton className="mb-6 self-start" />
        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 px-6 sm:px-10 pt-8">
            <CardTitle className="text-2xl font-bold text-slate-800">Re-download your receipt</CardTitle>
            <CardDescription className="text-base mt-2 text-slate-600">
              Enter your unique ID (e.g. CKG1001) or the mobile number you
              registered with.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-10 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label>Unique ID or mobile number</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="CKG1001 or 9876543210"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={loading}>
              {loading ? "Looking up..." : "Download receipt"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}
