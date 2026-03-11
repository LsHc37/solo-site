import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "users.db");

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// ── Users table ──────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'user',
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

// Safe migration: add role column to existing databases
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
} catch { /* column already exists */ }

// ── Content blocks ────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS content_blocks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    key        TEXT    NOT NULL UNIQUE,
    value      TEXT    NOT NULL,
    label      TEXT    NOT NULL DEFAULT '',
    section    TEXT    NOT NULL DEFAULT 'general',
    updated_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

// ── Site settings ─────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS site_settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

// ── Announcements ─────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS announcements (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    message    TEXT    NOT NULL,
    active     INTEGER NOT NULL DEFAULT 1,
    color      TEXT    NOT NULL DEFAULT '#00F0FF',
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

// ── Auth security tables ─────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS auth_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event       TEXT    NOT NULL,
    email       TEXT,
    ip          TEXT,
    success     INTEGER NOT NULL DEFAULT 0,
    reason      TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS auth_lockouts (
    key_type     TEXT NOT NULL,
    key_value    TEXT NOT NULL,
    blocked_until TEXT NOT NULL,
    reason       TEXT NOT NULL DEFAULT '',
    updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (key_type, key_value)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_auth_events_email_created_at
  ON auth_events (email, created_at)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_auth_events_ip_created_at
  ON auth_events (ip, created_at)
`);

// ── Seed default site settings ────────────────────────────────────────────────
const seedSettings: [string, string][] = [
  ["site_name", "Retro Gigz"],
  ["tagline", "Digital Independence."],
  ["primary_color", "#00F0FF"],
  ["bg_color", "#0D1117"],
  ["maintenance_mode", "false"],
  ["announcement_active", "false"],
  ["announcement_text", ""],
  ["announcement_color", "#00F0FF"],
  ["meta_description", "A master publisher building privacy-first applications, independent games, and tactical apparel."],
  ["contact_email", ""],
];
const insertSetting = db.prepare(
  `INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)`
);
for (const [key, value] of seedSettings) {
  insertSetting.run(key, value);
}

export default db;
