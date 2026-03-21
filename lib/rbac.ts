/**
 * Role-Based Access Control (RBAC) System
 * 
 * This module provides utilities for managing user roles, permissions,
 * and access control throughout the application.
 */

import db from "@/lib/db";

// ── Type Definitions ─────────────────────────────────────────────────────────

export type UserRole = "admin" | "manager" | "staff" | "user";
export type EmploymentStatus = "active" | "suspended" | "terminated";

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  employment_status: EmploymentStatus;
  must_change_password: number; // SQLite boolean (0 or 1)
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
}

export interface UserPermission {
  id: number;
  employee_id: number;
  permission_id: number;
  granted_at: string;
  granted_by: number | null;
}

export interface TimeClockEntry {
  id: number;
  employee_id: number;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ── Role Hierarchy ───────────────────────────────────────────────────────────

/**
 * Role hierarchy levels (higher number = more authority)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  staff: 1,
  user: 0,
};

/**
 * Check if a role has higher or equal authority than another role
 */
export function hasRoleAuthority(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a role can manage another role (must be strictly higher)
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Get all roles that a user can manage
 */
export function getManagedRoles(userRole: UserRole): UserRole[] {
  const userLevel = ROLE_HIERARCHY[userRole];
  return (Object.entries(ROLE_HIERARCHY) as [UserRole, number][])
    .filter(([, level]) => level < userLevel)
    .map(([role]) => role);
}

// ── User Status Checks ───────────────────────────────────────────────────────

/**
 * Check if a user's employment status allows access
 */
export function isEmploymentActive(status: EmploymentStatus): boolean {
  return status === "active";
}

/**
 * Check if a user needs to change their password
 */
export function mustChangePassword(user: User): boolean {
  return user.must_change_password === 1;
}

/**
 * Validate user can access the system
 */
export function canAccessSystem(user: User): {
  allowed: boolean;
  reason?: string;
} {
  if (!isEmploymentActive(user.employment_status)) {
    return {
      allowed: false,
      reason: `Account ${user.employment_status}. Please contact an administrator.`,
    };
  }

  if (mustChangePassword(user)) {
    return {
      allowed: false,
      reason: "You must change your password before accessing the system.",
    };
  }

  return { allowed: true };
}

// ── Permission Management ────────────────────────────────────────────────────

/**
 * Get all permissions for an employee
 */
export function getEmployeePermissions(employeeId: number): Permission[] {
  const permissions = db
    .prepare(
      `SELECT p.* FROM permissions p
       INNER JOIN employee_permissions ep ON p.id = ep.permission_id
       WHERE ep.employee_id = ?`
    )
    .all(employeeId) as Permission[];
  
  return permissions;
}

/**
 * Check if an employee has a specific permission
 */
export function hasPermission(employeeId: number, permissionCode: string): boolean {
  const result = db
    .prepare(
      `SELECT COUNT(*) as count FROM employee_permissions ep
       INNER JOIN permissions p ON ep.permission_id = p.id
       WHERE ep.employee_id = ? AND p.code = ?`
    )
    .get(employeeId, permissionCode) as { count: number };
  
  return result.count > 0;
}

/**
 * Check if an employee has any of the specified permissions
 */
export function hasAnyPermission(employeeId: number, permissionCodes: string[]): boolean {
  if (permissionCodes.length === 0) return false;
  
  const placeholders = permissionCodes.map(() => "?").join(",");
  const result = db
    .prepare(
      `SELECT COUNT(*) as count FROM employee_permissions ep
       INNER JOIN permissions p ON ep.permission_id = p.id
       WHERE ep.employee_id = ? AND p.code IN (${placeholders})`
    )
    .get(employeeId, ...permissionCodes) as { count: number };
  
  return result.count > 0;
}

/**
 * Check if an employee has all specified permissions
 */
export function hasAllPermissions(employeeId: number, permissionCodes: string[]): boolean {
  if (permissionCodes.length === 0) return true;
  
  const placeholders = permissionCodes.map(() => "?").join(",");
  const result = db
    .prepare(
      `SELECT COUNT(DISTINCT p.code) as count FROM employee_permissions ep
       INNER JOIN permissions p ON ep.permission_id = p.id
       WHERE ep.employee_id = ? AND p.code IN (${placeholders})`
    )
    .get(employeeId, ...permissionCodes) as { count: number };
  
  return result.count === permissionCodes.length;
}

/**
 * Grant a permission to an employee
 */
export function grantPermission(
  employeeId: number,
  permissionCode: string,
  grantedBy?: number
): boolean {
  try {
    const permission = db
      .prepare("SELECT id FROM permissions WHERE code = ?")
      .get(permissionCode) as { id: number } | undefined;
    
    if (!permission) {
      return false;
    }

    db.prepare(
      `INSERT OR IGNORE INTO employee_permissions (employee_id, permission_id, granted_by)
       VALUES (?, ?, ?)`
    ).run(employeeId, permission.id, grantedBy ?? null);
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Revoke a permission from an employee
 */
export function revokePermission(employeeId: number, permissionCode: string): boolean {
  try {
    const permission = db
      .prepare("SELECT id FROM permissions WHERE code = ?")
      .get(permissionCode) as { id: number } | undefined;
    
    if (!permission) {
      return false;
    }

    db.prepare(
      `DELETE FROM employee_permissions 
       WHERE employee_id = ? AND permission_id = ?`
    ).run(employeeId, permission.id);
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all available permissions
 */
export function getAllPermissions(): Permission[] {
  return db.prepare("SELECT * FROM permissions ORDER BY category, name").all() as Permission[];
}

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(category: string): Permission[] {
  return db
    .prepare("SELECT * FROM permissions WHERE category = ? ORDER BY name")
    .all(category) as Permission[];
}

// ── Role-Based Default Permissions ───────────────────────────────────────────

/**
 * Get default permissions for a role
 */
export function getDefaultPermissionsForRole(role: UserRole): string[] {
  const defaults: Record<UserRole, string[]> = {
    admin: ["full_admin", "access_admin_portal", "view_audit_logs"],
    manager: [
      "access_admin_portal",
      "view_employees",
      "view_all_time",
      "view_all_sales",
      "view_reports",
      "edit_site",
      "manage_content",
      "respond_posts",
      "moderate_posts",
    ],
    staff: [
      "clock_inout",
      "view_own_time",
      "log_sales",
      "view_own_sales",
      "view_posts",
    ],
    user: ["view_posts"],
  };

  return defaults[role] || [];
}

/**
 * Apply default permissions to an employee based on their role
 */
export function applyDefaultPermissions(employeeId: number, role: UserRole, grantedBy?: number): void {
  const permissions = getDefaultPermissionsForRole(role);
  for (const permissionCode of permissions) {
    grantPermission(employeeId, permissionCode, grantedBy);
  }
}

// ── User Management ──────────────────────────────────────────────────────────

/**
 * Get user by ID
 */
export function getUserById(userId: number): User | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | undefined {
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase()) as User | undefined;
}

/**
 * Update user role
 */
export function updateUserRole(userId: number, newRole: UserRole): boolean {
  try {
    db.prepare(
      `UPDATE users SET role = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
    ).run(newRole, userId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Update user employment status
 */
export function updateEmploymentStatus(userId: number, status: EmploymentStatus): boolean {
  try {
    db.prepare(
      `UPDATE users SET employment_status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
    ).run(status, userId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Set password change requirement
 */
export function setMustChangePassword(userId: number, required: boolean): boolean {
  try {
    db.prepare(
      `UPDATE users SET must_change_password = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
    ).run(required ? 1 : 0, userId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear password change requirement (after successful password change)
 */
export function clearMustChangePassword(userId: number): boolean {
  return setMustChangePassword(userId, false);
}

// ── Time Clock Operations ────────────────────────────────────────────────────

/**
 * Get current active clock entry for an employee
 */
export function getActiveClockEntry(employeeId: number): TimeClockEntry | undefined {
  return db
    .prepare(
      `SELECT * FROM time_entries 
       WHERE employee_id = ? AND clock_out IS NULL 
       ORDER BY clock_in DESC LIMIT 1`
    )
    .get(employeeId) as TimeClockEntry | undefined;
}

/**
 * Check if an employee is currently clocked in
 */
export function isClockedIn(employeeId: number): boolean {
  return getActiveClockEntry(employeeId) !== undefined;
}

/**
 * Clock in an employee
 */
export function clockIn(employeeId: number, notes: string = ""): TimeClockEntry | null {
  try {
    // Check if already clocked in
    if (isClockedIn(employeeId)) {
      return null;
    }

    const result = db
      .prepare(
        `INSERT INTO time_entries (employee_id, clock_in, notes)
         VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ?)`
      )
      .run(employeeId, notes);

    return db
      .prepare("SELECT * FROM time_entries WHERE id = ?")
      .get(result.lastInsertRowid) as TimeClockEntry;
  } catch {
    return null;
  }
}

/**
 * Clock out an employee
 */
export function clockOut(employeeId: number, breakMinutes: number = 0): TimeClockEntry | null {
  try {
    const activeEntry = getActiveClockEntry(employeeId);
    if (!activeEntry) {
      return null;
    }

    db.prepare(
      `UPDATE time_entries 
       SET clock_out = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
           break_minutes = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`
    ).run(breakMinutes, activeEntry.id);

    return db
      .prepare("SELECT * FROM time_entries WHERE id = ?")
      .get(activeEntry.id) as TimeClockEntry;
  } catch {
    return null;
  }
}

/**
 * Get time entries for an employee within a date range
 */
export function getTimeEntries(
  employeeId: number,
  startDate?: string,
  endDate?: string
): TimeClockEntry[] {
  let query = "SELECT * FROM time_entries WHERE employee_id = ?";
  const params: any[] = [employeeId];

  if (startDate) {
    query += " AND clock_in >= ?";
    params.push(startDate);
  }

  if (endDate) {
    query += " AND clock_in <= ?";
    params.push(endDate);
  }

  query += " ORDER BY clock_in DESC";

  return db.prepare(query).all(...params) as TimeClockEntry[];
}
