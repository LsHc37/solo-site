import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function safeResolvePath(relPath: string): string | null {
  const resolved = path.resolve(PUBLIC_DIR, relPath.replace(/^\/+/, ""));
  if (!resolved.startsWith(PUBLIC_DIR + path.sep) && resolved !== PUBLIC_DIR) return null;
  return resolved;
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const dir = searchParams.get("dir") ?? "";

  const absDir = safeResolvePath(dir);
  if (!absDir) return NextResponse.json({ error: "Invalid path" }, { status: 400 });

  if (!fs.existsSync(absDir)) {
    return NextResponse.json({ files: [], dir });
  }

  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  const files = entries.map((e) => {
    const fullPath = path.join(absDir, e.name);
    const stat = fs.statSync(fullPath);
    return {
      name: e.name,
      isDir: e.isDirectory(),
      size: e.isDirectory() ? 0 : stat.size,
      modified: stat.mtime.toISOString(),
    };
  });

  files.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({ files, dir });
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const relPath = searchParams.get("path");
  if (!relPath) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const absPath = safeResolvePath(relPath);
  if (!absPath) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  if (!fs.existsSync(absPath)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stat = fs.statSync(absPath);
  if (stat.isDirectory()) {
    fs.rmSync(absPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(absPath);
  }

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as { dirPath?: string };
  if (!body.dirPath) return NextResponse.json({ error: "dirPath required" }, { status: 400 });

  const absPath = safeResolvePath(body.dirPath);
  if (!absPath) return NextResponse.json({ error: "Invalid path" }, { status: 400 });

  fs.mkdirSync(absPath, { recursive: true });
  return NextResponse.json({ success: true });
}
