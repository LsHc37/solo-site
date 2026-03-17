import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/public/site-state/route";

describe("GET /api/public/site-state", () => {
  it("returns expected response shape", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = (await response.json()) as {
      maintenanceMode: unknown;
      announcementActive: unknown;
      announcementText: unknown;
      announcementColor: unknown;
      siteName: unknown;
      tagline: unknown;
      primaryColor: unknown;
      bgColor: unknown;
      surfaceColor: unknown;
      textColor: unknown;
      mutedColor: unknown;
      contactEmail: unknown;
      navAccountLabel: unknown;
      pageLayouts: unknown;
      contentBlocks: unknown;
    };

    expect(typeof data.maintenanceMode).toBe("boolean");
    expect(typeof data.announcementActive).toBe("boolean");
    expect(typeof data.announcementText).toBe("string");
    expect(typeof data.announcementColor).toBe("string");
    expect(typeof data.siteName).toBe("string");
    expect(typeof data.tagline).toBe("string");
    expect(typeof data.primaryColor).toBe("string");
    expect(typeof data.bgColor).toBe("string");
    expect(typeof data.surfaceColor).toBe("string");
    expect(typeof data.textColor).toBe("string");
    expect(typeof data.mutedColor).toBe("string");
    expect(typeof data.contactEmail).toBe("string");
    expect(typeof data.navAccountLabel).toBe("string");
    expect(typeof data.pageLayouts).toBe("object");
    expect(typeof data.contentBlocks).toBe("object");
  });
});
