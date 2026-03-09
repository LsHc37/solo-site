import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const userCount = (
    db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }
  ).count;

  const adminCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
      .get() as { count: number }
  ).count;

  const contentCount = (
    db.prepare("SELECT COUNT(*) as count FROM content_blocks").get() as { count: number }
  ).count;

  const settingsCount = (
    db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number }
  ).count;

  const recentUsers = db
    .prepare("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 6")
    .all();

  return NextResponse.json({
    userCount,
    adminCount,
    contentCount,
    settingsCount,
    recentUsers,
  });
}
