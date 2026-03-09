import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const blocks = db
    .prepare("SELECT * FROM content_blocks ORDER BY section, key")
    .all();

  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as { key?: unknown; value?: unknown; label?: unknown; section?: unknown };
  const { key, value, label, section } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  db.prepare(`
    INSERT INTO content_blocks (key, value, label, section, updated_at)
    VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT(key) DO UPDATE SET
      value      = excluded.value,
      label      = excluded.label,
      section    = excluded.section,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `).run(
    String(key),
    String(value),
    String(label ?? key),
    String(section ?? "general"),
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  db.prepare("DELETE FROM content_blocks WHERE key = ?").run(key);
  return NextResponse.json({ success: true });
}
