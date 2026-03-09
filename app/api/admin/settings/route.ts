import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = db.prepare("SELECT * FROM site_settings ORDER BY key").all() as {
    key: string;
    value: string;
    updated_at: string;
  }[];

  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as Record<string, string>;

  const upsert = db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT(key) DO UPDATE SET
      value      = excluded.value,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `);

  const upsertAll = db.transaction((entries: [string, string][]) => {
    for (const [key, value] of entries) {
      upsert.run(key, String(value));
    }
  });

  upsertAll(Object.entries(body));

  return NextResponse.json({ success: true });
}
