import { describe, expect, it } from "vitest";
import { getAdminLoginPath, hasAdminPortalAccess } from "@/lib/admin-portal";

describe("admin portal helpers", () => {
  it("accepts only users with admin role and portal access flag", () => {
    expect(hasAdminPortalAccess({ role: "admin", adminPortalAccess: true })).toBe(true);
    expect(hasAdminPortalAccess({ role: "admin", adminPortalAccess: false })).toBe(false);
    expect(hasAdminPortalAccess({ role: "user", adminPortalAccess: true })).toBe(false);
    expect(hasAdminPortalAccess(undefined)).toBe(false);
  });

  it("builds a safe admin login path", () => {
    expect(getAdminLoginPath("/admin/settings")).toBe(
      "/login?mode=admin&callbackUrl=%2Fadmin%2Fsettings",
    );
    expect(getAdminLoginPath("/games")).toBe("/login?mode=admin&callbackUrl=%2Fadmin");
    expect(getAdminLoginPath()).toBe("/login?mode=admin&callbackUrl=%2Fadmin");
  });
});