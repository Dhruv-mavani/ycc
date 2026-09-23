import Link from "next/link";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CollegeCampusPartnerForm } from "@/components/registration/college-campus-partner-form";
import { BackButton } from "@/components/site/back-button";
import { Button } from "@/components/ui/button";

export default async function CollegeCampusPartnerPage() {
  const supabase = await createClient();
  const { data: colleges } = await supabase
    .from("colleges")
    .select("id, name, initials")
    .eq("is_public", true)
    .order("name");

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:py-20 relative z-10">
        <BackButton className="mb-6" />
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            YCC College <span className="text-blue-600">Campus Partner</span>
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Apply to become a YCC College Campus Partner and help us bring
            YCC to your college. Fill in your details below.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Button
            variant="outline"
            className="rounded-full px-8 h-12 border-slate-200 shadow-sm bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all hover:scale-[1.02]"
            nativeButton={false}
            render={
              <Link href="/college-campus-partner/certificate" className="flex items-center gap-2">
                <Download className="size-4 text-blue-600" />
                Download your certificate
              </Link>
            }
          />
        </div>
        <CollegeCampusPartnerForm colleges={colleges ?? []} />
      </div>
    </div>
  );
}
