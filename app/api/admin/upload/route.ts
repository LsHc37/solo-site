import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData();
  const dir = (formData.get("dir") as string | null) ?? "";
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Resolve and validate target directory
  const targetDir = path.resolve(PUBLIC_DIR, dir.replace(/^\/+/, ""));
  if (!targetDir.startsWith(PUBLIC_DIR + path.sep) && targetDir !== PUBLIC_DIR) {
    return NextResponse.json({ error: "Invalid directory" }, { status: 400 });
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const uploaded: string[] = [];
  for (const file of files) {
    // Sanitize: strip any directory component from the filename
    const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._\-]/g, "_");
    const dest = path.join(targetDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    uploaded.push(safeName);
  }

  return NextResponse.json({ success: true, uploaded });
}
