const ADMIN_DASHBOARD_PATH = "/admin";

export type AdminPortalUserLike = {
  role?: string | null;
  adminPortalAccess?: boolean | null;
};

export function hasAdminPortalAccess(user?: AdminPortalUserLike | null) {
  return user?.role === "admin" && user.adminPortalAccess === true;
}

export function getAdminLoginPath(callbackUrl?: string | null) {
  const target = callbackUrl?.startsWith("/admin") ? callbackUrl : ADMIN_DASHBOARD_PATH;
  return `/login?mode=admin&callbackUrl=${encodeURIComponent(target)}`;
}