import { createAdminClient } from "@/lib/supabase/admin";
import { VolunteerApplicationsList } from "@/components/admin/volunteer-applications-list";

export default async function AdminVolunteersPage() {
  const admin = createAdminClient();
  const [{ data: applications }, { data: colleges }] = await Promise.all([
    admin
      .from("volunteer_applications")
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
      <div>
        <h1 className="text-xl font-bold">Volunteer applications</h1>
        <p className="text-muted-foreground text-sm">
          Campus Partner / volunteer program applications submitted through
          the public form.
        </p>
      </div>
      <VolunteerApplicationsList applications={applicationsWithCollege} />
    </div>
  );
}
