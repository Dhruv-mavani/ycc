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
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            YCC <span className="text-blue-600">Club</span>
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Join YCC Club to stay in the loop on every event, challenge, and
            announcement. Fill in your details below.
          </p>
        </div>

        <div className="mb-10 mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <Image
            src="/ycc_club.png"
            alt="What is YCC — cricket tournaments, e-gaming, stand-up comedy, and music fest categories"
            width={941}
            height={1671}
            className="w-full h-auto"
            priority
          />
        </div>

        <YccClubForm />
      </div>
    </div>
  );
}
