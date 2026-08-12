import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerProgramAdminTabs } from "@/components/admin/partner-program-admin-tabs";
import { Button } from "@/components/ui/button";

export default async function AdminPartnerProgramPage() {
  const admin = createAdminClient();
  const { data: applications } = await admin
    .from("partner_program_applications")
    .select(
      "id, name, email, mobile, age, gender, instagram_handle, referred_by, referred_by_id, agreed_to_terms, partner_type, status, created_at",
    )
    .order("created_at", { ascending: false });

  const nameById = new Map((applications ?? []).map((a) => [a.id, a.name]));

  const applicationsWithReferrer = (applications ?? []).map((a) => ({
    ...a,
    referredByName: a.referred_by_id ? (nameById.get(a.referred_by_id) ?? null) : null,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4">
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <Link href="/admin">
            <ArrowLeftIcon className="size-4" />
            Back to overview
          </Link>
        }
      />
      <PartnerProgramAdminTabs applications={applicationsWithReferrer} />
    </div>
  );
}
