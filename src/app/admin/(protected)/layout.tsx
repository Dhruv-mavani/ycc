import { redirect } from "next/navigation";
import { getAdminAccessStatus } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusScreen } from "@/components/site/status-screen";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAdminAccessStatus();

  if (access.state === "unauthenticated") {
    redirect("/admin/login");
  }

  if (access.state === "unauthorized") {
    return (
      <StatusScreen
        title="Not authorized"
        description="This Google account doesn't have admin access. Contact an existing admin if you think this is a mistake."
        email={access.user.email}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader adminName={access.admin.name ?? access.admin.email} />
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
