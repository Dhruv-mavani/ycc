import { requirePartnerOfType } from "@/lib/auth";
import { PartnerHeader } from "@/components/registration/partner-header";
import { PartnerReviewPanel } from "@/components/registration/partner-review-panel";
import { TeamManagementPanel } from "@/components/registration/team-management-panel";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ClassPartnerPage() {
  const access = await requirePartnerOfType("class");

  return (
    <div className="flex min-h-screen flex-col">
      <PartnerHeader title="Class Partner" partnerName={access.application.name} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {access.application.name}</CardTitle>
              <CardDescription>
                You&apos;re an approved YCC Class Partner.
              </CardDescription>
            </CardHeader>
          </Card>

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
        </div>
      </main>
    </div>
  );
}
