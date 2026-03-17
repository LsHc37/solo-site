import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import {
  getEmployeeByUserId,
  getCurrentTimeEntry,
  getTimeEntries,
  hasPermission,
} from "@/lib/employees";

// GET - Fetch time entries for logged-in employee
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employee = getEmployeeByUserId(parseInt(session.user.id));
    
    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    if (!hasPermission(employee, "view_own_time") && !hasPermission(employee, "view_all_time")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    const currentEntry = getCurrentTimeEntry(employee.id);
    const entries = getTimeEntries(employee.id, 50);

    return NextResponse.json({
      currentEntry,
      entries,
      employee: {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        employee_number: employee.employee_number,
      },
    });
  } catch (err) {
    console.error("GET /api/employee/time error:", err);
    return NextResponse.json(
      { error: "Failed to fetch time entries" },
      { status: 500 }
    );
  }
}

// POST - Clock in or clock out
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employee = getEmployeeByUserId(parseInt(session.user.id));
    
    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    if (!hasPermission(employee, "clock_inout")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, notes, break_minutes } = body;

    if (action === "clock_in") {
      // Check if already clocked in
      const currentEntry = getCurrentTimeEntry(employee.id);
      if (currentEntry) {
        return NextResponse.json(
          { error: "Already clocked in" },
          { status: 400 }
        );
      }

      // Clock in
      const result = db
        .prepare(
          `INSERT INTO time_entries (employee_id, clock_in, notes) 
           VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ?)`
        )
        .run(employee.id, notes || "");

      const newEntry = db
        .prepare("SELECT * FROM time_entries WHERE id = ?")
        .get(result.lastInsertRowid) as any;

      return NextResponse.json({
        success: true,
        action: "clocked_in",
        entry: newEntry,
      });
    } else if (action === "clock_out") {
      // Check if clocked in
      const currentEntry = getCurrentTimeEntry(employee.id);
      if (!currentEntry) {
        return NextResponse.json(
          { error: "Not clocked in" },
          { status: 400 }
        );
      }

      // Clock out
      db.prepare(
        `UPDATE time_entries 
         SET clock_out = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
             break_minutes = ?,
             notes = ?,
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ?`
      ).run(break_minutes || 0, notes || currentEntry.notes, currentEntry.id);

      const updatedEntry = db
        .prepare("SELECT * FROM time_entries WHERE id = ?")
        .get(currentEntry.id) as any;

      return NextResponse.json({
        success: true,
        action: "clocked_out",
        entry: updatedEntry,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("POST /api/employee/time error:", err);
    return NextResponse.json(
      { error: "Failed to process time entry" },
      { status: 500 }
    );
  }
}

// PATCH - Update time entry (for corrections)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employee = getEmployeeByUserId(parseInt(session.user.id));
    
    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    if (!hasPermission(employee, "edit_time_entries")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, break_minutes, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID required" },
        { status: 400 }
      );
    }

    // Update entry
    db.prepare(
      `UPDATE time_entries 
       SET break_minutes = ?, notes = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`
    ).run(break_minutes || 0, notes || "", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/employee/time error:", err);
    return NextResponse.json(
      { error: "Failed to update time entry" },
      { status: 500 }
    );
  }
}
