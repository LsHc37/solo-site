import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAllPayrollRecords,
  getEmployeePayrollRecords,
  createPayrollRecord,
  createAuditLog,
} from "@/lib/enterprise";
import { getAllEmployees } from "@/lib/employees";

// GET - Fetch payroll records
export async function GET(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employee_id");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (employeeId) {
      const records = getEmployeePayrollRecords(parseInt(employeeId), limit);
      return NextResponse.json({ records });
    }

    const records = getAllPayrollRecords(limit);
    const employees = getAllEmployees();

    return NextResponse.json({ records, employees });
  } catch (err) {
    console.error("GET /api/admin/enterprise/payroll error:", err);
    return NextResponse.json(
      { error: "Failed to fetch payroll records" },
      { status: 500 }
    );
  }
}

// POST - Create payroll record
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const {
      employee_id,
      pay_period_start,
      pay_period_end,
      regular_hours,
      overtime_hours,
      gross_pay,
      deductions,
      net_pay,
      bonus,
      status,
      paid_date,
      notes,
    } = body;

    if (!employee_id || !pay_period_start || !pay_period_end) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const record = createPayrollRecord({
      employee_id,
      pay_period_start,
      pay_period_end,
      regular_hours: regular_hours || 0,
      overtime_hours: overtime_hours || 0,
      gross_pay: gross_pay || 0,
      deductions: deductions || 0,
      net_pay: net_pay || 0,
      bonus: bonus || 0,
      status: status || "pending",
      paid_date: paid_date || null,
      notes: notes || "",
    });

    createAuditLog({
      user_id: session?.user?.id ? parseInt(session.user.id as any) : undefined,
      action: "CREATE_PAYROLL",
      entity_type: "payroll",
      entity_id: record.id,
      changes: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, record });
  } catch (err) {
    console.error("POST /api/admin/enterprise/payroll error:", err);
    return NextResponse.json(
      { error: "Failed to create payroll record" },
      { status: 500 }
    );
  }
}
