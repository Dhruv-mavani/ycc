import { createClient } from "@/lib/supabase/server";
import { VolunteerApplicationForm } from "@/components/registration/volunteer-application-form";
import { BackButton } from "@/components/site/back-button";

export default async function VolunteerPage() {
  const supabase = await createClient();
  const { data: colleges } = await supabase
    .from("colleges")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-4" />
      <h1 className="mb-1 text-xl font-bold">Volunteer / Campus Partner Program</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Apply to become a YCC Campus Partner and help us bring events to your
        college. Fill in your details below.
      </p>

      <VolunteerApplicationForm colleges={colleges ?? []} />
    </div>
  );
}
