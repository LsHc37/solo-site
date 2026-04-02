import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import MyFilesClient from "./MyFilesClient";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Faccount");
  }

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="mb-6 rounded-3xl border p-6 sm:p-8 fade-up" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#00F0FF" }}>
            Account Hub
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm" style={{ color: "#8B949E" }}>
            Manage your generated files, start a new custom plan, and jump into your workflow.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/account" className="rounded-xl border p-4 soft-btn" style={{ borderColor: "#2A3340", backgroundColor: "#0D1117" }}>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#00F0FF" }}>My Files</p>
              <p className="mt-1 text-sm font-black">Open .solo Files</p>
            </Link>
            <Link href="/kickstart" className="rounded-xl border p-4 soft-btn" style={{ borderColor: "#2A3340", backgroundColor: "#0D1117" }}>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#34D399" }}>Generator</p>
              <p className="mt-1 text-sm font-black">Create New .solo File</p>
            </Link>
            <Link href="/community" className="rounded-xl border p-4 soft-btn" style={{ borderColor: "#2A3340", backgroundColor: "#0D1117" }}>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#60A5FA" }}>Community</p>
              <p className="mt-1 text-sm font-black">Ask Questions & Share</p>
            </Link>
          </div>
        </section>

        <MyFilesClient />
      </main>
      <PublicFooter />
    </div>
  );
}
