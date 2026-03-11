import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();
const EDITOR_ENABLED = process.env.NODE_ENV !== "production";

// Only these top-level directories can be browsed / edited
const ALLOWED_DIRS = ["app", "lib", "public", "components", "styles"];

// These files must never be readable or writable — ever
const PROTECTED_BASENAMES = new Set([
  "auth.ts",
  "middleware.ts",
  "admin-auth.ts",
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
]);

function safeResolvePath(relPath: string): string | null {
  const cleaned = relPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const resolved = path.resolve(PROJECT_ROOT, cleaned);

  // Must stay inside project root
  if (!resolved.startsWith(PROJECT_ROOT + path.sep)) return null;

  // Must be inside an allowed top-level directory
  const relative = path.relative(PROJECT_ROOT, resolved);
  const topDir = relative.split(path.sep)[0];
  if (!ALLOWED_DIRS.includes(topDir)) return null;

  // Must not be a protected file
  const basename = path.basename(resolved);
  if (PROTECTED_BASENAMES.has(basename) || basename.startsWith(".env")) return null;

  return resolved;
}

interface TreeNode {
  path: string;
  name: string;
  isDir: boolean;
  ext?: string;
}

function buildTree(absDir: string, relBase: string): TreeNode[] {
  const result: TreeNode[] = [];
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return result;
  }

  for (const e of entries) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === ".next") continue;

    const relPath = relBase ? `${relBase}/${e.name}` : e.name;
    const ext = e.isDirectory() ? undefined : path.extname(e.name).slice(1);

    result.push({ path: relPath, name: e.name, isDir: e.isDirectory(), ext });

    if (e.isDirectory()) {
      result.push(...buildTree(path.join(absDir, e.name), relPath));
    }
  }

  return result;
}

export async function GET(req: NextRequest) {
  if (!EDITOR_ENABLED) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("file");

  if (!filePath) {
    // Return the file tree
    const tree: TreeNode[] = [];
    for (const dir of ALLOWED_DIRS) {
      const absDir = path.join(PROJECT_ROOT, dir);
      if (fs.existsSync(absDir)) {
        tree.push({ path: dir, name: dir, isDir: true });
        tree.push(...buildTree(absDir, dir));
      }
    }
    return NextResponse.json({ tree });
  }

  const absPath = safeResolvePath(filePath);
  if (!absPath) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  if (!fs.existsSync(absPath)) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const stat = fs.statSync(absPath);
  if (stat.isDirectory()) return NextResponse.json({ error: "Path is a directory" }, { status: 400 });
  if (stat.size > 1_000_000) return NextResponse.json({ error: "File exceeds 1 MB limit" }, { status: 413 });

  const content = fs.readFileSync(absPath, "utf-8");
  return NextResponse.json({
    content,
    size: stat.size,
    modified: stat.mtime.toISOString(),
  });
}

export async function POST(req: NextRequest) {
  if (!EDITOR_ENABLED) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json() as { filePath?: unknown; content?: unknown };

  if (typeof body.filePath !== "string" || typeof body.content !== "string") {
    return NextResponse.json({ error: "filePath and content are required strings" }, { status: 400 });
  }

  const absPath = safeResolvePath(body.filePath);
  if (!absPath) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  // Only allow overwriting existing files — no creating new files via this editor
  if (!fs.existsSync(absPath)) {
    return NextResponse.json({ error: "File not found — create files via the file manager" }, { status: 404 });
  }

  const stat = fs.statSync(absPath);
  if (stat.isDirectory()) return NextResponse.json({ error: "Path is a directory" }, { status: 400 });

  fs.writeFileSync(absPath, body.content, "utf-8");
  return NextResponse.json({ success: true });
}
