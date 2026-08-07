import { requirePartnerOfType } from "@/lib/auth";
import { PartnerHeader } from "@/components/registration/partner-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ClassmatePartnerPage() {
  const access = await requirePartnerOfType("classmate");

  return (
    <div className="flex min-h-screen flex-col">
      <PartnerHeader title="Classmate Partner" partnerName={access.application.name} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {access.application.name}</CardTitle>
              <CardDescription>
                You&apos;re an approved YCC Classmate Partner.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
