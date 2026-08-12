"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { PartnerTeam } from "@/lib/supabase/types";

interface Classmate {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: string;
  team: PartnerTeam | null;
  dues_paid: boolean;
}

export function TeamManagementPanel() {
  const [classmates, setClassmates] = useState<Classmate[] | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partner-program/reportees")
      .then((res) => res.json())
      .then((data) =>
        setClassmates(
          (data.reportees ?? []).filter((r: Classmate) => r.status === "approved"),
        ),
      )
      .catch(() => setClassmates([]));
  }, []);

  async function setTeam(id: string, team: PartnerTeam | null) {
    setMovingId(id);
    try {
      const res = await fetch(`/api/partner-program/reportees/${id}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team }),
      });
      if (!res.ok) {
        toast.error("Could not update team");
        return;
      }
      setClassmates((prev) =>
        (prev ?? []).map((c) => (c.id === id ? { ...c, team } : c)),
      );
    } finally {
      setMovingId(null);
    }
  }

  async function setDuesPaid(id: string, duesPaid: boolean) {
    // Optimistic — this is just the captain's own bookkeeping checklist,
    // not worth blocking the UI on a round trip.
    setClassmates((prev) =>
      (prev ?? []).map((c) => (c.id === id ? { ...c, dues_paid: duesPaid } : c)),
    );
    const res = await fetch(`/api/partner-program/reportees/${id}/dues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duesPaid }),
    });
    if (!res.ok) {
      toast.error("Could not update payment status");
      setClassmates((prev) =>
        (prev ?? []).map((c) => (c.id === id ? { ...c, dues_paid: !duesPaid } : c)),
      );
    }
  }

  if (classmates === null) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (classmates.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No approved Classmate Partners yet — approve some above before
        sorting them into teams.
      </p>
    );
  }

  const teamA = classmates.filter((c) => c.team === "A");
  const teamB = classmates.filter((c) => c.team === "B");
  const unassigned = classmates.filter((c) => !c.team);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <TeamColumn
        title="Unassigned"
        members={unassigned}
        movingId={movingId}
        onToggleDues={setDuesPaid}
        renderActions={(m) => (
          <>
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={movingId === m.id}
              onClick={() => setTeam(m.id, "A")}
            >
              Team A
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={movingId === m.id}
              onClick={() => setTeam(m.id, "B")}
            >
              Team B
            </Button>
          </>
        )}
      />
      <TeamColumn
        title={`Team A (${teamA.length})`}
        members={teamA}
        movingId={movingId}
        onToggleDues={setDuesPaid}
        renderActions={(m) => (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={movingId === m.id}
              onClick={() => setTeam(m.id, "B")}
            >
              Move to B
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={movingId === m.id}
              onClick={() => setTeam(m.id, null)}
            >
              Unassign
            </Button>
          </>
        )}
      />
      <TeamColumn
        title={`Team B (${teamB.length})`}
        members={teamB}
        movingId={movingId}
        onToggleDues={setDuesPaid}
        renderActions={(m) => (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={movingId === m.id}
              onClick={() => setTeam(m.id, "A")}
            >
              Move to A
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={movingId === m.id}
              onClick={() => setTeam(m.id, null)}
            >
              Unassign
            </Button>
          </>
        )}
      />
    </div>
  );
}

function TeamColumn({
  title,
  members,
  movingId,
  onToggleDues,
  renderActions,
}: {
  title: string;
  members: Classmate[];
  movingId: string | null;
  onToggleDues: (id: string, duesPaid: boolean) => void;
  renderActions: (member: Classmate) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl bg-muted/40 border border-border/50 overflow-hidden">
      <div className="bg-muted/80 px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="flex-1 p-3 sm:p-4 space-y-3 min-h-[150px]">
        {members.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-border/50 rounded-lg bg-background/50">
            <p className="text-muted-foreground text-xs font-medium">Empty</p>
          </div>
        ) : (
          members.map((m) => (
            <Card key={m.id} className="shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold leading-tight">{m.name}</p>
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
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                  <Label
                    htmlFor={`dues-${m.id}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Paid their share
                  </Label>
                  <Switch
                    id={`dues-${m.id}`}
                    size="sm"
                    checked={m.dues_paid}
                    onCheckedChange={(checked) => onToggleDues(m.id, checked)}
                  />
                </div>
                <div
                  className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50"
                  aria-busy={movingId === m.id}
                >
                  {renderActions(m)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
