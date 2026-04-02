import { auth } from "@/auth";
import { redirect } from "next/navigation";
import KickstartClient from "./KickstartClient";

export default async function KickstartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fkickstart");
  }

  return <KickstartClient />;
}
