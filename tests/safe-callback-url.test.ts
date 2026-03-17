import { describe, expect, it } from "vitest";
import { getSafeCallbackUrl } from "@/lib/safe-callback-url";

describe("getSafeCallbackUrl", () => {
  it("falls back to root for null", () => {
    expect(getSafeCallbackUrl(null)).toBe("/");
  });

  it("accepts internal paths", () => {
    expect(getSafeCallbackUrl("/admin/users")).toBe("/admin/users");
    expect(getSafeCallbackUrl("/contact?topic=ios-beta")).toBe("/contact?topic=ios-beta");
  });

  it("rejects non-relative and protocol-relative values", () => {
    expect(getSafeCallbackUrl("https://example.com/phish")).toBe("/");
    expect(getSafeCallbackUrl("//example.com/phish")).toBe("/");
    expect(getSafeCallbackUrl("javascript:alert(1)")).toBe("/");
  });
});
