import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = db
      .prepare("SELECT role FROM users WHERE email = ?")
      .get(session.user.email!) as { role: string } | undefined;

    // Only allow managers and admins
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json(
        { error: "Forbidden - Manager or Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const employeeName = searchParams.get("employee");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query with filters
    let query = `
      SELECT 
        te.id,
        te.clock_in,
        te.clock_out,
        te.break_minutes,
        te.notes,
        te.created_at,
        e.id as employee_id,
        e.employee_number,
        e.first_name,
        e.last_name,
        e.position
      FROM time_entries te
      INNER JOIN employees e ON te.employee_id = e.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filter by employee name
    if (employeeName && employeeName.trim()) {
      query += ` AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_number LIKE ?)`;
      const searchPattern = `%${employeeName.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by start date
    if (startDate) {
      query += ` AND te.clock_in >= ?`;
      params.push(startDate);
    }

    // Filter by end date
    if (endDate) {
      query += ` AND te.clock_in <= ?`;
      // Add one day to include the entire end date
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      params.push(endDateTime.toISOString());
    }

    query += ` ORDER BY te.clock_in DESC LIMIT 1000`;

    const timeEntries = db.prepare(query).all(...params) as any[];

    // Calculate hours worked for each entry
    const enrichedEntries = timeEntries.map((entry) => {
      let hoursWorked = null;
      if (entry.clock_out) {
        const clockIn = new Date(entry.clock_in);
        const clockOut = new Date(entry.clock_out);
        const diffMs = clockOut.getTime() - clockIn.getTime();
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const workMinutes = totalMinutes - (entry.break_minutes || 0);
        hoursWorked = workMinutes / 60;
      }

      return {
        ...entry,
        hours_worked: hoursWorked,
      };
    });

    // Get summary statistics
    const totalHours = enrichedEntries
      .filter((e) => e.hours_worked !== null)
      .reduce((sum, e) => sum + e.hours_worked, 0);

    const uniqueEmployees = new Set(enrichedEntries.map((e) => e.employee_id)).size;

    // Get list of all employees for filter dropdown
    const employees = db
      .prepare(
        `SELECT 
          e.id,
          e.employee_number,
          e.first_name,
          e.last_name,
          e.position
        FROM employees e
        INNER JOIN users u ON e.user_id = u.id
        WHERE u.role IN ('admin', 'manager', 'staff')
        ORDER BY e.first_name, e.last_name`
      )
      .all() as any[];

    return NextResponse.json({
      entries: enrichedEntries,
      employees,
      stats: {
        totalHours: totalHours.toFixed(2),
        totalEntries: enrichedEntries.length,
        uniqueEmployees,
      },
    });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
