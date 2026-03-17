import { auth } from "@/auth";
import { hasAdminPortalAccess } from "@/lib/admin-portal";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !hasAdminPortalAccess(session.user)) {
    return {
      session: null as null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
