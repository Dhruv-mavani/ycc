"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function RazorpayKillSwitch({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  async function confirmToggle() {
    if (pendingValue === null) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: pendingValue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not update setting");
        return;
      }
      setEnabled(pendingValue);
      toast.success(
        pendingValue
          ? "Razorpay is now live for new registrations"
          : "Razorpay is off — new registrations will fall back to cash",
      );
      setPendingValue(null);
    } catch {
      toast.error("Network error — please check your connection and try again");
    } finally {
      setSaving(false);
    }
  }

  const turningOn = pendingValue === true;

  return (
    <>
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <CreditCard className="size-5 text-indigo-600" />
              <CardTitle className="text-base">Razorpay online payments</CardTitle>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => setPendingValue(checked)}
              disabled={saving}
            />
          </div>
          <CardDescription>
            {enabled ? (
              <span className="font-semibold text-emerald-700">
                LIVE — new paid registrations go through Razorpay checkout.
              </span>
            ) : (
              <span className="font-semibold text-amber-700">
                OFF — new paid registrations skip online payment and confirm
                immediately as pay-at-venue (cash).
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Dialog
        open={pendingValue !== null}
        onOpenChange={(open) => !open && setPendingValue(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <AlertTriangle
                className={turningOn ? "size-5 text-emerald-600" : "size-5 text-amber-600"}
              />
              <DialogTitle>
                {turningOn ? "Turn Razorpay ON?" : "Turn Razorpay OFF?"}
              </DialogTitle>
            </div>
            <DialogDescription>
              This takes effect immediately for every new paid registration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-left text-sm text-foreground/90">
            {turningOn ? (
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Captains will be charged{" "}
                  <span className="font-semibold">real money</span> through
                  Razorpay&apos;s live checkout — these are live-mode keys,
                  not a sandbox.
                </li>
                <li>
                  Make sure you&apos;ve actually tested a full payment and
                  confirmed the webhook is correctly configured in the
                  Razorpay dashboard before enabling this. An untested
                  webhook means a captain could pay and never get confirmed.
                </li>
                <li>
                  Registrations already in progress (started before you flip
                  this) are unaffected either way — only new ones see the
                  change.
                </li>
              </ul>
            ) : (
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  No online payment will be attempted — every new paid
                  registration confirms{" "}
                  <span className="font-semibold">instantly</span>, with the
                  entry fee owed in cash at the venue instead (same as a
                  pay_at_venue event).
                </li>
                <li>
                  Use this if Razorpay is down or misbehaving and you need
                  registrations to keep working right now.
                </li>
                <li>
                  Any Razorpay checkout already open in someone&apos;s
                  browser still works — their webhook will still confirm it
                  normally. This only changes what happens for{" "}
                  <span className="font-semibold">new</span> registration
                  attempts after you flip it.
                </li>
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setPendingValue(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={turningOn ? "bg-emerald-600 hover:bg-emerald-700" : undefined}
              variant={turningOn ? "default" : "destructive"}
              disabled={saving}
              onClick={confirmToggle}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 shrink-0 animate-spin" /> Saving...
                </>
              ) : turningOn ? (
                "Yes, turn Razorpay on"
              ) : (
                "Yes, turn Razorpay off"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
