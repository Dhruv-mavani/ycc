"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrScanner } from "@/components/staff/qr-scanner";
import {
  Search,
  ScanLine,
  Crown,
  CheckCircle2,
  Clock,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentLookupParticipant {
  name: string;
  uniqueId: string | null;
  isCaptain: boolean;
}

interface PaymentLookupResult {
  registrationId: string;
  type: "team" | "individual";
  teamName: string | null;
  captainName: string | null;
  collegeName: string;
  amountPaise: number;
  paid: boolean;
  participants: PaymentLookupParticipant[];
}

interface StaffEvent {
  id: string;
  name: string;
}

export function CollectPaymentsPanel({
  events = [],
}: {
  events?: StaffEvent[];
}) {
  const [eventId, setEventId] = useState<string>(events[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PaymentLookupResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  async function runSearch(q: string, evId: string = eventId) {
    if (!evId) return;
    setLoading(true);
    try {
      const url = new URL("/api/staff/payments/search", window.location.origin);
      url.searchParams.set("eventId", evId);
      if (q.trim()) url.searchParams.set("q", q.trim());

      const res = await fetch(url.toString());
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Search failed");
        return;
      }
      const data = await res.json();
      setResults(data.results);
      setSearched(true);
      if (data.results.length === 0) {
        toast.error("No matching registration found");
      }
    } catch {
      toast.error("Network error — please check your connection and try again");
    } finally {
      setLoading(false);
    }
  }

  function handleScan(text: string) {
    setScannerOpen(false);
    setQuery(text);
    runSearch(text);
  }

  async function togglePaid(registrationId: string, next: boolean) {
    // Optimistic update
    setResults((prev) =>
      prev.map((reg) =>
        reg.registrationId === registrationId ? { ...reg, paid: next } : reg,
      ),
    );

    try {
      const res = await fetch("/api/staff/payments/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, paid: next }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Could not update payment status — reverting");
        setResults((prev) =>
          prev.map((reg) =>
            reg.registrationId === registrationId ? { ...reg, paid: !next } : reg,
          ),
        );
      }
    } catch {
      toast.error("Network error — reverting");
      setResults((prev) =>
        prev.map((reg) =>
          reg.registrationId === registrationId ? { ...reg, paid: !next } : reg,
        ),
      );
    }
  }

  if (events.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-muted-foreground text-center text-sm bg-card p-4 rounded-xl border">
          No cash-collection events are currently active.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {events.length > 1 ? (
        <Select
          value={eventId}
          onValueChange={(val) => {
            const next = val ?? events[0]?.id ?? "";
            setEventId(next);
            runSearch(query, next);
          }}
        >
          <SelectTrigger className="w-full h-12 bg-background/50 text-base rounded-lg">
            <SelectValue placeholder="Select event">
              {events.find((e) => e.id === eventId)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <h2 className="text-center text-base font-semibold text-foreground">
          {events[0]?.name}
        </h2>
      )}

      {scannerOpen ? (
        <QrScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
          onError={(m) => toast.error(m)}
        />
      ) : (
        <div className="flex flex-col gap-3 bg-card p-4 rounded-xl shadow-sm border">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <Input
              placeholder="Unique ID, name, mobile, or team name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-base rounded-lg border-input bg-background/50 focus-visible:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(query);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => runSearch(query)}
              disabled={loading}
              className="h-12 px-4 sm:px-6 rounded-lg text-base font-semibold w-full shadow-sm shadow-primary/20 hover:shadow-md transition-shadow"
            >
              Search
            </Button>
            <Button
              variant="secondary"
              onClick={() => setScannerOpen(true)}
              className="h-12 px-4 sm:px-6 rounded-lg text-base font-semibold border border-border/50 hover:bg-secondary/80 w-full"
            >
              <ScanLine className="size-5 mr-1 sm:mr-2" />
              Scan
            </Button>
          </div>
        </div>
      )}

      {searched && results.length === 0 && !loading ? (
        <p className="text-muted-foreground text-center text-sm">
          No matching registration found.
        </p>
      ) : null}

      <div className="space-y-4">
        {results.map((reg) => (
          <Card
            key={reg.registrationId}
            className="overflow-hidden border-border/60 shadow-md p-0 gap-0"
          >
            <CardHeader className="bg-muted/40 border-b p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-xl">
                  {reg.teamName ?? reg.captainName ?? reg.participants[0]?.name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="w-fit bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 font-semibold"
                >
                  ₹{(reg.amountPaise / 100).toLocaleString("en-IN")}
                </Badge>
              </div>
              <CardDescription className="text-sm font-medium mt-1">
                {reg.collegeName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {reg.participants.map((p, idx) => (
                <div
                  key={`${reg.registrationId}-${idx}`}
                  className="flex items-center justify-between gap-4 p-4 border-b last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground break-words max-w-full">
                        {p.name}
                      </p>
                      {p.isCaptain ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-600 border-amber-200 px-1.5 py-0 whitespace-nowrap"
                        >
                          <Crown className="size-3 mr-1" /> Captain
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground font-mono text-sm mt-0.5">
                      {p.uniqueId}
                    </p>
                  </div>
                </div>
              ))}

              <div
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors",
                  reg.paid
                    ? "bg-emerald-50/50 dark:bg-emerald-950/10"
                    : "bg-amber-50/50 dark:bg-amber-950/10",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      reg.paid
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400",
                    )}
                  >
                    {reg.paid ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Clock className="size-5" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Wallet className="size-4 text-muted-foreground" />
                    Cash payment
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 bg-background rounded-lg border p-2 sm:p-0 sm:border-0 sm:bg-transparent">
                  <span
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wider",
                      reg.paid ? "text-emerald-600" : "text-amber-600",
                    )}
                  >
                    {reg.paid ? "Paid" : "Pending"}
                  </span>
                  <Switch
                    checked={reg.paid}
                    onCheckedChange={(checked) =>
                      togglePaid(reg.registrationId, checked)
                    }
                    className={
                      reg.paid ? "data-[state=checked]:bg-emerald-500" : ""
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
