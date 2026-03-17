import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignEmployeeToDepartment,
  removeEmployeeFromDepartment,
  createAuditLog,
} from "@/lib/enterprise";
import { getAllEmployees } from "@/lib/employees";

// GET - Fetch all departments or department by ID
export async function GET(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const department = getDepartmentById(parseInt(id));
      if (!department) {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ department });
    }

    const departments = getAllDepartments();
    const employees = getAllEmployees();

    return NextResponse.json({ departments, employees });
  } catch (err) {
    console.error("GET /api/admin/enterprise/departments error:", err);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

// POST - Create new department
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, description, manager_id, budget } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 }
      );
    }

    const department = createDepartment({
      name,
      description,
      manager_id,
      budget,
    });

    createAuditLog({
      user_id: session?.user?.id ? parseInt(session.user.id as any) : undefined,
      action: "CREATE_DEPARTMENT",
      entity_type: "department",
      entity_id: department.id,
      changes: JSON.stringify({ name, description, manager_id, budget }),
    });

    return NextResponse.json({ success: true, department });
  } catch (err: any) {
    console.error("POST /api/admin/enterprise/departments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create department" },
      { status: 500 }
    );
  }
}

// PATCH - Update department
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }

    const department = updateDepartment(id, updateData);

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    createAuditLog({
      user_id: session?.user?.id ? parseInt(session.user.id as any) : undefined,
      action: "UPDATE_DEPARTMENT",
      entity_type: "department",
      entity_id: id,
      changes: JSON.stringify(updateData),
    });

    return NextResponse.json({ success: true, department });
  } catch (err) {
    console.error("PATCH /api/admin/enterprise/departments error:", err);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

// DELETE - Remove department
export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }

    const success = deleteDepartment(parseInt(id));

    if (!success) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    createAuditLog({
      user_id: session?.user?.id ? parseInt(session.user.id as any) : undefined,
      action: "DELETE_DEPARTMENT",
      entity_type: "department",
      entity_id: parseInt(id),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/enterprise/departments error:", err);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
