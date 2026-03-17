import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

type CommunityKind = "question" | "review";

interface CommunityPostRow {
  id: number;
  kind: CommunityKind;
  author_name: string;
  message: string;
  created_at: string;
}

interface CreatePostBody {
  kind?: string;
  authorName?: string;
  message?: string;
}

const VALID_KINDS = new Set<CommunityKind>(["question", "review"]);

function normalizeText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kindParam = url.searchParams.get("kind");

  try {
    if (kindParam && VALID_KINDS.has(kindParam as CommunityKind)) {
      const rows = db
        .prepare(
          "SELECT id, kind, author_name, message, created_at FROM community_posts WHERE kind = ? ORDER BY created_at DESC LIMIT 50",
        )
        .all(kindParam) as CommunityPostRow[];

      return NextResponse.json({ posts: rows });
    }

    const rows = db
      .prepare(
        "SELECT id, kind, author_name, message, created_at FROM community_posts ORDER BY created_at DESC LIMIT 50",
      )
      .all() as CommunityPostRow[];

    return NextResponse.json({ posts: rows });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  let body: CreatePostBody;

  try {
    body = (await request.json()) as CreatePostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const kind = (body.kind ?? "").toLowerCase() as CommunityKind;
  const authorName = normalizeText(String(body.authorName ?? ""), 60);
  const message = normalizeText(String(body.message ?? ""), 500);

  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: "kind must be 'question' or 'review'." }, { status: 400 });
  }

  if (authorName.length < 2) {
    return NextResponse.json({ error: "authorName must be at least 2 characters." }, { status: 400 });
  }

  if (message.length < 8) {
    return NextResponse.json({ error: "message must be at least 8 characters." }, { status: 400 });
  }

  try {
    const insert = db.prepare(
      "INSERT INTO community_posts (kind, author_name, message) VALUES (?, ?, ?)",
    );
    const result = insert.run(kind, authorName, message);

    const created = db
      .prepare(
        "SELECT id, kind, author_name, message, created_at FROM community_posts WHERE id = ?",
      )
      .get(result.lastInsertRowid) as CommunityPostRow | undefined;

    return NextResponse.json({ post: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create post." }, { status: 500 });
  }
}
