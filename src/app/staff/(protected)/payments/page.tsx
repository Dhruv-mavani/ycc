import { Wallet } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CollectPaymentsPanel } from "@/components/staff/collect-payments-panel";

export default async function StaffPaymentsPage() {
  const admin = createAdminClient();
  const { data: events } = await admin
    .from("events")
    .select("id, name")
    .eq("pay_at_venue", true)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="mx-auto max-w-4xl px-2 py-6 sm:py-10 space-y-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-emerald-500/10 p-4 rounded-full">
          <Wallet className="size-10 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Collect Payments
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
            Search for a team or participant and mark their cash entry fee as paid or pending.
          </p>
        </div>
      </div>
      <CollectPaymentsPanel events={events ?? []} />
    </div>
  );
}
