import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnerProgramTabs } from "@/components/registration/partner-program-tabs";
import { BackButton } from "@/components/site/back-button";
import type { PartnerType } from "@/lib/supabase/types";

// Each application type gets its own shareable URL — /partner-program
// itself defaults to the YCC Partner tab.
const SLUG_TO_TYPE: Record<string, PartnerType> = {
  "YCC-partner": "campus",
  "YCC-Co-partner": "class",
  "Classmate-partner": "classmate",
};

export default async function PartnerProgramPage({
  params,
}: {
  params: Promise<{ type?: string[] }>;
}) {
  const { type } = await params;
  if (type && type.length > 1) notFound();
  const slug = type?.[0];
  const partnerType: PartnerType = slug ? SLUG_TO_TYPE[slug] : "campus";
  if (slug && !partnerType) notFound();

  const supabase = await createClient();
  const [{ data: campusPartners }, { data: classPartners }, { data: colleges }] = await Promise.all([
    supabase
      .from("partner_program_applications")
      .select("id, name, team_code")
      .eq("partner_type", "campus")
      .eq("status", "approved")
      .order("name"),
    supabase
      .from("partner_program_applications")
      .select("id, name, team_code")
      .eq("partner_type", "class")
      .eq("status", "approved")
      .order("name"),
    supabase.from("colleges").select("id, name").eq("is_public", true).order("name"),
  ]);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
      
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-20 relative z-10">
        <BackButton className="mb-6" />
        <PartnerProgramTabs
          key={partnerType}
          initialType={partnerType}
          campusPartners={campusPartners ?? []}
          classPartners={classPartners ?? []}
          colleges={colleges ?? []}
        />
      </div>
    </div>
  );
}

