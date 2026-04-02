import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

interface SoloFileRecord {
  id: string;
  user_id: number;
  filename: string;
  status: "queued" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number.parseInt(session.user.id, 10);
  const params = await context.params;

  const file = db
    .prepare(
      `SELECT id, user_id, filename, status, error_message, created_at, updated_at, completed_at
       FROM solo_files
       WHERE id = ? AND user_id = ?`,
    )
    .get(params.id, userId) as SoloFileRecord | undefined;

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: file.id,
    filename: file.filename,
    status: file.status,
    errorMessage: file.error_message,
    createdAt: file.created_at,
    updatedAt: file.updated_at,
    completedAt: file.completed_at,
    downloadUrl: file.status === "completed" ? `/api/solo-files/${file.id}/download` : null,
  });
}
