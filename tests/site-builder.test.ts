import { describe, expect, it } from "vitest";
import { getDefaultLayout, normalizeLayout } from "@/lib/site-builder";

describe("site builder layouts", () => {
  it("falls back to defaults when layout is invalid", () => {
    expect(normalizeLayout("home", "not-json")).toEqual(getDefaultLayout("home"));
  });

  it("keeps valid sections and restores missing defaults", () => {
    const layout = normalizeLayout("solo", [
      { id: "solo-privacy", type: "privacy", label: "Privacy", visible: false },
    ]);

    expect(layout.map((section) => section.type)).toEqual(["privacy", "hero", "features"]);
    expect(layout[0]?.visible).toBe(false);
  });
});