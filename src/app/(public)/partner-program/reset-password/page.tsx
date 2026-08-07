import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnerResetPasswordForm } from "@/components/registration/partner-reset-password-form";

export default async function PartnerResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/partner-program");
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
