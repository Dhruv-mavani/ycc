import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerProgramAdminTabs } from "@/components/admin/partner-program-admin-tabs";
import { Button } from "@/components/ui/button";

export default async function AdminPartnerProgramPage() {
  const admin = createAdminClient();
  const [{ data: applications }, { data: colleges }] = await Promise.all([
    admin
      .from("partner_program_applications")
      .select(
        "id, name, email, college_id, stream, semester, mobile, instagram_handle, referred_by, referred_by_id, agreement_q1, agreement_q2, agreement_q3, partner_type, status, created_at",
      )
      .order("created_at", { ascending: false }),
    admin.from("colleges").select("id, name"),
  ]);

  const collegeNameById = new Map(
    (colleges ?? []).map((c) => [c.id, c.name]),
  );
  const nameById = new Map((applications ?? []).map((a) => [a.id, a.name]));

  const applicationsWithCollege = (applications ?? []).map((a) => ({
    ...a,
    collegeName: a.college_id
      ? (collegeNameById.get(a.college_id) ?? "Unknown college")
      : "N/A",
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
      <PartnerProgramAdminTabs
        applications={applicationsWithCollege}
        colleges={colleges ?? []}
      />
    </div>
  );
}
