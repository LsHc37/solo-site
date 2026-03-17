import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { getAdminLoginPath, hasAdminPortalAccess } from "@/lib/admin-portal";

// Edge-safe: uses only authConfig which has no Node.js-only imports.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const user = req.auth?.user;

    if (!hasAdminPortalAccess(user)) {
      const loginUrl = new URL(getAdminLoginPath(pathname), req.url);
      return Response.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
