import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  key: string;
  value: string;
}

export async function GET() {
  try {
    const rows = db
      .prepare(
        "SELECT key, value FROM site_settings WHERE key IN ('maintenance_mode', 'announcement_active', 'announcement_text', 'announcement_color')",
      )
      .all() as Row[];

    const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));

    return NextResponse.json({
      maintenanceMode: settings.maintenance_mode === "true",
      announcementActive: settings.announcement_active === "true",
      announcementText: settings.announcement_text ?? "",
      announcementColor: settings.announcement_color ?? "#00F0FF",
    });
  } catch {
    return NextResponse.json({
      maintenanceMode: false,
      announcementActive: false,
      announcementText: "",
      announcementColor: "#00F0FF",
    });
  }
}
