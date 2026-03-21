import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "users.db");

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// ── Users table ──────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    email               TEXT    NOT NULL UNIQUE,
    password            TEXT    NOT NULL,
    role                TEXT    NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'user')),
    employment_status   TEXT    NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'suspended', 'terminated')),
    must_change_password INTEGER NOT NULL DEFAULT 0,
    created_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

// Safe migrations: add new columns to existing databases
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
} catch { /* column already exists */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN employment_status TEXT NOT NULL DEFAULT 'active'`);
} catch { /* column already exists */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0`);
} catch { /* column already exists */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`);
} catch { /* column already exists */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN totp_secret TEXT`);
} catch { /* column already exists */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0`);
} catch { /* column already exists */ }

// Create index for role-based queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_employment_status ON users(employment_status)
`);

// ── Employees table ─────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE,
    employee_number TEXT    NOT NULL UNIQUE,
    first_name      TEXT    NOT NULL,
    last_name       TEXT    NOT NULL,
    phone           TEXT    NOT NULL DEFAULT '',
    hire_date       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    position        TEXT    NOT NULL DEFAULT 'Employee',
    status          TEXT    NOT NULL DEFAULT 'active',
    hourly_rate     REAL    NOT NULL DEFAULT 0.0,
    notes           TEXT    NOT NULL DEFAULT '',
    created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status)
`);

// ── Permissions table ───────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS permissions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT    NOT NULL UNIQUE,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    category    TEXT    NOT NULL DEFAULT 'general',
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

// ── Employee permissions table ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS employee_permissions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    granted_by    INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES employees(id),
    UNIQUE(employee_id, permission_id)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_employee_permissions_employee 
  ON employee_permissions(employee_id)
`);

// ── Time entries table ──────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS time_entries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    clock_in    TEXT    NOT NULL,
    clock_out   TEXT,
    break_minutes INTEGER NOT NULL DEFAULT 0,
    notes       TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_time_entries_employee_clock_in
  ON time_entries(employee_id, clock_in DESC)
`);

// ── Sales table ─────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    sale_date     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    customer_name TEXT    NOT NULL DEFAULT '',
    product_name  TEXT    NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1,
    unit_price    REAL    NOT NULL,
    total_amount  REAL    NOT NULL,
    payment_method TEXT   NOT NULL DEFAULT 'cash',
    notes         TEXT    NOT NULL DEFAULT '',
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sales_employee_date
  ON sales(employee_id, sale_date DESC)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sales_date
  ON sales(sale_date DESC)
`);

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

// ── Community posts (questions + reviews) ───────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS community_posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    kind        TEXT    NOT NULL CHECK (kind IN ('question', 'review')),
    author_name TEXT    NOT NULL,
    message     TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_community_posts_created_at
  ON community_posts (created_at DESC)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_community_posts_kind_created_at
  ON community_posts (kind, created_at DESC)
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

// ── Seed default permissions ─────────────────────────────────────────────────
const seedPermissions: [string, string, string, string][] = [
  // Employee Management
  ['manage_employees', 'Manage Employees', 'Create, edit, and remove employee accounts', 'employees'],
  ['view_employees', 'View Employees', 'View employee information and list', 'employees'],
  ['assign_permissions', 'Assign Permissions', 'Grant and revoke employee permissions', 'employees'],
  
  // Time & Attendance
  ['clock_inout', 'Clock In/Out', 'Record time entries (clock in and clock out)', 'time'],
  ['view_own_time', 'View Own Time', 'View personal time entries', 'time'],
  ['view_all_time', 'View All Time', 'View all employee time entries', 'time'],
  ['edit_time_entries', 'Edit Time Entries', 'Modify time entries for any employee', 'time'],
  
  // Sales
  ['log_sales', 'Log Sales', 'Record sales transactions', 'sales'],
  ['view_own_sales', 'View Own Sales', 'View personal sales records', 'sales'],
  ['view_all_sales', 'View All Sales', 'View all employee sales records', 'sales'],
  ['edit_sales', 'Edit Sales', 'Modify sales records', 'sales'],
  ['delete_sales', 'Delete Sales', 'Remove sales records', 'sales'],
  
  // Reports & Analytics
  ['view_reports', 'View Reports', 'Access reports and analytics', 'reports'],
  ['export_data', 'Export Data', 'Export employee, time, and sales data', 'reports'],
  
  // Site & Content Management
  ['edit_site', 'Edit Site', 'Modify site content, settings, and configuration', 'content'],
  ['view_site_settings', 'View Site Settings', 'View site configuration and settings', 'content'],
  ['manage_content', 'Manage Content', 'Create, edit, and delete site content blocks', 'content'],
  ['manage_files', 'Manage Files', 'Upload, organize, and delete files', 'content'],
  ['publish_content', 'Publish Content', 'Publish and unpublish site content', 'content'],
  
  // Community & Engagement
  ['respond_posts', 'Respond to Posts', 'Reply to community questions and reviews', 'community'],
  ['moderate_posts', 'Moderate Posts', 'Edit or remove community posts', 'community'],
  ['view_posts', 'View Posts', 'View community questions and reviews', 'community'],
  
  // System
  ['full_admin', 'Full Administrator', 'Complete system access and control', 'system'],
  ['access_admin_portal', 'Access Admin Portal', 'Access the administration interface', 'system'],
  ['view_audit_logs', 'View Audit Logs', 'View system audit and security logs', 'system'],
];

const insertPermission = db.prepare(
  `INSERT OR IGNORE INTO permissions (code, name, description, category) VALUES (?, ?, ?, ?)`
);

for (const [code, name, description, category] of seedPermissions) {
  insertPermission.run(code, name, description, category);
}

// ── Seed default site settings ────────────────────────────────────────────────
const seedSettings: [string, string][] = [
  ["site_name", "Retro Gigz"],
  ["tagline", "Digital Independence."],
  ["primary_color", "#00F0FF"],
  ["bg_color", "#0D1117"],
  ["surface_color", "#161B22"],
  ["text_color", "#E6EDF3"],
  ["muted_color", "#8B949E"],
  ["nav_account_label", "Account"],
  ["maintenance_mode", "false"],
  ["announcement_active", "false"],
  ["announcement_text", ""],
  ["announcement_color", "#00F0FF"],
  ["meta_description", "A master publisher building privacy-first applications, independent games, and tactical apparel."],
  ["contact_email", ""],
  ["page_layout_home", ""],
  ["page_layout_solo", ""],
];
const insertSetting = db.prepare(
  `INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)`
);
for (const [key, value] of seedSettings) {
  insertSetting.run(key, value);
}

export default db;
