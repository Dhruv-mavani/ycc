import { createAdminClient } from "@/lib/supabase/admin";
import { StaffApprovalPanel } from "@/components/admin/staff-approval-panel";

export default async function AdminStaffPage() {
  const admin = createAdminClient();
  const { data: staff } = await admin
    .from("staff")
    .select("*")
    .order("requested_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4">
      <div>
        <h1 className="text-xl font-bold">Staff access</h1>
        <p className="text-muted-foreground text-sm">
          Approve or reject staff sign-in requests. Only approved accounts
          can access the scanning booth.
        </p>
      </div>
      <StaffApprovalPanel staff={staff ?? []} />
    </div>
  );
}
