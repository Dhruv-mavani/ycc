"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RazorpayCheckoutButton({
  registrationId,
  eventName,
  prefillName,
  prefillEmail,
  prefillPhone,
}: {
  registrationId: string;
  eventName: string;
  prefillName?: string | null;
  prefillEmail?: string | null;
  prefillPhone?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  async function handlePay() {
    if (!scriptReady || typeof window === "undefined" || !window.Razorpay) {
      toast.error("Payment gateway is still loading — try again in a moment.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      const order = await res.json();

      if (!res.ok) {
        toast.error(order.error ?? "Could not start payment");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: "INR",
        name: "Yuva Champions Cricket",
        description: eventName,
        order_id: order.orderId,
        prefill: {
          name: prefillName ?? undefined,
          email: prefillEmail ?? undefined,
          contact: prefillPhone ?? undefined,
        },
        theme: { color: "#1d4ed8" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            router.push(`/payment/success?registration=${registrationId}`);
          } else {
            toast.error(
              "Payment verification failed. Contact us with your registration ID: " +
                registrationId,
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch {
      toast.error("Something went wrong starting payment.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <Button className="w-full" disabled={loading} onClick={handlePay}>
        {loading ? "Opening payment..." : "Pay & confirm registration"}
      </Button>
    </>
  );
}
