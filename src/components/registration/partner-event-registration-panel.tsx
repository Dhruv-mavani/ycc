"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RazorpayCheckoutButton } from "@/components/registration/razorpay-checkout-button";

const EVENT_NAME = "Ycc Partners Box Cricket Championship 2026";

interface TeamStatus {
  memberCount: number;
  registrationId: string | null;
  status: "pending_payment" | "confirmed" | "failed" | "cancelled" | null;
  amountPaise: number | null;
  participants: { id: string; name: string; uniqueId: string | null }[];
}

interface StatusResponse {
  requiredTeammates: number;
  teams: { A: TeamStatus; B: TeamStatus };
}

export function PartnerEventRegistrationPanel({
  captainName,
  captainPhone,
}: {
  captainName: string;
  captainPhone?: string;
}) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [registering, setRegistering] = useState<"A" | "B" | null>(null);

  function reload() {
    fetch("/api/partner-program/team-registration")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }

  useEffect(() => {
    reload();
  }, []);

  async function register(team: "A" | "B") {
    setRegistering(team);
    try {
      const res = await fetch("/api/partner-program/team-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body.error ?? "Could not register team");
        return;
      }
      toast.success(`Team ${team} registered — pay to confirm your entry`);
      reload();
    } finally {
      setRegistering(null);
    }
  }

  if (!data) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {(["A", "B"] as const).map((team) => (
        <TeamRegistrationCard
          key={team}
          team={team}
          status={data.teams[team]}
          required={data.requiredTeammates}
          busy={registering === team}
          onRegister={() => register(team)}
          captainName={captainName}
          captainPhone={captainPhone}
        />
      ))}
    </div>
  );
}

function TeamRegistrationCard({
  team,
  status,
  required,
  busy,
  onRegister,
  captainName,
  captainPhone,
}: {
  team: "A" | "B";
  status: TeamStatus;
  required: number;
  busy: boolean;
  onRegister: () => void;
  captainName: string;
  captainPhone?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team {team}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {status.status === "confirmed" ? (
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="size-4" />
              Registered &amp; paid
            </p>
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={
                <a href={`/api/registrations/${status.registrationId}/receipt`}>
                  <Download className="size-4" />
                  Download receipt
                </a>
              }
            />
            <div className="space-y-1.5 border-t pt-3">
              <p className="text-muted-foreground text-xs font-medium">
                Player ID cards
              </p>
              {status.participants.map((p) =>
                p.uniqueId ? (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate">{p.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                      nativeButton={false}
                      render={
                        <a href={`/api/participants/${p.id}/id-card`}>
                          <Download className="size-3.5" />
                          ID card
                        </a>
                      }
                    />
                  </div>
                ) : (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate">{p.name}</span>
                    <Button size="sm" variant="ghost" className="shrink-0" disabled>
                      <Download className="size-3.5" />
                      ID card
                    </Button>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : status.registrationId ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
              Registered — payment pending
              {status.amountPaise != null
                ? ` (₹${(status.amountPaise / 100).toLocaleString("en-IN")})`
                : ""}
              .
            </p>
            <RazorpayCheckoutButton
              registrationId={status.registrationId}
              eventName={EVENT_NAME}
              prefillName={captainName}
              prefillPhone={captainPhone}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
              {status.memberCount} of {required} approved Classmate Partners
              sorted into Team {team}
              {status.memberCount < required
                ? ` — need ${required - status.memberCount} more before you can register`
                : " — ready to register"}
              .
            </p>
            <Button
              className="w-full"
              disabled={status.memberCount !== required || busy}
              onClick={onRegister}
            >
              {busy ? "Registering…" : `Register Team ${team} — ₹3000`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
