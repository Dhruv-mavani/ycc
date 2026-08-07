import { requirePartnerOfType } from "@/lib/auth";
import { PartnerHeader } from "@/components/registration/partner-header";
import { PartnerReviewPanel } from "@/components/registration/partner-review-panel";
import { ClassPartnerTeamsOverview } from "@/components/registration/class-partner-teams-overview";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CampusPartnerPage() {
  const access = await requirePartnerOfType("campus");

  return (
    <div className="flex min-h-screen flex-col">
      <PartnerHeader title="Campus Partner" partnerName={access.application.name} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {access.application.name}</CardTitle>
              <CardDescription>
                You&apos;re an approved YCC Campus Partner.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Class Partner applications referred by you
            </h2>
            <PartnerReviewPanel childLabel="Class Partner" />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Classmate Partners &amp; team assignments
            </h2>
            <p className="text-muted-foreground text-sm">
              Team sorting is managed by each Class Partner — shown here for
              visibility.
            </p>
            <ClassPartnerTeamsOverview />
          </div>
        </div>
      </main>
    </div>
  );
}
