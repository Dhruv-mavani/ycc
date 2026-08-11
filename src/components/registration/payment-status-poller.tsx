"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface StatusResponse {
  status: "pending_payment" | "confirmed" | "failed" | "cancelled";
  eventName: string;
  teamName: string | null;
  amountPaise: number;
  participants: { id: string; name: string; uniqueId: string | null }[];
}

export function PaymentStatusPoller({
  registrationId,
}: {
  registrationId: string;
}) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const hasTriggeredDownload = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function poll() {
      try {
        const res = await fetch(`/api/registrations/${registrationId}/status`);
        if (!res.ok) throw new Error("not found");
        const json: StatusResponse = await res.json();
        if (cancelled) return;
        setData(json);

        attempts += 1;
        if (json.status === "pending_payment" && attempts < 20) {
          timeoutId = setTimeout(poll, 3000);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [registrationId]);

  useEffect(() => {
    if (data?.status === "confirmed" && !hasTriggeredDownload.current) {
      hasTriggeredDownload.current = true;
      setDownloadStarted(true);
      window.location.href = `/api/registrations/${registrationId}/receipt`;
    }
  }, [data?.status, registrationId]);

  if (error) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        Couldn&apos;t load your registration. If you were charged, contact us
        with your registration ID:{" "}
        <span className="font-mono">{registrationId}</span>
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-muted-foreground text-center text-sm">Loading...</p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{data.eventName}</span>
          <StatusBadge status={data.status} />
        </CardTitle>
        <CardDescription>
          {data.teamName ?? "Individual registration"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.status === "pending_payment" && (
          <p className="text-muted-foreground text-sm">
            Confirming your payment... this usually takes a few seconds.
          </p>
        )}

        {data.status === "confirmed" && (
          <>
            {downloadStarted && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <strong>Please wait</strong> — your receipt is downloading
                now. Don&apos;t close this page until it finishes.
              </div>
            )}
            <p className="text-sm">
              Your registration is confirmed. Keep the unique ID(s) below
              safe — you&apos;ll need them at the venue.
            </p>
            <Separator />
            <div className="space-y-2">
              {data.participants.map((p) => (
                <div
                  key={p.uniqueId ?? p.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{p.name}</span>
                  <span className="font-mono font-semibold">
                    {p.uniqueId}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={
                  <a
                    href={`/api/registrations/${registrationId}/receipt`}
                    download
                  >
                    Download receipt again
                  </a>
                }
              />
              {!data.teamName && data.participants[0]?.uniqueId ? (
                <Button
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={
                    <a
                      href={`/api/participants/${data.participants[0].id}/id-card`}
                      download
                    >
                      Download ID card
                    </a>
                  }
                />
              ) : null}
              <p className="text-muted-foreground text-center text-xs">
                Lost your receipt later?{" "}
                <Link href="/receipt" className="underline">
                  Re-download it here
                </Link>{" "}
                using your unique ID or mobile number.
              </p>
            </div>
          </>
        )}

        {(data.status === "failed" || data.status === "cancelled") && (
          <p className="text-destructive text-sm">
            Payment was not completed. Please try registering again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: StatusResponse["status"] }) {
  if (status === "confirmed") return <Badge>Confirmed</Badge>;
  if (status === "pending_payment")
    return <Badge variant="secondary">Processing</Badge>;
  return <Badge variant="destructive">{status}</Badge>;
}
