import { auth } from "@/auth";
import { redirect } from "next/navigation";
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
        <MyFilesClient />
      </main>
      <PublicFooter />
    </div>
  );
}
