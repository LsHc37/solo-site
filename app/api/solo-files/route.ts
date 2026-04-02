import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { generateSoloPlan } from "@/lib/solo-file-generator";
import crypto from "crypto";

type SoloFileStatus = "queued" | "processing" | "completed" | "failed";

interface SoloFileRecord {
  id: string;
  user_id: number;
  filename: string;
  status: SoloFileStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

function sanitizeFileName(input: string): string {
  return input.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function buildDefaultFileName(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return sanitizeFileName(`solo-plan-${stamp}.solo`);
}

async function processSoloFile(fileId: string, userInput: string) {
  try {
    db.prepare(
      `UPDATE solo_files
       SET status = 'processing', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
    ).run(fileId);

    const plan = await generateSoloPlan(userInput);
    const serialized = JSON.stringify(plan, null, 2);

    db.prepare(
      `UPDATE solo_files
       SET status = 'completed',
           content = ?,
           completed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
    ).run(serialized, fileId);
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Generation failed";
    db.prepare(
      `UPDATE solo_files
       SET status = 'failed',
           error_message = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
    ).run(message, fileId);
  }
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number.parseInt(session.user.id, 10);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = db
    .prepare(
      `SELECT id, filename, status, error_message, created_at, updated_at, completed_at
       FROM solo_files
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .all(userId) as SoloFileRecord[];

  const payload = files.map((file) => ({
    id: file.id,
    filename: file.filename,
    status: file.status,
    errorMessage: file.error_message,
    createdAt: file.created_at,
    updatedAt: file.updated_at,
    completedAt: file.completed_at,
    downloadUrl: file.status === "completed" ? `/api/solo-files/${file.id}/download` : null,
  }));

  return NextResponse.json({ files: payload });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number.parseInt(session.user.id, 10);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userInput = "";

  try {
    const body = await req.json();
    userInput = (body?.prompt ?? body?.userInput ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!userInput) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const fileId = `sf_${crypto.randomUUID().replace(/-/g, "")}`;
  const filename = buildDefaultFileName();

  db.prepare(
    `INSERT INTO solo_files (id, user_id, prompt, filename, status)
     VALUES (?, ?, ?, ?, 'queued')`,
  ).run(fileId, userId, userInput, filename);

  void processSoloFile(fileId, userInput);

  return NextResponse.json(
    {
      id: fileId,
      filename,
      status: "queued",
      message: "Your .solo file is being generated and will appear in My Files.",
    },
    { status: 202 },
  );
}
