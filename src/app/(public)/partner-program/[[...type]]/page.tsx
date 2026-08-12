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
  const [{ data: campusPartners }, { data: classPartners }] = await Promise.all([
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
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-4" />
      <PartnerProgramTabs
        key={partnerType}
        initialType={partnerType}
        campusPartners={campusPartners ?? []}
        classPartners={classPartners ?? []}
      />
    </div>
  );
}
