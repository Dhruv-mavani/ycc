"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, CalendarDays, Mail, Phone, Search } from "lucide-react";
import type { CollegeRegistrationDetail } from "@/lib/admin-stats";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function CollegeRegistrationsList({
  registrations,
}: {
  registrations: CollegeRegistrationDetail[];
}) {
  const [query, setQuery] = useState("");

  const filteredRegistrations = registrations.filter((reg) => {
    if (!query.trim()) return true;
    
    const lowerQuery = query.toLowerCase();
    
    // Match team name
    if (reg.teamName && reg.teamName.toLowerCase().includes(lowerQuery)) return true;
    
    // Match captain details
    if (reg.captainName?.toLowerCase().includes(lowerQuery)) return true;
    if (reg.captainPhone.includes(lowerQuery)) return true;
    if (reg.captainEmail?.toLowerCase().includes(lowerQuery)) return true;
    
    // Match participant names, IDs, phone, email
    for (const p of reg.participants) {
      if (p.name.toLowerCase().includes(lowerQuery)) return true;
      if (p.uniqueId?.toLowerCase().includes(lowerQuery)) return true;
      if (p.phone?.includes(lowerQuery)) return true;
      if (p.email?.toLowerCase().includes(lowerQuery)) return true;
    }
    
    return false;
  });

  return (
    <div className="space-y-4">
      {registrations.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input
            placeholder="Search by team, participant name, ID, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border/50 shadow-sm"
          />
        </div>
      )}

      <div className="space-y-3">
        {filteredRegistrations.map((reg) => (
          <Card key={reg.registrationId}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-xl">{reg.teamName || "Individual Entry"}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{reg.eventName}</Badge>
                  <Badge>{formatRupees(reg.amountPaise)}</Badge>
                  <Button variant="outline" size="xs" nativeButton={false} render={
                    <a href={`/api/registrations/${reg.registrationId}/receipt?view=true`} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3 mr-1" /> Receipt
                    </a>
                  } />
                </div>
              </div>
              <CardDescription className="flex flex-col gap-1 mt-2">
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <CalendarDays className="size-3.5" />
                  {new Date(reg.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" /> {reg.captainPhone}
                  </span>
                  {reg.captainEmail ? (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3.5" /> {reg.captainEmail}
                    </span>
                  ) : null}
                </span>

              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {reg.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 text-sm last:border-b-0 last:pb-0 gap-2"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">{p.name}</span>
                      {p.isCaptain ? (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">Captain</Badge>
                      ) : null}
                      {p.uniqueId ? (
                        <Badge variant="outline" className="font-mono text-xs bg-muted/30">
                          {p.uniqueId}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">
                          No ID
                        </span>
                      )}
                      {p.age || p.gender ? (
                        <span className="text-muted-foreground text-xs">
                          {[p.age, p.gender ? p.gender[0].toUpperCase() + p.gender.slice(1) : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      ) : null}
                    </div>
                    {((p.phone || p.email) && !p.isCaptain) ? (
                      <div className="flex items-center gap-3 text-muted-foreground text-xs">
                        {p.phone && p.phone !== reg.captainPhone ? <span className="flex items-center gap-1"><Phone className="size-3" /> {p.phone}</span> : null}
                        {p.email && p.email !== reg.captainEmail ? <span className="flex items-center gap-1"><Mail className="size-3" /> {p.email}</span> : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={p.attendanceStatus === "present" ? "default" : "outline"} className={p.attendanceStatus === "present" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                      {p.attendanceStatus}
                    </Badge>
                    {p.attendanceStatus === "present" && (p.markedByName || p.markedAt) ? (
                      <div className="text-[10px] text-muted-foreground text-right mt-0.5 max-w-[120px] leading-tight">
                        {p.markedByName ? <span className="block font-medium truncate">by {p.markedByName}</span> : null}
                        {p.markedAt ? <span className="block opacity-80">{new Date(p.markedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        
        {filteredRegistrations.length === 0 && registrations.length > 0 ? (
          <div className="text-center py-8 bg-card rounded-lg border border-border/50 border-dashed">
            <p className="text-muted-foreground text-sm">
              No registrations match your search.
            </p>
          </div>
        ) : null}

        {registrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No confirmed registrations for this college.
          </p>
        ) : null}
      </div>
    </div>
  );
}
