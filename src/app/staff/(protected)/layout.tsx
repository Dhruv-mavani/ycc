import { redirect } from "next/navigation";
import { getStaffAccessStatus } from "@/lib/auth";
import { StaffHeader } from "@/components/staff/staff-header";
import { StatusScreen } from "@/components/site/status-screen";

export default async function StaffProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getStaffAccessStatus();

  if (access.state === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.state === "pending") {
    return (
      <StatusScreen
        title="Waiting for approval"
        description="Your access request has been sent to the admin. You'll be able to sign in as soon as it's approved."
        email={access.user.email}
      />
    );
  }

  if (access.state === "rejected") {
    return (
      <StatusScreen
        title="Access denied"
        description="An admin has declined this account for staff access. Contact your event organizer if you think this is a mistake."
        email={access.user.email}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StaffHeader staffName={access.staffName ?? access.user.email ?? ""} />
      <main className="flex-1 px-4 py-4">{children}</main>
    </div>
  );
}
