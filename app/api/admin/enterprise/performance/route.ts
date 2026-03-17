import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAllPerformanceReviews,
  getEmployeePerformanceReviews,
  createPerformanceReview,
  createAuditLog,
} from "@/lib/enterprise";
import { getAllEmployees } from "@/lib/employees";

// GET - Fetch performance reviews
export async function GET(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employee_id");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (employeeId) {
      const reviews = getEmployeePerformanceReviews(parseInt(employeeId));
      return NextResponse.json({ reviews });
    }

    const reviews = getAllPerformanceReviews(limit);
    const employees = getAllEmployees();

    return NextResponse.json({ reviews, employees });
  } catch (err) {
    console.error("GET /api/admin/enterprise/performance error:", err);
    return NextResponse.json(
      { error: "Failed to fetch performance reviews" },
      { status: 500 }
    );
  }
}

// POST - Create performance review
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const {
      employee_id,
      reviewer_id,
      review_date,
      review_type,
      rating,
      strengths,
      areas_for_improvement,
      goals,
      comments,
      status,
    } = body;

    if (!employee_id || !reviewer_id || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = createPerformanceReview({
      employee_id,
      reviewer_id,
      review_date: review_date || new Date().toISOString(),
      review_type: review_type || "annual",
      rating,
      strengths: strengths || "",
      areas_for_improvement: areas_for_improvement || "",
      goals: goals || "",
      comments: comments || "",
      status: status || "draft",
    });

    createAuditLog({
      user_id: session?.user?.id ? parseInt(session.user.id as any) : undefined,
      action: "CREATE_PERFORMANCE_REVIEW",
      entity_type: "performance_review",
      entity_id: review.id,
      changes: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error("POST /api/admin/enterprise/performance error:", err);
    return NextResponse.json(
      { error: "Failed to create performance review" },
      { status: 500 }
    );
  }
}
