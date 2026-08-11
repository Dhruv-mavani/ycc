import { redirect } from "next/navigation";
import { getPartnerAccessStatus } from "@/lib/auth";
import { StatusScreen } from "@/components/site/status-screen";
import type { PartnerType } from "@/lib/supabase/types";

const REVIEWER_TEXT: Record<PartnerType, string> = {
  campus: "an admin",
  class: "the YCC Partner who referred you",
  classmate: "the YCC Co-Partner who referred you",
};

const DASHBOARD_PATH: Record<PartnerType, string> = {
  campus: "/campus-partner",
  class: "/class-partner",
  classmate: "/classmate-partner",
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

  redirect(DASHBOARD_PATH[access.application.partnerType]);
}
