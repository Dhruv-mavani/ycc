import { redirect } from "next/navigation";
import { getPartnerAccessStatus } from "@/lib/auth";
import { StatusScreen } from "@/components/site/status-screen";
import { PartnerReviewPanel } from "@/components/registration/partner-review-panel";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PartnerType } from "@/lib/supabase/types";

const REVIEWER_TEXT: Record<PartnerType, string> = {
  campus: "an admin",
  class: "the Campus Partner who referred you",
  classmate: "the Class Partner who referred you",
};

const CHILD_LABEL: Partial<Record<PartnerType, string>> = {
  campus: "Class Partner",
  class: "Classmate Partner",
};

export default async function PartnerProgramStatusPage() {
  const access = await getPartnerAccessStatus();

  if (access.state === "unauthenticated") {
    redirect("/partner-program");
  }

  if (access.state === "no_application") {
    return (
      <StatusScreen
        title="No application found"
        description="We couldn't find a partner program application linked to this account."
        email={access.user.email}
      />
    );
  }

  if (access.state === "pending") {
    return (
      <StatusScreen
        title="Waiting for approval"
        description={`Your application has been sent to ${REVIEWER_TEXT[access.application.partnerType]}. You'll be able to sign in fully as soon as it's approved — check back later.`}
        email={access.user.email}
      />
    );
  }

  if (access.state === "rejected") {
    return (
      <StatusScreen
        title="Application not approved"
        description="Your partner program application wasn't approved. Contact YCC if you think this is a mistake."
        email={access.user.email}
      />
    );
  }

  const childLabel = CHILD_LABEL[access.application.partnerType];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>You&apos;re approved!</CardTitle>
          <CardDescription>
            Welcome, {access.application.name} — you&apos;re an approved YCC{" "}
            {access.application.partnerType === "campus"
              ? "Campus Partner"
              : access.application.partnerType === "class"
                ? "Class Partner"
                : "Classmate Partner"}
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>

      {childLabel ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            {childLabel} applications referred by you
          </h2>
          <PartnerReviewPanel childLabel={childLabel} />
        </div>
      ) : null}
    </div>
  );
}
