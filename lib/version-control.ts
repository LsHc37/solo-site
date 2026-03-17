import db from "./db";

export interface Version {
  id: number;
  label: string;
  content: string;
  created_by: string;
  created_at: string;
  is_published: boolean;
  metadata?: string;
}

export interface VersionMetadata {
  page?: string;
  device?: string;
  changeCount?: number;
  description?: string;
}

export class VersionControl {
  static createVersion(label: string, content: Record<string, unknown>, createdBy: string, isPublished: boolean, metadata?: VersionMetadata): number {
    const stmt = db.prepare(`
      INSERT INTO site_versions (label, content, created_by, created_at, is_published, metadata)
      VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ?, ?)
    `);

    const result = stmt.run(
      label,
      JSON.stringify(content),
      createdBy,
      isPublished ? 1 : 0,
      metadata ? JSON.stringify(metadata) : null
    );

    return result.lastInsertRowid as number;
  }

  static getVersions(limit = 50): Version[] {
    const stmt = db.prepare(`
      SELECT id, label, content, created_by, created_at, is_published, metadata
      FROM site_versions
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(limit) as Version[];
  }

  static getVersion(id: number): Version | null {
    const stmt = db.prepare(`
      SELECT id, label, content, created_by, created_at, is_published, metadata
      FROM site_versions
      WHERE id = ?
    `);

    return stmt.get(id) as Version | null;
  }

  static getPublishedVersion(): Version | null {
    const stmt = db.prepare(`
      SELECT id, label, content, created_by, created_at, is_published, metadata
      FROM site_versions
      WHERE is_published = 1
      ORDER BY created_at DESC
      LIMIT 1
    `);

    return stmt.get() as Version | null;
  }

  static publishVersion(id: number): boolean {
    const transaction = db.transaction(() => {
      // Unpublish all versions
      db.prepare("UPDATE site_versions SET is_published = 0").run();
      
      // Publish the selected version
      const stmt = db.prepare("UPDATE site_versions SET is_published = 1 WHERE id = ?");
      stmt.run(id);
    });

    transaction();
    return true;
  }

  static deleteVersion(id: number): boolean {
    // Don't delete published versions
    const version = this.getVersion(id);
    if (!version || version.is_published) {
      return false;
    }

    const stmt = db.prepare("DELETE FROM site_versions WHERE id = ?");
    stmt.run(id);
    return true;
  }

  static pruneOldVersions(keepCount = 100) {
    const stmt = db.prepare(`
      DELETE FROM site_versions
      WHERE id NOT IN (
        SELECT id FROM site_versions
        WHERE is_published = 1
        UNION
        SELECT id FROM site_versions
        ORDER BY created_at DESC
        LIMIT ?
      )
    `);

    stmt.run(keepCount);
  }
}

// Ensure the table exists
export function ensureVersionTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      content TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_published INTEGER DEFAULT 0,
      metadata TEXT,
      UNIQUE(id)
    );
    CREATE INDEX IF NOT EXISTS idx_versions_published ON site_versions(is_published);
    CREATE INDEX IF NOT EXISTS idx_versions_created ON site_versions(created_at DESC);
  `);
}

// Auto-save draft system
export class DraftManager {
  private static DRAFT_KEY = "__draft_autosave__";

  static saveDraft(content: Record<string, unknown>, userId: string): void {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO site_drafts (key, content, user_id, updated_at)
      VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    `);

    stmt.run(this.DRAFT_KEY, JSON.stringify(content), userId);
  }

  static getDraft(): { content: string; updated_at: string; user_id: string } | null {
    const stmt = db.prepare(`
      SELECT content, updated_at, user_id
      FROM site_drafts
      WHERE key = ?
    `);

    return stmt.get(this.DRAFT_KEY) as { content: string; updated_at: string; user_id: string } | null;
  }

  static clearDraft(): void {
    const stmt = db.prepare("DELETE FROM site_drafts WHERE key = ?");
    stmt.run(this.DRAFT_KEY);
  }
}

// Ensure drafts table exists
export function ensureDraftsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_drafts (
      key TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      user_id TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

// Session/lock management for collaborative editing
export class SessionManager {
  static LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  static acquireLock(userId: string, userName: string): boolean {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO editor_sessions (id, user_id, user_name, last_ping)
      VALUES (1, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    `);

    stmt.run(userId, userName);
    return true;
  }

  static getCurrentSession(): { user_id: string; user_name: string; last_ping: string } | null {
    const stmt = db.prepare(`
      SELECT user_id, user_name, last_ping
      FROM editor_sessions
      WHERE id = 1
    `);

    return stmt.get() as { user_id: string; user_name: string; last_ping: string } | null;
  }

  static isLockExpired(session: { last_ping: string }): boolean {
    const lastPing = new Date(session.last_ping).getTime();
    const now = Date.now();
    return now - lastPing > this.LOCK_TIMEOUT_MS;
  }

  static releaseLock(userId: string): void {
    const stmt = db.prepare("DELETE FROM editor_sessions WHERE id = 1 AND user_id = ?");
    stmt.run(userId);
  }
}

export function ensureSessionTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS editor_sessions (
      id INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      last_ping TEXT NOT NULL
    );
  `);
}

// Initialize all tables
export function initializeVersionControl() {
  ensureVersionTable();
  ensureDraftsTable();
  ensureSessionTable();
}
