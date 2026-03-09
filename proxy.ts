import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: uses only authConfig which has no Node.js-only imports.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const user = req.auth?.user;

    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return Response.redirect(loginUrl);
    }

    if ((user as { role?: string }).role !== "admin") {
      return Response.redirect(new URL("/?unauthorized=1", req.url));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
