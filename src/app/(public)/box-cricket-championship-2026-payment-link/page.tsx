import type { Metadata } from "next";
import { BackButton } from "@/components/site/back-button";
import { PaymentLinkForm } from "./payment-link-form";

export const metadata: Metadata = {
  title: "Pay Team Entry Fee | YCC Box Cricket",
  description: "Scan to pay the ₹999 Box Cricket Team Entry Fee via UPI and submit your payment for verification.",
  robots: { index: false, follow: false },
};

export default function BoxCricketPaymentLinkPage() {
  return (
    <div className="relative min-h-screen pb-20 flex flex-col pt-10">
      {/* Background grid — same treatment as /receipt */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

      <div className="relative mx-auto w-full max-w-md px-4 flex-1 z-10">
        <BackButton className="mb-6 self-start" />

        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            YCC Box Cricket — Pay Entry Fee
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Pay your ₹999 Team Entry Fee online and submit proof for
            verification — no need to carry cash to the venue.
          </p>
        </div>

        <PaymentLinkForm />
      </div>
    </div>
  );
}
