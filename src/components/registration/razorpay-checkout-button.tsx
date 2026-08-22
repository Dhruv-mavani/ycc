"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Uses Razorpay Payment Links instead of the in-page Checkout modal: the
// browser is redirected to a Razorpay-hosted payment page, and Razorpay
// redirects back to /payment/success on completion. Confirmation itself
// happens via the payment_link.paid webhook (see
// src/app/api/webhooks/razorpay/route.ts) — the payment-status poller on
// that page handles the case where the redirect lands before the webhook
// does.
export function RazorpayCheckoutButton({
  registrationId,
}: {
  registrationId: string;
  eventName: string;
  prefillName?: string | null;
  prefillEmail?: string | null;
  prefillPhone?: string | null;
}) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Could not start payment");
        setLoading(false);
        return;
      }

      const { shortUrl } = await res.json();
      window.location.href = shortUrl;
    } catch {
      toast.error("Something went wrong starting payment.");
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" disabled={loading} onClick={handlePay}>
      {loading ? "Opening payment..." : "Pay & confirm registration"}
    </Button>
  );
}
