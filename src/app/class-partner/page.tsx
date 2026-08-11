import { requirePartnerOfType } from "@/lib/auth";
import { PartnerHeader } from "@/components/registration/partner-header";
import { PartnerReviewPanel } from "@/components/registration/partner-review-panel";
import { TeamManagementPanel } from "@/components/registration/team-management-panel";
import { PartnerEventRegistrationPanel } from "@/components/registration/partner-event-registration-panel";
import { WhatsappJoinGate } from "@/components/registration/whatsapp-join-gate";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default async function ClassPartnerPage() {
  const access = await requirePartnerOfType("class");

  if (!access.application.whatsappJoinedAt) {
    return (
      <WhatsappJoinGate title="Class Partner" partnerName={access.application.name} />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PartnerHeader title="Class Partner" partnerName={access.application.name} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="relative p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome, {access.application.name}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  You&apos;re an approved YCC Class Partner.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 pt-4 border-t border-border/50">
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                    Your team code
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1.5 border border-border/50">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {access.application.teamCode ?? "Generating…"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                    Your entry ID
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1.5 border border-border/50">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {access.application.uniqueId ?? "Generating…"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <p className="text-muted-foreground text-xs leading-relaxed max-w-md">
                  Share your team code with your Classmate Partners — they&apos;ll
                  enter it on their application to join your team.
                </p>
                <Button className="w-full sm:w-auto shadow-sm group" nativeButton={false} render={
                  <a href="/api/partner-program/certificate">
                    <Download className="size-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                    Download Certificate
                  </a>
                } />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Classmate Partner applications referred by you
            </h2>
            <PartnerReviewPanel childLabel="Classmate Partner" />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Team A / Team B</h2>
            <p className="text-muted-foreground text-sm">
              Sort your approved Classmate Partners into two teams — move
              them around as you like.
            </p>
            <TeamManagementPanel />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Register for Ycc Partners Box Cricket Championship 2026
            </h2>
            <p className="text-muted-foreground text-sm">
              Once a team has exactly 5 approved Classmate Partners, register
              and pay ₹3000 to confirm that team&apos;s tournament entry. You
              can register Team A, Team B, or both.
            </p>
            <PartnerEventRegistrationPanel captainName={access.application.name} />
          </div>
        </div>
      </main>
    </div>
  );
}
