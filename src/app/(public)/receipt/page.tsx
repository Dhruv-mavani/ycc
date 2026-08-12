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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <BackButton className="mb-4 self-start" />
      <Card>
        <CardHeader>
          <CardTitle>Re-download your receipt</CardTitle>
          <CardDescription>
            Enter your unique ID (e.g. CKG1001) or the mobile number you
            registered with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Unique ID or mobile number</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="CKG1001 or 9876543210"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Looking up..." : "Download receipt"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
