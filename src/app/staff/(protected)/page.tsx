import { StaffLookupPanel } from "@/components/staff/staff-lookup-panel";
import { ShieldCheck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StaffDashboardPage() {
  const admin = createAdminClient();
  const { data: colleges } = await admin
    .from("colleges")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl px-2 py-6 sm:py-10 space-y-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <ShieldCheck className="size-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Entry Verification
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
            Scan a participant&apos;s QR code or search by their unique ID, name, or college to verify their entry.
          </p>
        </div>
      </div>
      <StaffLookupPanel colleges={colleges ?? []} />
    </div>
  );
}
