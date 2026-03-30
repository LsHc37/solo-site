import { auth } from "@/auth";
import { getAdminLoginPath, hasAdminPortalAccess } from "@/lib/admin-portal";
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";
import AdminBreadcrumbs from "./_components/AdminBreadcrumbs";

export const metadata = {
  title: "Admin Panel — Retro Gigz",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || !hasAdminPortalAccess(session.user)) {
    redirect(getAdminLoginPath());
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1117" }}>
      <AdminSidebar userEmail={session.user.email!} />
      <main className="min-h-screen overflow-auto lg:ml-[240px]">
        <div className="max-w-6xl p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
          <AdminBreadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}
