import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerProgramAdminTabs } from "@/components/admin/partner-program-admin-tabs";
import { Button } from "@/components/ui/button";

export default async function AdminPartnerProgramPage() {
  const admin = createAdminClient();
  const [{ data: applications }, { data: colleges }, { data: campusPartnerApplications }] = await Promise.all([
    admin
      .from("partner_program_applications")
      .select(
        "id, name, email, mobile, age, gender, instagram_handle, referred_by, referred_by_id, agreed_to_terms, partner_type, status, created_at, college_id",
      )
      .order("created_at", { ascending: false }),
    admin.from("colleges").select("id, name, initials").eq("is_public", true).order("name"),
    admin
      .from("college_campus_partner_applications")
      .select(
        "id, name, email, mobile, age, gender, instagram_handle, stream, year, semester, code, agreed_to_terms, college_id, created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const nameById = new Map((applications ?? []).map((a) => [a.id, a.name]));
  const collegeNameById = new Map((colleges ?? []).map((c) => [c.id, c.name]));

  const applicationsWithReferrer = (applications ?? []).map((a) => ({
    ...a,
    referredByName: a.referred_by_id ? (nameById.get(a.referred_by_id) ?? null) : null,
    collegeName: a.college_id ? (collegeNameById.get(a.college_id) ?? null) : null,
  }));

  const campusPartnerApplicationsWithCollege = (campusPartnerApplications ?? []).map((a) => ({
    ...a,
    collegeName: collegeNameById.get(a.college_id) ?? null,
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
      <Suspense fallback={null}>
        <PartnerProgramAdminTabs
          applications={applicationsWithReferrer}
          colleges={colleges ?? []}
          collegeCampusPartnerApplications={campusPartnerApplicationsWithCollege}
        />
      </Suspense>
    </div>
  );
}
