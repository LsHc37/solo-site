import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";

export const metadata = {
  title: "Admin Panel — Retro Gigz",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D1117" }}>
      <AdminSidebar userEmail={session.user.email!} />
      <main
        className="min-h-screen overflow-auto"
        style={{ marginLeft: "240px" }}
      >
        <div className="p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
