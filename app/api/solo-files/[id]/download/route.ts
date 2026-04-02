import { auth } from "@/auth";
import db from "@/lib/db";

interface DownloadRecord {
  filename: string;
  content: string;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = Number.parseInt(session.user.id, 10);
  if (!Number.isFinite(userId)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const params = await context.params;

  const row = db
    .prepare(
      `SELECT filename, content
       FROM solo_files
       WHERE id = ?
         AND user_id = ?
         AND status = 'completed'
         AND content IS NOT NULL`,
    )
    .get(params.id, userId) as DownloadRecord | undefined;

  if (!row) {
    return new Response("File not found", { status: 404 });
  }

  return new Response(row.content, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${row.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
