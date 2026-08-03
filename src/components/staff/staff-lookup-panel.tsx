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
import { Search, ScanLine, UserCheck, UserX, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LookupParticipant {
  id: string;
  name: string;
  uniqueId: string | null;
  isCaptain: boolean;
  attendanceStatus: "present" | "absent";
}

interface LookupRegistration {
  registrationId: string;
  type: "team" | "individual";
  eventName: string;
  collegeName: string;
  teamName: string | null;
  participants: LookupParticipant[];
}

export function StaffLookupPanel({
  colleges = [],
}: {
  colleges?: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [collegeId, setCollegeId] = useState<string>("all");
  const [results, setResults] = useState<LookupRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  async function runSearch(q: string, cId: string = collegeId) {
    setLoading(true);
    try {
      const url = new URL("/api/lookup", window.location.origin);
      if (q.trim()) url.searchParams.set("q", q.trim());
      if (cId && cId !== "all") url.searchParams.set("collegeId", cId);

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

  async function toggleAttendance(participantId: string, next: boolean) {
    const status = next ? "present" : "absent";

    // Optimistic update
    setResults((prev) =>
      prev.map((reg) => ({
        ...reg,
        participants: reg.participants.map((p) =>
          p.id === participantId ? { ...p, attendanceStatus: status } : p,
        ),
      })),
    );

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, status }),
    });

    if (!res.ok) {
      toast.error("Could not update attendance — reverting");
      setResults((prev) =>
        prev.map((reg) => ({
          ...reg,
          participants: reg.participants.map((p) =>
            p.id === participantId
              ? { ...p, attendanceStatus: next ? "absent" : "present" }
              : p,
          ),
        })),
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
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
              placeholder="Name, college code, or unique ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-base rounded-lg border-input bg-background/50 focus-visible:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(query);
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {colleges.length > 0 && (
              <div className="flex-1">
                <Select
                  value={collegeId}
                  onValueChange={(val) => {
                    const next = val ?? "all";
                    setCollegeId(next);
                    runSearch(query, next);
                  }}
                >
                  <SelectTrigger className="w-full h-12 bg-background/50 text-base rounded-lg">
                    <SelectValue placeholder="Filter by college">
                      {collegeId === "all" 
                        ? "All Colleges" 
                        : colleges.find((c) => c.id === collegeId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 shrink-0 sm:ml-auto w-full sm:w-auto">
              <Button onClick={() => runSearch(query)} disabled={loading} className="h-12 px-4 sm:px-6 rounded-lg text-base font-semibold w-full sm:w-auto shadow-sm shadow-primary/20 hover:shadow-md transition-shadow">
                Search
              </Button>
              <Button variant="secondary" onClick={() => setScannerOpen(true)} className="h-12 px-4 sm:px-6 rounded-lg text-base font-semibold border border-border/50 hover:bg-secondary/80 w-full sm:w-auto">
                <ScanLine className="size-5 mr-1 sm:mr-2" />
                Scan
              </Button>
            </div>
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
          <Card key={reg.registrationId} className="overflow-hidden border-border/60 shadow-md p-0 gap-0">
            <CardHeader className="bg-muted/40 border-b p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-xl">{reg.teamName ?? reg.participants[0]?.name}</CardTitle>
                <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">{reg.eventName}</Badge>
              </div>
              <CardDescription className="text-sm font-medium mt-1">{reg.collegeName}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {reg.participants.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b last:border-b-0 transition-colors",
                    p.attendanceStatus === "present" ? "bg-emerald-50/50 dark:bg-emerald-950/10" : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-full mt-1",
                      p.attendanceStatus === "present" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                    )}>
                      {p.attendanceStatus === "present" ? <UserCheck className="size-5" /> : <UserX className="size-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-foreground break-words max-w-full">
                          {p.name}
                        </p>
                        {p.isCaptain ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 px-1.5 py-0 whitespace-nowrap">
                            <Crown className="size-3 mr-1" /> Captain
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground font-mono text-sm mt-0.5">
                        {p.uniqueId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 bg-background rounded-lg border p-2 sm:p-0 sm:border-0 sm:bg-transparent">
                    <span className={cn(
                      "text-sm font-semibold uppercase tracking-wider",
                      p.attendanceStatus === "present" ? "text-emerald-600" : "text-muted-foreground"
                    )}>
                      {p.attendanceStatus === "present" ? "Present" : "Absent"}
                    </span>
                    <Switch
                      checked={p.attendanceStatus === "present"}
                      onCheckedChange={(checked) =>
                        toggleAttendance(p.id, checked)
                      }
                      className={p.attendanceStatus === "present" ? "data-[state=checked]:bg-emerald-500" : ""}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
