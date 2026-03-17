import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

const PUCK_HOME_DATA_KEY = "puck_home_data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const row = db
    .prepare("SELECT value FROM site_settings WHERE key = ?")
    .get(PUCK_HOME_DATA_KEY) as { value: string } | undefined;

  if (!row?.value) {
    return NextResponse.json({ data: { root: { props: { title: "" } }, content: [] } });
  }

  try {
    const data = JSON.parse(row.value);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: { root: { props: { title: "" } }, content: [] } });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = (await req.json()) as { data?: unknown };

  if (!body || typeof body !== "object" || !body.data || typeof body.data !== "object") {
    return NextResponse.json({ error: "Invalid Puck payload" }, { status: 400 });
  }

  const serialized = JSON.stringify(body.data);

  db.prepare(
    `
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    `,
  ).run(PUCK_HOME_DATA_KEY, serialized);

  return NextResponse.json({ success: true });
}
