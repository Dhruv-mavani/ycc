import { createClient } from "@/lib/supabase/server";
import { PartnerProgramTabs } from "@/components/registration/partner-program-tabs";
import { BackButton } from "@/components/site/back-button";

export default async function PartnerProgramPage() {
  const supabase = await createClient();
  const { data: colleges } = await supabase
    .from("colleges")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-4" />
      <PartnerProgramTabs colleges={colleges ?? []} />
    </div>
  );
}
