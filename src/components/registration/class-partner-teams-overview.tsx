"use client";

import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PartnerTeam } from "@/lib/supabase/types";

interface Classmate {
  id: string;
  name: string;
  email: string;
  mobile: string;
  stream: string | null;
  semester: string | null;
  status: string;
  team: PartnerTeam | null;
}

interface ClassPartnerWithClassmates {
  id: string;
  name: string;
  status: string;
  classmates: Classmate[];
}

export function ClassPartnerTeamsOverview() {
  const [classPartners, setClassPartners] = useState<
    ClassPartnerWithClassmates[] | null
  >(null);

  useEffect(() => {
    fetch("/api/partner-program/class-teams")
      .then((res) => res.json())
      .then((data) => setClassPartners(data.classPartners ?? []))
      .catch(() => setClassPartners([]));
  }, []);

  if (classPartners === null) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (classPartners.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No Class Partners have named you as their referrer yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {classPartners.map((cp) => {
        const approved = cp.classmates.filter((c) => c.status === "approved");
        const teamA = approved.filter((c) => c.team === "A");
        const teamB = approved.filter((c) => c.team === "B");
        const unassigned = approved.filter((c) => !c.team);

        return (
          <Card key={cp.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {cp.name}
                <Badge variant="secondary" className="capitalize">
                  {cp.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cp.classmates.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No Classmate Partner applications yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <ClassmateList title={`Team A (${teamA.length})`} members={teamA} />
                  <ClassmateList title={`Team B (${teamB.length})`} members={teamB} />
                  <ClassmateList
                    title={`Unassigned (${unassigned.length})`}
                    members={unassigned}
                  />
                </div>
              )}
              {cp.classmates.some((c) => c.status !== "approved") ? (
                <p className="text-muted-foreground text-xs">
                  {cp.classmates.filter((c) => c.status === "pending").length}{" "}
                  pending, waiting on {cp.name}&apos;s review.
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ClassmateList({ title, members }: { title: string; members: Classmate[] }) {
  return (
    <div className="flex flex-col rounded-xl bg-muted/40 border border-border/50 overflow-hidden">
      <div className="bg-muted/80 px-4 py-3 border-b border-border/50">
        <h4 className="text-xs font-semibold tracking-tight">{title}</h4>
      </div>
      <div className="flex-1 p-3 sm:p-4 space-y-3 min-h-[150px]">
        {members.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-border/50 rounded-lg bg-background/50">
            <p className="text-muted-foreground text-xs font-medium">Empty</p>
          </div>
        ) : (
          members.map((m) => (
            <Card key={m.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold leading-tight">{m.name}</p>
                  {m.stream && m.semester ? (
                    <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                      {m.stream} • Sem {m.semester}
                    </p>
                  ) : null}
                </div>
                <div className="text-muted-foreground flex flex-col gap-1.5 text-xs bg-muted/30 p-2 rounded-md">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Mail className="size-3 shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Phone className="size-3 shrink-0" />
                    <span className="truncate">{m.mobile}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
