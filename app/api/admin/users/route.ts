import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/lib/db";
import { parsePaginationParams, getPaginationOffset, getPaginationMeta } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const params = parsePaginationParams(searchParams);
  const { offset, limit } = getPaginationOffset(params.page, params.limit);

  // Get total count
  const countResult = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  const total = countResult.count;

  // Get paginated data
  const users = db
    .prepare(`
      SELECT id, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `)
    .all(limit, offset);

  const meta = getPaginationMeta(params.page, limit, total);

  return NextResponse.json({
    ok: true,
    data: users,
    meta,
  });
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as { id?: unknown; role?: unknown };
  const { id, role } = body;

  if (!id || !["user", "admin"].includes(String(role))) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  // Prevent demoting yourself
  if (String(id) === session!.user.id && role !== "admin") {
    return NextResponse.json({ error: "Cannot demote your own account" }, { status: 400 });
  }

  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(String(role), Number(id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Prevent deleting yourself
  if (id === session!.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
