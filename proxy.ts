import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-safe: uses only authConfig which has no Node.js-only imports.
const { auth } = NextAuth(authConfig);

// Role hierarchy levels
const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  manager: 2,
  staff: 1,
  user: 0,
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  const publicRoutes = [
    "/login",
    "/",
    "/games",
    "/faq",
    "/contact",
    "/community",
    "/privacy",
    "/solo",
    "/api/auth",
    "/api/public",
  ];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Setup page is accessible to authenticated users
  if (pathname === "/setup") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Allow access to setup
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If authenticated, check mustChangePassword
  if (session && pathname !== "/setup" && pathname !== "/login") {
    const mustChangePassword = (session.user as any).mustChangePassword === true;
    
    if (mustChangePassword) {
      // Redirect to setup page
      return NextResponse.redirect(new URL("/setup", req.url));
    }
  }

  // Role-based route protection
  if (session) {
    const userRole = (session.user as any).role || "user";
    const userLevel = ROLE_HIERARCHY[userRole] || 0;

    // Admin routes - require admin role (level 3)
    // Exception: timesheets is accessible to managers
    if (pathname.startsWith("/admin/timesheets")) {
      if (userLevel < ROLE_HIERARCHY.manager) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } else if (pathname.startsWith("/admin")) {
      if (userLevel < ROLE_HIERARCHY.admin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Manager routes - require manager or higher (level 2+)
    if (pathname.startsWith("/manager")) {
      if (userLevel < ROLE_HIERARCHY.manager) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Employee routes - require staff or higher (level 1+)
    if (pathname.startsWith("/employee")) {
      if (userLevel < ROLE_HIERARCHY.staff) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // API route protection
    if (pathname.startsWith("/api/admin/timesheets")) {
      // Timesheets accessible to managers and admins
      if (userLevel < ROLE_HIERARCHY.manager) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Manager or Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (pathname.startsWith("/api/admin")) {
      if (userLevel < ROLE_HIERARCHY.admin) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (pathname.startsWith("/api/manager")) {
      if (userLevel < ROLE_HIERARCHY.manager) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Manager access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (pathname.startsWith("/api/employee")) {
      if (userLevel < ROLE_HIERARCHY.staff) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Employee access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  return NextResponse.next();
});

// Match all routes except static files
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
