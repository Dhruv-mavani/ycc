"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  renderActions,
}: {
  title: string;
  members: Classmate[];
  movingId: string | null;
  renderActions: (member: Classmate) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {members.length === 0 ? (
        <p className="text-muted-foreground text-xs">Empty</p>
      ) : (
        members.map((m) => (
          <Card key={m.id}>
            <CardContent className="space-y-2 p-3">
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-muted-foreground text-xs">
                {m.stream}, Sem {m.semester}
              </p>
              <div className="text-muted-foreground flex flex-col gap-1 text-xs">
                <span className="flex items-center gap-1">
                  <Mail className="size-3" /> {m.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="size-3" /> {m.mobile}
                </span>
              </div>
              <div
                className="flex flex-wrap gap-2 pt-1"
                aria-busy={movingId === m.id}
              >
                {renderActions(m)}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
