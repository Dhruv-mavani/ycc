import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnerProgramApplicationsList } from "@/components/admin/partner-program-applications-list";
import { Button } from "@/components/ui/button";

export default async function AdminPartnerProgramPage() {
  const admin = createAdminClient();
  const [{ data: applications }, { data: colleges }] = await Promise.all([
    admin
      .from("partner_program_applications")
      .select("*")
      .order("created_at", { ascending: false }),
    admin.from("colleges").select("id, name"),
  ]);

  const collegeNameById = new Map(
    (colleges ?? []).map((c) => [c.id, c.name]),
  );

  const applicationsWithCollege = (applications ?? []).map((a) => ({
    ...a,
    collegeName: collegeNameById.get(a.college_id) ?? "Unknown college",
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
      <div>
        <h1 className="text-xl font-bold">Partner program applications</h1>
        <p className="text-muted-foreground text-sm">
          Campus Partner / Class Partner / Classmate Partner applications
          submitted through the public form.
        </p>
      </div>
      <PartnerProgramApplicationsList
        applications={applicationsWithCollege}
        colleges={colleges ?? []}
      />
    </div>
  );
}
