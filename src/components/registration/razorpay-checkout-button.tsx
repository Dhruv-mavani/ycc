"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Opens Razorpay's embedded Checkout.js modal (no redirect away from the
// site). Confirmation itself happens via the "payment.captured" webhook
// (see src/app/api/webhooks/razorpay/route.ts) — on success, this just
// sends the visitor to /payment/success, where the existing
// PaymentStatusPoller waits for that webhook to land. No
// client-side signature check here on purpose: the webhook is the one
// authoritative confirmation path, so there's nothing to gain from also
// trusting a value the browser handed back, only more code that could get
// the verification subtly wrong.
export function RazorpayCheckoutButton({
  registrationId,
}: {
  registrationId: string;
  eventName: string;
  prefillName?: string | null;
  prefillEmail?: string | null;
  prefillPhone?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const [res, scriptLoaded] = await Promise.all([
        fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId }),
        }),
        loadRazorpayScript(),
      ]);

      if (!scriptLoaded) {
        toast.error("Could not load the payment widget — please check your connection and try again");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Could not start payment");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amountPaise,
        currency: "INR",
        name: "Yuva Champions Cricket",
        description: data.eventName,
        prefill: {
          name: data.captainName ?? undefined,
          email: data.captainEmail ?? undefined,
          contact: data.captainPhone ?? undefined,
        },
        handler: () => {
          // Razorpay's own checkout overlay sets document.body.style to
          // "overflow: hidden; contain: initial;" while open (confirmed by
          // inspecting the live DOM — nothing in our code sets this), and
          // doesn't reliably clear it in sync with this callback. Next's
          // own scroll-to-top-on-push can fire while that lock is still in
          // effect, so the scroll silently has no effect; once Razorpay
          // removes the lock afterward, nothing re-triggers another
          // scroll-to-top, so /payment/success renders stuck at whatever
          // offset the old, now-replaced page had — often far down a long
          // registration form. Clearing the lock and forcing the scroll
          // ourselves, right before navigating, fixes this at the source
          // for every paid event (this button is shared by all of them).
          document.body.removeAttribute("style");
          window.scrollTo(0, 0);
          router.push(`/payment/success?registration=${registrationId}`);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong starting payment.");
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" disabled={loading} onClick={handlePay}>
      {loading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" /> Opening payment...
        </>
      ) : (
        "Pay & confirm registration"
      )}
    </Button>
  );
}
