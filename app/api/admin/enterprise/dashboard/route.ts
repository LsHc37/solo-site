import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDashboardStats, getAuditLogs } from "@/lib/enterprise";

// GET - Fetch enterprise dashboard statistics
export async function GET(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const stats = getDashboardStats();
    const recentActivity = getAuditLogs(20);

    return NextResponse.json({ stats, recentActivity });
  } catch (err) {
    console.error("GET /api/admin/enterprise/dashboard error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
