import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/lib/db";
import { BuilderPageKey, getLayoutSettingKey, parsePageLayouts, serializePageLayouts, type SiteBuilderSection } from "@/lib/site-builder";

function inferBlockSection(key: string) {
  if (key.startsWith("home_hero") || key.startsWith("solo_hero")) return "hero";
  if (key.startsWith("home_privacy") || key.startsWith("solo_privacy")) return "privacy";
  if (key.startsWith("home_division") || key.startsWith("home_divisions")) return "divisions";
  if (key.startsWith("solo_feature") || key.startsWith("solo_features")) return "features";
  return "general";
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settingsRows = db.prepare("SELECT key, value FROM site_settings ORDER BY key").all() as {
    key: string;
    value: string;
  }[];
  const blockRows = db.prepare("SELECT key, value FROM content_blocks ORDER BY key").all() as {
    key: string;
    value: string;
  }[];

  const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value]));
  const blocks = Object.fromEntries(blockRows.map((row) => [row.key, row.value]));

  return NextResponse.json({
    settings,
    blocks,
    layouts: parsePageLayouts(settings),
  });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as {
    settings?: Record<string, string>;
    blocks?: Record<string, string>;
    layouts?: Partial<Record<BuilderPageKey, SiteBuilderSection[]>>;
  };

  const settings = body.settings ?? {};
  const blocks = body.blocks ?? {};
  const layoutSettings = serializePageLayouts(body.layouts ?? {});

  const upsertSetting = db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `);

  const upsertBlock = db.prepare(`
    INSERT INTO content_blocks (key, value, label, section, updated_at)
    VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `);

  const save = db.transaction(() => {
    for (const [key, value] of Object.entries({ ...settings, ...layoutSettings })) {
      upsertSetting.run(key, String(value));
    }

    for (const [key, value] of Object.entries(blocks)) {
      upsertBlock.run(key, String(value), key, inferBlockSection(key));
    }
  });

  save();

  return NextResponse.json({ success: true });
}