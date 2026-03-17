import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAllLeaveRequests,
  getEmployeeLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  createAuditLog,
} from "@/lib/enterprise";
import { getAllEmployees } from "@/lib/employees";

// GET - Fetch leave requests
export async function GET(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employee_id");
    const status = searchParams.get("status");

    if (employeeId) {
      const requests = getEmployeeLeaveRequests(parseInt(employeeId));
      return NextResponse.json({ requests });
    }

    const requests = getAllLeaveRequests(status || undefined);
    const employees = getAllEmployees();

    return NextResponse.json({ requests, employees });
  } catch (err) {
    console.error("GET /api/admin/enterprise/leave error:", err);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

// POST - Create leave request
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      days_count,
      reason,
      status,
      comments,
    } = body;

    if (!employee_id || !leave_type || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const request = createLeaveRequest({
      employee_id,
      leave_type,
      start_date,
      end_date,
      days_count: days_count || 1,
      reason: reason || "",
      status: status || "pending",
      comments: comments || "",
    });

    createAuditLog({
      user_id: session?.user?.id ? parseInt(session.user.id as any) : undefined,
      action: "CREATE_LEAVE_REQUEST",
      entity_type: "leave_request",
      entity_id: request.id,
      changes: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, request });
  } catch (err) {
    console.error("POST /api/admin/enterprise/leave error:", err);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}

// PATCH - Approve/reject leave request
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { id, approver_id, comments, action } = body;

    if (!id || !approver_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const request = approveLeaveRequest(id, approver_id, comments);

      createAuditLog({
        user_id: session?.user?.id ? parseInt(session.user.id as any) : undefined,
        action: "APPROVE_LEAVE_REQUEST",
        entity_type: "leave_request",
        entity_id: id,
        changes: JSON.stringify({ approver_id, comments }),
      });

      return NextResponse.json({ success: true, request });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("PATCH /api/admin/enterprise/leave error:", err);
    return NextResponse.json(
      { error: "Failed to update leave request" },
      { status: 500 }
    );
  }
}
