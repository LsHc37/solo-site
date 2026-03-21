import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { updateEmploymentStatus, getUserById } from "@/lib/rbac";

interface User {
  id: number;
  email: string;
  role: string;
  employment_status: string;
  must_change_password: number;
  totp_enabled: number;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: number;
  user_id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  position: string;
  status: string;
  hourly_rate: number;
  hire_date: string;
}

// GET - List all staff members
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = db
      .prepare("SELECT role FROM users WHERE email = ?")
      .get(session.user.email!) as { role: string } | undefined;

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get all users with employee data
    const staff = db
      .prepare(
        `SELECT 
          u.id as user_id,
          u.email,
          u.role,
          u.employment_status,
          u.must_change_password,
          u.totp_enabled,
          u.created_at as user_created_at,
          e.id as employee_id,
          e.employee_number,
          e.first_name,
          e.last_name,
          e.phone,
          e.position,
          e.status,
          e.hourly_rate,
          e.hire_date
        FROM users u
        LEFT JOIN employees e ON u.id = e.user_id
        WHERE u.role IN ('admin', 'manager', 'staff')
        ORDER BY u.created_at DESC`
      )
      .all() as any[];

    // Get permissions for each employee
    const staffWithPermissions = staff.map((member) => {
      if (member.employee_id) {
        const permissions = db
          .prepare(
            `SELECT p.code, p.name FROM permissions p
             INNER JOIN employee_permissions ep ON p.id = ep.permission_id
             WHERE ep.employee_id = ?`
          )
          .all(member.employee_id) as { code: string; name: string }[];

        return {
          ...member,
          permissions: permissions.map((p) => p.code),
          permissionNames: permissions.map((p) => p.name),
        };
      }
      return { ...member, permissions: [], permissionNames: [] };
    });

    return NextResponse.json({ staff: staffWithPermissions });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Update staff member (suspend, terminate, update permissions)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = db
      .prepare("SELECT role FROM users WHERE email = ?")
      .get(session.user.email!) as { role: string } | undefined;

    if (adminUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, permissions } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const targetUser = getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from suspending/terminating themselves
    if (targetUser.email === session.user.email && (action === "suspend" || action === "terminate")) {
      return NextResponse.json(
        { error: "You cannot suspend or terminate your own account" },
        { status: 400 }
      );
    }

    switch (action) {
      case "suspend":
        // Update employment status to suspended
        updateEmploymentStatus(userId, "suspended");
        
        // Revoke active sessions by incrementing password change flag
        // This forces re-authentication
        db.prepare(
          `UPDATE users SET must_change_password = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
        ).run(userId);

        return NextResponse.json({
          success: true,
          message: "User suspended successfully. Active sessions have been revoked.",
        });

      case "terminate":
        // Update employment status to terminated
        updateEmploymentStatus(userId, "terminated");
        
        // Revoke active sessions
        db.prepare(
          `UPDATE users SET must_change_password = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
        ).run(userId);

        // Also update employee status
        db.prepare(
          `UPDATE employees SET status = 'terminated', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE user_id = ?`
        ).run(userId);

        return NextResponse.json({
          success: true,
          message: "Employment terminated successfully. User has been logged out.",
        });

      case "reactivate":
        // Reactivate suspended user
        updateEmploymentStatus(userId, "active");
        
        // Clear password change requirement
        db.prepare(
          `UPDATE users SET must_change_password = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
        ).run(userId);

        // Update employee status
        db.prepare(
          `UPDATE employees SET status = 'active', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE user_id = ?`
        ).run(userId);

        return NextResponse.json({
          success: true,
          message: "User reactivated successfully.",
        });

      case "update_permissions":
        if (!permissions || !Array.isArray(permissions)) {
          return NextResponse.json({ error: "Invalid permissions data" }, { status: 400 });
        }

        // Get employee record
        const employee = db
          .prepare("SELECT id FROM employees WHERE user_id = ?")
          .get(userId) as { id: number } | undefined;

        if (!employee) {
          return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
        }

        // Clear existing permissions
        db.prepare("DELETE FROM employee_permissions WHERE employee_id = ?").run(employee.id);

        // Add new permissions
        const permissionIds = db
          .prepare(`SELECT id, code FROM permissions WHERE code IN (${permissions.map(() => "?").join(",")})`)
          .all(...permissions) as { id: number; code: string }[];

        const insertStmt = db.prepare(
          "INSERT INTO employee_permissions (employee_id, permission_id) VALUES (?, ?)"
        );

        for (const perm of permissionIds) {
          insertStmt.run(employee.id, perm.id);
        }

        return NextResponse.json({
          success: true,
          message: "Permissions updated successfully.",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
