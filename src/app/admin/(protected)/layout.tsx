import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader adminName={admin.name ?? admin.email} />
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
