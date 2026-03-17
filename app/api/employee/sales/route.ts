import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import {
  getEmployeeByUserId,
  getSales,
  hasPermission,
} from "@/lib/employees";

// GET - Fetch sales for logged-in employee
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

    if (!hasPermission(employee, "view_own_sales") && !hasPermission(employee, "view_all_sales")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    const sales = getSales(employee.id, 100);

    // Calculate totals
    const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const todaySales = sales
      .filter(sale => {
        const saleDate = new Date(sale.sale_date);
        const today = new Date();
        return saleDate.toDateString() === today.toDateString();
      })
      .reduce((sum, sale) => sum + sale.total_amount, 0);

    return NextResponse.json({
      sales,
      stats: {
        total: totalSales,
        today: todaySales,
        count: sales.length,
      },
      employee: {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        employee_number: employee.employee_number,
      },
    });
  } catch (err) {
    console.error("GET /api/employee/sales error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// POST - Log a new sale
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

    if (!hasPermission(employee, "log_sales")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      product_name,
      quantity,
      unit_price,
      customer_name,
      payment_method,
      notes,
    } = body;

    // Validate required fields
    if (!product_name || !quantity || !unit_price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const total_amount = quantity * unit_price;

    // Insert sale
    const result = db
      .prepare(
        `INSERT INTO sales (
          employee_id, product_name, quantity, unit_price, 
          total_amount, customer_name, payment_method, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        employee.id,
        product_name,
        quantity,
        unit_price,
        total_amount,
        customer_name || "",
        payment_method || "cash",
        notes || ""
      );

    const newSale = db
      .prepare("SELECT * FROM sales WHERE id = ?")
      .get(result.lastInsertRowid) as any;

    return NextResponse.json({
      success: true,
      sale: newSale,
    });
  } catch (err) {
    console.error("POST /api/employee/sales error:", err);
    return NextResponse.json(
      { error: "Failed to log sale" },
      { status: 500 }
    );
  }
}

// PATCH - Update a sale
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

    if (!hasPermission(employee, "edit_sales")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      product_name,
      quantity,
      unit_price,
      customer_name,
      payment_method,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Sale ID required" },
        { status: 400 }
      );
    }

    const total_amount = quantity * unit_price;

    // Update sale
    db.prepare(
      `UPDATE sales SET 
        product_name = ?, 
        quantity = ?, 
        unit_price = ?, 
        total_amount = ?,
        customer_name = ?,
        payment_method = ?,
        notes = ?
      WHERE id = ?`
    ).run(
      product_name,
      quantity,
      unit_price,
      total_amount,
      customer_name || "",
      payment_method || "cash",
      notes || "",
      id
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/employee/sales error:", err);
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a sale
export async function DELETE(req: NextRequest) {
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

    if (!hasPermission(employee, "delete_sales")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Sale ID required" },
        { status: 400 }
      );
    }

    db.prepare("DELETE FROM sales WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/employee/sales error:", err);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
