import { redirect } from "next/navigation";
import { getPartnerAccessStatus } from "@/lib/auth";
import { PartnerResetPasswordForm } from "@/components/registration/partner-reset-password-form";

export default async function PartnerResetPasswordPage() {
  const access = await getPartnerAccessStatus();

  if (access.state === "unauthenticated") {
    redirect("/partner-program");
  }

  // An auth account exists (the recovery link worked) but it isn't linked to
  // any partner program application — nothing here for them to reset into.
  if (access.state === "no_application") {
    redirect("/partner-program/status");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-1 text-xl font-bold">Set a new password</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Choose a new password for your partner account.
      </p>
      <PartnerResetPasswordForm />
    </div>
  );
}
