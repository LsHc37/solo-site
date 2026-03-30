import { NextRequest, NextResponse } from "next/server";
import { parsePaginationParams, getPaginationOffset, getPaginationMeta } from "@/lib/pagination";
import { requireAdmin } from "@/lib/admin-auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  getAllEmployees,
  getEmployeeById,
  getAllPermissions,
  generateEmployeeNumber,
} from "@/lib/employees";

// GET - Fetch paginated employees with their permissions
export async function GET(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const params = parsePaginationParams(searchParams);
    const { offset, limit } = getPaginationOffset(params.page, params.limit);

    // Get total count
    const countResult = db.prepare("SELECT COUNT(*) as count FROM employees").get() as { count: number };
    const total = countResult.count;

    // Get paginated employees
    const rows = db
      .prepare(
        `SELECT e.*, u.email 
         FROM employees e 
         JOIN users u ON e.user_id = u.id 
         ORDER BY e.last_name, e.first_name
         LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as any[];

    // Load permissions for each employee
    const employees = [];
    for (const employee of rows) {
      const permissions = db
        .prepare(
          `SELECT p.code 
           FROM employee_permissions ep
           JOIN permissions p ON ep.permission_id = p.id
           WHERE ep.employee_id = ?`
        )
        .all(employee.id) as { code: string }[];

      employee.permissions = permissions.map(p => p.code);
      employees.push(employee);
    }

    const permissions = getAllPermissions();
    const meta = getPaginationMeta(params.page, limit, total);

    return NextResponse.json({
      ok: true,
      data: employees,
      permissions,
      meta,
    });
  } catch (err) {
    console.error("GET /api/admin/employees error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      position,
      hourly_rate,
      hire_date,
      permissions,
      notes,
    } = body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email.toLowerCase().trim()) as { id: number } | undefined;

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create user account
    const hashedPassword = await bcrypt.hash(password, 12);
    const userResult = db
      .prepare(
        "INSERT INTO users (email, password, role) VALUES (?, ?, 'employee')"
      )
      .run(email.toLowerCase().trim(), hashedPassword);

    const userId = userResult.lastInsertRowid as number;

    // Generate employee number
    const employeeNumber = generateEmployeeNumber();

    // Create employee record
    const employeeResult = db
      .prepare(
        `INSERT INTO employees (
          user_id, employee_number, first_name, last_name, 
          phone, position, hourly_rate, hire_date, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
      )
      .run(
        userId,
        employeeNumber,
        first_name,
        last_name,
        phone || "",
        position || "Employee",
        hourly_rate || 0,
        hire_date || new Date().toISOString(),
        notes || ""
      );

    const employeeId = employeeResult.lastInsertRowid as number;

    // Assign permissions
    if (Array.isArray(permissions) && permissions.length > 0) {
      const stmt = db.prepare(
        `INSERT INTO employee_permissions (employee_id, permission_id) 
         VALUES (?, (SELECT id FROM permissions WHERE code = ?))`
      );

      for (const permCode of permissions) {
        try {
          stmt.run(employeeId, permCode);
        } catch (e) {
          console.error(`Failed to assign permission ${permCode}:`, e);
        }
      }
    }

    const newEmployee = getEmployeeById(employeeId);

    return NextResponse.json({
      success: true,
      employee: newEmployee,
    });
  } catch (err) {
    console.error("POST /api/admin/employees error:", err);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

// PATCH - Update employee
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const {
      id,
      first_name,
      last_name,
      phone,
      position,
      hourly_rate,
      status,
      notes,
      permissions,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID required" },
        { status: 400 }
      );
    }

    // Update employee record
    db.prepare(
      `UPDATE employees SET 
        first_name = ?, 
        last_name = ?, 
        phone = ?, 
        position = ?, 
        hourly_rate = ?, 
        status = ?,
        notes = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?`
    ).run(
      first_name,
      last_name,
      phone || "",
      position || "Employee",
      hourly_rate || 0,
      status || "active",
      notes || "",
      id
    );

    // Update permissions if provided
    if (Array.isArray(permissions)) {
      // Remove all existing permissions
      db.prepare("DELETE FROM employee_permissions WHERE employee_id = ?").run(
        id
      );

      // Add new permissions
      if (permissions.length > 0) {
        const stmt = db.prepare(
          `INSERT INTO employee_permissions (employee_id, permission_id) 
           VALUES (?, (SELECT id FROM permissions WHERE code = ?))`
        );

        for (const permCode of permissions) {
          try {
            stmt.run(id, permCode);
          } catch (e) {
            console.error(`Failed to assign permission ${permCode}:`, e);
          }
        }
      }
    }

    const updatedEmployee = getEmployeeById(id);

    return NextResponse.json({
      success: true,
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error("PATCH /api/admin/employees error:", err);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

// DELETE - Remove employee
export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID required" },
        { status: 400 }
      );
    }

    // Get employee to find user_id
    const employee = db
      .prepare("SELECT user_id FROM employees WHERE id = ?")
      .get(id) as { user_id: number } | undefined;

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Delete employee (cascade will handle permissions, time entries, sales)
    db.prepare("DELETE FROM employees WHERE id = ?").run(id);

    // Delete associated user account
    db.prepare("DELETE FROM users WHERE id = ?").run(employee.user_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/employees error:", err);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
