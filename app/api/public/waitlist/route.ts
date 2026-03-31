import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

interface WaitlistPayload {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function getIpAddress(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "";
  }
  return req.headers.get("x-real-ip") ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WaitlistPayload;

    const name = normalize(body.name);
    const email = normalize(body.email).toLowerCase();
    const phoneRaw = normalize(body.phone);
    const phoneDigits = normalizePhoneDigits(phoneRaw);

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email && !phoneDigits) {
      return NextResponse.json({ error: "Provide an email or phone number" }, { status: 400 });
    }

    if (email && !looksLikeEmail(email)) {
      return NextResponse.json({ error: "Email format is invalid" }, { status: 400 });
    }

    if (phoneDigits && phoneDigits.length < 7) {
      return NextResponse.json({ error: "Phone number looks too short" }, { status: 400 });
    }

    db.prepare(
      `
      INSERT INTO waitlist_submissions (
        platform,
        name,
        email,
        phone,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
    ).run(
      "ios",
      name,
      email || null,
      phoneDigits || null,
      getIpAddress(req),
      req.headers.get("user-agent") ?? "",
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to submit waitlist form" }, { status: 500 });
  }
}
