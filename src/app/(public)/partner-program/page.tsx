import { createClient } from "@/lib/supabase/server";
import { PartnerProgramTabs } from "@/components/registration/partner-program-tabs";
import { BackButton } from "@/components/site/back-button";

export default async function PartnerProgramPage() {
  const supabase = await createClient();
  const [{ data: colleges }, { data: campusPartners }, { data: classPartners }] =
    await Promise.all([
      supabase.from("colleges").select("id, name").order("name"),
      supabase
        .from("partner_program_applications")
        .select("id, name, college_id, stream, semester")
        .eq("partner_type", "campus")
        .eq("status", "approved")
        .order("name"),
      supabase
        .from("partner_program_applications")
        .select("id, name, college_id, stream, semester")
        .eq("partner_type", "class")
        .eq("status", "approved")
        .order("name"),
    ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-4" />
      <PartnerProgramTabs
        colleges={colleges ?? []}
        campusPartners={campusPartners ?? []}
        classPartners={classPartners ?? []}
      />
    </div>
  );
}
