import { requirePartnerOfType } from "@/lib/auth";
import { PartnerHeader } from "@/components/registration/partner-header";
import { PartnerReviewPanel } from "@/components/registration/partner-review-panel";
import { TeamManagementPanel } from "@/components/registration/team-management-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import {
  Card,
  CardContent,
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
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Your team code
                  </p>
                  <Badge variant="secondary" className="mt-1 font-mono text-sm">
                    {access.application.teamCode ?? "Generating…"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Your entry ID
                  </p>
                  <Badge variant="secondary" className="mt-1 font-mono text-sm">
                    {access.application.uniqueId ?? "Generating…"}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Share your team code with your Classmate Partners — they&apos;ll
                enter it on their application to join your team.
              </p>
              <Button nativeButton={false} render={
                <a href="/api/partner-program/certificate">
                  <Download className="size-4" />
                  Download certificate
                </a>
              } />
            </CardContent>
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
