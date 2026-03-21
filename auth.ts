import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { authConfig } from "@/auth.config";
import { canAccessSystem, type User } from "@/lib/rbac";

const ADMIN_PORTAL_CODE = process.env.ADMIN_PORTAL_CODE ?? "1357";


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
        adminPortalCode: { label: "Admin Portal Code", type: "password" },
        adminLoginIntent: { label: "Admin Login Intent", type: "text" },
        createAccountConsent: { label: "Create Account Consent", type: "text" },
      },
      async authorize(credentials, request) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        const adminPortalCode = (credentials?.adminPortalCode as string | undefined)?.trim();
        const adminLoginIntent = credentials?.adminLoginIntent === "true";
        const createAccountConsent = credentials?.createAccountConsent === "true";
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
          .get(email) as User | undefined;

        if (!existing) {
          if (!createAccountConsent) {
            logAuthEvent("login_failed", email, ip, false, "missing_signup_consent");
            await slowDown();
            return null;
          }

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
            .prepare("INSERT INTO users (email, password, role, employment_status) VALUES (?, ?, 'staff', 'active')")
            .run(email, hashed);

          clearLocks(email, ip);
          logAuthEvent("signup_success", email, ip, true, "created_via_credentials");

        return {
          id: String(result.lastInsertRowid),
          email,
          role: "staff",
          adminPortalAccess: false,
          mustChangePassword: false,
          totpEnabled: false,
        };
        }

        // ── Check employment status and password requirements ──
        const accessCheck = canAccessSystem(existing);
        if (!accessCheck.allowed) {
          logAuthEvent("login_failed", email, ip, false, accessCheck.reason || "access_denied");
          await slowDown();
          return null;
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

        const isAdmin = (existing.role ?? "user") === "admin";
        const wantsAdminPortal = adminLoginIntent || Boolean(adminPortalCode);

        if (wantsAdminPortal) {
          if (!isAdmin) {
            logAuthEvent("admin_login_failed", email, ip, false, "non_admin_account");
            await slowDown();
            return null;
          }

          if (adminPortalCode !== ADMIN_PORTAL_CODE) {
            logAuthEvent("admin_login_failed", email, ip, false, "invalid_portal_code");
            await slowDown();
            return null;
          }
        }

        clearLocks(email, ip);
        logAuthEvent(
          wantsAdminPortal ? "admin_login_success" : "login_success",
          email,
          ip,
          true,
          wantsAdminPortal ? "portal_code_verified" : "",
        );

        return {
          id: String(existing.id),
          email: existing.email,
          role: existing.role ?? "user",
          adminPortalAccess: isAdmin && wantsAdminPortal,
          mustChangePassword: existing.must_change_password === 1,
          totpEnabled: existing.totp_enabled === 1,
        };
      },
    }),
  ],
});
