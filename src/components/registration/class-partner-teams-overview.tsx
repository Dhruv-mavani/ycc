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
  stream: string;
  semester: string;
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
    <div className="space-y-2">
      <h4 className="text-xs font-semibold">{title}</h4>
      {members.length === 0 ? (
        <p className="text-muted-foreground text-xs">Empty</p>
      ) : (
        members.map((m) => (
          <div key={m.id} className="rounded-md border border-border/50 p-2">
            <p className="text-xs font-medium">{m.name}</p>
            <p className="text-muted-foreground text-[11px]">
              {m.stream}, Sem {m.semester}
            </p>
            <div className="text-muted-foreground flex flex-col gap-0.5 text-[11px]">
              <span className="flex items-center gap-1">
                <Mail className="size-3" /> {m.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="size-3" /> {m.mobile}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
