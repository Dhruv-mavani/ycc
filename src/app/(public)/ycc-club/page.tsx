import Image from "next/image";
import { YccClubForm } from "@/components/registration/ycc-club-form";
import { BackButton } from "@/components/site/back-button";

export default function YccClubPage() {
  return (
    <div className="relative min-h-screen pb-20">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:py-20 relative z-10">
        <BackButton className="mb-6" />
        <div className="text-center mb-10">
          {/* unoptimized: Next's image optimizer re-encodes this PNG as
              indexed/palette color, which drops the logo's alpha
              transparency in Chrome (the source file itself is fine —
              verified byte-for-byte) — serve the original directly. */}
          <Image
            src="/brand/ycc-club-logo.png"
            alt="YCC Club"
            width={1600}
            height={800}
            className="w-full max-w-xs sm:max-w-sm h-auto mx-auto"
            priority
            unoptimized
          />
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Join YCC Club to stay in the loop on every event, challenge, and
            announcement. Fill in your details below.
          </p>
        </div>

        <YccClubForm />
      </div>
    </div>
  );
}
