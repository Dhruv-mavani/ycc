import Link from "next/link";
import { ArrowLeftIcon, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoxCricketPaymentsPanel } from "@/components/admin/box-cricket-payments-panel";
import {
  listBoxCricketPaymentSubmissions,
  listBankStatements,
} from "@/lib/box-cricket-payment-verification";

export default async function AdminBoxCricketPaymentsPage() {
  const [submissions, statements] = await Promise.all([
    listBoxCricketPaymentSubmissions("pending"),
    listBankStatements(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4">
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

      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600">
          <Receipt className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Box Cricket — Online Payment Verification
          </h1>
          <p className="text-muted-foreground text-sm">
            Review UPI payment screenshots against your bank statement, then
            verify or reject — verifying flips the registration to paid
            everywhere, including the staff cash toggle.
          </p>
        </div>
      </div>

      <BoxCricketPaymentsPanel
        initialSubmissions={submissions}
        initialStatements={statements}
      />
    </div>
  );
}
