import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { authConfig } from "@/auth.config";

interface DbUser {
  id: number;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

const EMAIL_FAILURE_WINDOW_MIN = 15;
const IP_FAILURE_WINDOW_MIN = 10;
const EMAIL_FAILURE_THRESHOLD = 5;
const IP_FAILURE_THRESHOLD = 10;
const LOCKOUT_MIN = 15;

function nowIso() {
  return new Date().toISOString();
}

function minutesAgoIso(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function minutesFromNowIso(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function getClientIp(req: Request | undefined) {
  if (!req) return "unknown";

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

function logAuthEvent(event: string, email: string, ip: string, success: boolean, reason = "") {
  db.prepare(
    `INSERT INTO auth_events (event, email, ip, success, reason)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(event, email, ip, success ? 1 : 0, reason);
}

function isLocked(keyType: "email" | "ip", keyValue: string) {
  const row = db
    .prepare(
      `SELECT blocked_until
       FROM auth_lockouts
       WHERE key_type = ? AND key_value = ?`,
    )
    .get(keyType, keyValue) as { blocked_until: string } | undefined;

  if (!row) return false;
  return row.blocked_until > nowIso();
}

function setLock(keyType: "email" | "ip", keyValue: string, reason: string) {
  db.prepare(
    `INSERT INTO auth_lockouts (key_type, key_value, blocked_until, reason, updated_at)
     VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
     ON CONFLICT(key_type, key_value)
     DO UPDATE SET
       blocked_until = excluded.blocked_until,
       reason = excluded.reason,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
  ).run(keyType, keyValue, minutesFromNowIso(LOCKOUT_MIN), reason);
}

function clearLocks(email: string, ip: string) {
  db.prepare("DELETE FROM auth_lockouts WHERE key_type = 'email' AND key_value = ?").run(email);
  db.prepare("DELETE FROM auth_lockouts WHERE key_type = 'ip' AND key_value = ?").run(ip);
}

function recentFailureCountByEmail(email: string) {
  const row = db
    .prepare(
      `SELECT COUNT(*) as count
       FROM auth_events
       WHERE event = 'login_failed'
         AND email = ?
         AND created_at >= ?`,
    )
    .get(email, minutesAgoIso(EMAIL_FAILURE_WINDOW_MIN)) as { count: number };
  return row.count;
}

function recentFailureCountByIp(ip: string) {
  const row = db
    .prepare(
      `SELECT COUNT(*) as count
       FROM auth_events
       WHERE event = 'login_failed'
         AND ip = ?
         AND created_at >= ?`,
    )
    .get(ip, minutesAgoIso(IP_FAILURE_WINDOW_MIN)) as { count: number };
  return row.count;
}

async function slowDown() {
  await new Promise((resolve) => setTimeout(resolve, 800));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        const ip = getClientIp(request);

        if (!email || !password) {
          logAuthEvent("login_failed", email ?? "", ip, false, "missing_credentials");
          await slowDown();
          return null;
        }

        if (isLocked("ip", ip)) {
          logAuthEvent("login_blocked", email, ip, false, "ip_locked");
          await slowDown();
          return null;
        }

        if (isLocked("email", email)) {
          logAuthEvent("login_blocked", email, ip, false, "email_locked");
          await slowDown();
          return null;
        }

        const existing = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(email) as DbUser | undefined;

        if (!existing) {
          const ipFailures = recentFailureCountByIp(ip);
          if (ipFailures >= IP_FAILURE_THRESHOLD) {
            setLock("ip", ip, "too_many_failures_ip");
            logAuthEvent("login_blocked", email, ip, false, "ip_threshold_reached");
            await slowDown();
            return null;
          }

          // ── New user: hash password and insert ──
          const hashed = await bcrypt.hash(password, 12);
          const result = db
            .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
            .run(email, hashed);

          clearLocks(email, ip);
          logAuthEvent("signup_success", email, ip, true, "created_via_credentials");

          return {
            id: String(result.lastInsertRowid),
            email,
            role: "user",
          };
        }

        // ── Existing user: verify password ──
        const valid = await bcrypt.compare(password, existing.password);
        if (!valid) {
          logAuthEvent("login_failed", email, ip, false, "invalid_password");

          const emailFailures = recentFailureCountByEmail(email);
          if (emailFailures >= EMAIL_FAILURE_THRESHOLD) {
            setLock("email", email, "too_many_failures_email");
          }

          const ipFailures = recentFailureCountByIp(ip);
          if (ipFailures >= IP_FAILURE_THRESHOLD) {
            setLock("ip", ip, "too_many_failures_ip");
          }

          await slowDown();
          return null;
        }

        clearLocks(email, ip);
        logAuthEvent("login_success", email, ip, true, "");

        return {
          id: String(existing.id),
          email: existing.email,
          role: existing.role ?? "user",
        };
      },
    }),
  ],
});
