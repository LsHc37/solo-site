import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/lib/db";

interface WaitlistRow {
  id: number;
  platform: "ios";
  name: string;
  email: string | null;
  phone: string | null;
  added_to_google_form: number;
  google_form_added_at: string | null;
  created_at: string;
}

interface TogglePayload {
  id?: unknown;
  addedToGoogleForm?: unknown;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const entries = db
    .prepare(
      `
      SELECT
        id,
        platform,
        name,
        email,
        phone,
        added_to_google_form,
        google_form_added_at,
        created_at
      FROM waitlist_submissions
      ORDER BY created_at DESC
      LIMIT 500
      `,
    )
    .all() as WaitlistRow[];

  const googleFormSetting = db
    .prepare("SELECT value FROM site_settings WHERE key = 'solo_waitlist_google_form_url' LIMIT 1")
    .get() as { value?: string } | undefined;

  return NextResponse.json({
    entries,
    googleFormUrlTemplate: googleFormSetting?.value ?? "",
  });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = (await req.json()) as TogglePayload;
  const id = Number(body.id);
  const addedToGoogleForm = Boolean(body.addedToGoogleForm);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  db.prepare(
    `
    UPDATE waitlist_submissions
    SET
      added_to_google_form = ?,
      google_form_added_at = CASE
        WHEN ? = 1 THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        ELSE NULL
      END
    WHERE id = ?
    `,
  ).run(addedToGoogleForm ? 1 : 0, addedToGoogleForm ? 1 : 0, id);

  return NextResponse.json({ success: true });
}
