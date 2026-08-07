import { requirePartnerOfType } from "@/lib/auth";
import { PartnerHeader } from "@/components/registration/partner-header";
import { PartnerReviewPanel } from "@/components/registration/partner-review-panel";
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
        <div className="mx-auto max-w-2xl space-y-6">
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
        </div>
      </main>
    </div>
  );
}
