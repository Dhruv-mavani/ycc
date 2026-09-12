import Link from "next/link";
import { ShieldCheck, Wallet, ScanLine, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function StaffDashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-2 py-6 sm:py-10 space-y-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <ShieldCheck className="size-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Staff Booth
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
            Choose what you need to do at the venue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/staff/payments" className="group">
          <Card className="h-full p-6 flex flex-col items-start gap-3 shadow-sm border-border/60 transition-all group-hover:shadow-md group-hover:border-primary/40">
            <div className="bg-emerald-500/10 p-3 rounded-full">
              <Wallet className="size-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-semibold text-foreground">
                  Collect Payments
                </h2>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Search a team or participant and mark their cash entry fee as paid.
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/staff/attendance" className="group">
          <Card className="h-full p-6 flex flex-col items-start gap-3 shadow-sm border-border/60 transition-all group-hover:shadow-md group-hover:border-primary/40">
            <div className="bg-primary/10 p-3 rounded-full">
              <ScanLine className="size-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-semibold text-foreground">
                  Attendance
                </h2>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Scan a QR code or search to check participants in at the gate.
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
