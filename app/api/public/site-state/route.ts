import { NextResponse } from "next/server";
import db from "@/lib/db";
import { parsePageLayouts } from "@/lib/site-builder";

export const dynamic = "force-dynamic";

interface Row {
  key: string;
  value: string;
}

interface BlockRow {
  key: string;
  value: string;
}

export async function GET() {
  try {
    const rows = db
      .prepare(
        "SELECT key, value FROM site_settings WHERE key IN ('maintenance_mode', 'announcement_active', 'announcement_text', 'announcement_color', 'site_name', 'tagline', 'primary_color', 'bg_color', 'surface_color', 'text_color', 'muted_color', 'contact_email', 'nav_account_label', 'page_layout_home', 'page_layout_solo')",
      )
      .all() as Row[];

    const blockRows = db
      .prepare("SELECT key, value FROM content_blocks")
      .all() as BlockRow[];

    const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    const contentBlocks = Object.fromEntries(blockRows.map((row) => [row.key, row.value]));
    const pageLayouts = parsePageLayouts(settings);

    return NextResponse.json({
      maintenanceMode: settings.maintenance_mode === "true",
      announcementActive: settings.announcement_active === "true",
      announcementText: settings.announcement_text ?? "",
      announcementColor: settings.announcement_color ?? "#00F0FF",
      siteName: settings.site_name ?? "Retro Gigz",
      tagline: settings.tagline ?? "Digital Independence.",
      primaryColor: settings.primary_color ?? "#00F0FF",
      bgColor: settings.bg_color ?? "#0D1117",
      surfaceColor: settings.surface_color ?? "#161B22",
      textColor: settings.text_color ?? "#E6EDF3",
      mutedColor: settings.muted_color ?? "#8B949E",
      contactEmail: settings.contact_email ?? "",
      navAccountLabel: settings.nav_account_label ?? "Account",
      pageLayouts,
      contentBlocks,
    });
  } catch {
    return NextResponse.json({
      maintenanceMode: false,
      announcementActive: false,
      announcementText: "",
      announcementColor: "#00F0FF",
      siteName: "Retro Gigz",
      tagline: "Digital Independence.",
      primaryColor: "#00F0FF",
      bgColor: "#0D1117",
      surfaceColor: "#161B22",
      textColor: "#E6EDF3",
      mutedColor: "#8B949E",
      contactEmail: "",
      navAccountLabel: "Account",
      pageLayouts: parsePageLayouts({}),
      contentBlocks: {},
    });
  }
}
