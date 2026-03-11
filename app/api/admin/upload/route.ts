import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const MAX_FILES_PER_REQUEST = 20;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "avif",
  "pdf", "txt", "md", "csv", "json",
  "mp4", "webm", "mp3", "wav",
  "zip",
]);

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/x-icon",
  "image/avif",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "application/zip",
  "application/x-zip-compressed",
]);

function ext(name: string) {
  const e = path.extname(name).toLowerCase();
  return e.startsWith(".") ? e.slice(1) : e;
}

function makeUniqueFilename(targetDir: string, filename: string) {
  const parsed = path.parse(filename);
  const base = parsed.name || "file";
  const extension = parsed.ext;
  let candidate = `${base}${extension}`;
  let counter = 1;

  while (fs.existsSync(path.join(targetDir, candidate))) {
    candidate = `${base}-${counter}${extension}`;
    counter += 1;
  }

  return candidate;
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData();
  const dir = (formData.get("dir") as string | null) ?? "";
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files per upload.` },
      { status: 400 },
    );
  }

  // Resolve and validate target directory
  const targetDir = path.resolve(PUBLIC_DIR, dir.replace(/^\/+/, ""));
  if (!targetDir.startsWith(PUBLIC_DIR + path.sep) && targetDir !== PUBLIC_DIR) {
    return NextResponse.json({ error: "Invalid directory" }, { status: 400 });
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const uploaded: string[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    if (!(file instanceof File)) {
      rejected.push("invalid_file_entry");
      continue;
    }

    // Sanitize: strip any directory component from the filename
    const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._\-]/g, "_");
    const fileExt = ext(safeName);

    if (!ALLOWED_EXTENSIONS.has(fileExt)) {
      rejected.push(`${safeName}: unsupported file extension`);
      continue;
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      rejected.push(`${safeName}: unsupported content type`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      rejected.push(`${safeName}: file exceeds 10 MB limit`);
      continue;
    }

    const uniqueName = makeUniqueFilename(targetDir, safeName);
    const dest = path.join(targetDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    uploaded.push(uniqueName);
  }

  if (uploaded.length === 0) {
    return NextResponse.json(
      { error: "No files were uploaded", rejected },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, uploaded, rejected });
}
