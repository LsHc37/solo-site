import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { getAllPermissions, applyDefaultPermissions, grantPermission, type UserRole } from "@/lib/rbac";
import crypto from "crypto";

// Generate a secure random password
function generateSecurePassword(length: number = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const randomBytes = crypto.randomBytes(length);
  let password = "";
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

// Generate a unique employee number
function generateEmployeeNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `EMP${timestamp}${random}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = db
      .prepare("SELECT role FROM users WHERE email = ?")
      .get(session.user.email!) as { role: string } | undefined;

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      role,
      position,
      hourlyRate,
      phone,
      permissions, // array of permission codes
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, role" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ["admin", "manager", "staff", "user"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if email already exists
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email.toLowerCase());

    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Generate temporary password
    const temporaryPassword = generateSecurePassword(16);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    // Create user with must_change_password flag
    const userResult = db
      .prepare(
        `INSERT INTO users (email, password, role, employment_status, must_change_password)
         VALUES (?, ?, ?, 'active', 1)`
      )
      .run(email.toLowerCase(), hashedPassword, role);

    const userId = userResult.lastInsertRowid as number;

    // Generate employee number
    const employeeNumber = generateEmployeeNumber();

    // Create employee record
    const employeeResult = db
      .prepare(
        `INSERT INTO employees (user_id, employee_number, first_name, last_name, phone, position, hourly_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        userId,
        employeeNumber,
        firstName,
        lastName,
        phone || "",
        position || "Employee",
        hourlyRate || 0.0
      );

    const employeeId = employeeResult.lastInsertRowid as number;

    // Apply default permissions based on role
    applyDefaultPermissions(employeeId, role);

    // Apply additional custom permissions if provided
    if (permissions && Array.isArray(permissions)) {
      for (const permissionCode of permissions) {
        grantPermission(employeeId, permissionCode);
      }
    }

    // Get all permissions for the employee
    const employeePermissions = db
      .prepare(
        `SELECT p.code, p.name FROM permissions p
         INNER JOIN employee_permissions ep ON p.id = ep.permission_id
         WHERE ep.employee_id = ?
         ORDER BY p.category, p.name`
      )
      .all(employeeId) as { code: string; name: string }[];

    return NextResponse.json({
      success: true,
      employee: {
        id: employeeId,
        userId,
        employeeNumber,
        firstName,
        lastName,
        email: email.toLowerCase(),
        role,
        position: position || "Employee",
        hourlyRate: hourlyRate || 0.0,
        phone: phone || "",
        temporaryPassword, // Only returned once
        permissions: employeePermissions,
      },
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all available permissions
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = db
      .prepare("SELECT role FROM users WHERE email = ?")
      .get(session.user.email!) as { role: string } | undefined;

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const permissions = getAllPermissions();

    // Group by category
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return NextResponse.json({ permissions: grouped });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
