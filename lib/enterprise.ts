import db from "@/lib/db";
import { Employee } from "@/lib/employees";

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE DATABASE SCHEMA EXTENSIONS
// ═══════════════════════════════════════════════════════════════════════════

// ── Departments table ───────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE,
    description     TEXT    NOT NULL DEFAULT '',
    manager_id      INTEGER,
    budget          REAL    NOT NULL DEFAULT 0.0,
    status          TEXT    NOT NULL DEFAULT 'active',
    created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
  )
`);

// ── Employee-Department junction (many-to-many) ─────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS employee_departments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    role_in_dept  TEXT    NOT NULL DEFAULT 'member',
    assigned_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    UNIQUE(employee_id, department_id)
  )
`);

// ── Payroll records ─────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS payroll_records (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id     INTEGER NOT NULL,
    pay_period_start TEXT   NOT NULL,
    pay_period_end   TEXT   NOT NULL,
    regular_hours    REAL   NOT NULL DEFAULT 0.0,
    overtime_hours   REAL   NOT NULL DEFAULT 0.0,
    gross_pay        REAL   NOT NULL DEFAULT 0.0,
    deductions       REAL   NOT NULL DEFAULT 0.0,
    net_pay          REAL   NOT NULL DEFAULT 0.0,
    bonus            REAL   NOT NULL DEFAULT 0.0,
    status           TEXT   NOT NULL DEFAULT 'pending',
    paid_date        TEXT,
    notes            TEXT   NOT NULL DEFAULT '',
    created_at       TEXT   NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_payroll_employee_period
  ON payroll_records(employee_id, pay_period_start DESC)
`);

// ── Performance reviews ─────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS performance_reviews (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    reviewer_id   INTEGER NOT NULL,
    review_date   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    review_type   TEXT    NOT NULL DEFAULT 'annual',
    rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    strengths     TEXT    NOT NULL DEFAULT '',
    areas_for_improvement TEXT NOT NULL DEFAULT '',
    goals         TEXT    NOT NULL DEFAULT '',
    comments      TEXT    NOT NULL DEFAULT '',
    status        TEXT    NOT NULL DEFAULT 'draft',
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES employees(id)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee
  ON performance_reviews(employee_id, review_date DESC)
`);

// ── Leave requests ──────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS leave_requests (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    leave_type    TEXT    NOT NULL,
    start_date    TEXT    NOT NULL,
    end_date      TEXT    NOT NULL,
    days_count    REAL    NOT NULL,
    reason        TEXT    NOT NULL DEFAULT '',
    status        TEXT    NOT NULL DEFAULT 'pending',
    approved_by   INTEGER,
    approved_at   TEXT,
    comments      TEXT    NOT NULL DEFAULT '',
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_leave_requests_employee
  ON leave_requests(employee_id, start_date DESC)
`);

// ── Leave balances ──────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS leave_balances (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    leave_type    TEXT    NOT NULL,
    total_days    REAL    NOT NULL DEFAULT 0.0,
    used_days     REAL    NOT NULL DEFAULT 0.0,
    remaining_days REAL   NOT NULL DEFAULT 0.0,
    year          INTEGER NOT NULL,
    updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE(employee_id, leave_type, year)
  )
`);

// ── Employee documents ──────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS employee_documents (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    document_type TEXT    NOT NULL,
    title         TEXT    NOT NULL,
    file_path     TEXT    NOT NULL,
    uploaded_by   INTEGER NOT NULL,
    notes         TEXT    NOT NULL DEFAULT '',
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES employees(id)
  )
`);

// ── Compensation history ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS compensation_history (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    change_type   TEXT    NOT NULL,
    previous_value REAL   NOT NULL,
    new_value     REAL    NOT NULL,
    effective_date TEXT   NOT NULL,
    reason        TEXT    NOT NULL DEFAULT '',
    approved_by   INTEGER,
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id)
  )
`);

// ── Audit logs ──────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER,
    employee_id   INTEGER,
    action        TEXT    NOT NULL,
    entity_type   TEXT    NOT NULL,
    entity_id     INTEGER,
    changes       TEXT    NOT NULL DEFAULT '',
    ip_address    TEXT    NOT NULL DEFAULT '',
    user_agent    TEXT    NOT NULL DEFAULT '',
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs(created_at DESC)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id)
`);

// ── Employee notes (private admin notes) ────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS employee_notes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    created_by    INTEGER NOT NULL,
    note_type     TEXT    NOT NULL DEFAULT 'general',
    content       TEXT    NOT NULL,
    is_private    INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES employees(id)
  )
`);

// ── Employee benefits ───────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS employee_benefits (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    benefit_type  TEXT    NOT NULL,
    benefit_name  TEXT    NOT NULL,
    provider      TEXT    NOT NULL DEFAULT '',
    coverage      TEXT    NOT NULL DEFAULT '',
    cost          REAL    NOT NULL DEFAULT 0.0,
    start_date    TEXT    NOT NULL,
    end_date      TEXT,
    status        TEXT    NOT NULL DEFAULT 'active',
    notes         TEXT    NOT NULL DEFAULT '',
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  )
`);

// ── Training records ────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS training_records (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id   INTEGER NOT NULL,
    training_name TEXT    NOT NULL,
    training_type TEXT    NOT NULL DEFAULT 'course',
    provider      TEXT    NOT NULL DEFAULT '',
    completion_date TEXT  NOT NULL,
    expiry_date   TEXT,
    certificate_path TEXT NOT NULL DEFAULT '',
    cost          REAL    NOT NULL DEFAULT 0.0,
    status        TEXT    NOT NULL DEFAULT 'completed',
    notes         TEXT    NOT NULL DEFAULT '',
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  )
`);

// ══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ══════════════════════════════════════════════════════════════════════════

export interface Department {
  id: number;
  name: string;
  description: string;
  manager_id: number | null;
  manager_name?: string;
  budget: number;
  status: string;
  employee_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: number;
  employee_id: number;
  employee_name?: string;
  pay_period_start: string;
  pay_period_end: string;
  regular_hours: number;
  overtime_hours: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  bonus: number;
  status: string;
  paid_date: string | null;
  notes: string;
  created_at: string;
}

export interface PerformanceReview {
  id: number;
  employee_id: number;
  employee_name?: string;
  reviewer_id: number;
  reviewer_name?: string;
  review_date: string;
  review_type: string;
  rating: number;
  strengths: string;
  areas_for_improvement: string;
  goals: string;
  comments: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: string;
  approved_by: number | null;
  approver_name?: string;
  approved_at: string | null;
  comments: string;
  created_at: string;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type: string;
  total_days: number;
  used_days: number;
  remaining_days: number;
  year: number;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  employee_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  changes: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface EmployeeNote {
  id: number;
  employee_id: number;
  created_by: number;
  creator_name?: string;
  note_type: string;
  content: string;
  is_private: number;
  created_at: string;
}

export interface EmployeeBenefit {
  id: number;
  employee_id: number;
  benefit_type: string;
  benefit_name: string;
  provider: string;
  coverage: string;
  cost: number;
  start_date: string;
  end_date: string | null;
  status: string;
  notes: string;
  created_at: string;
}

export interface TrainingRecord {
  id: number;
  employee_id: number;
  training_name: string;
  training_type: string;
  provider: string;
  completion_date: string;
  expiry_date: string | null;
  certificate_path: string;
  cost: number;
  status: string;
  notes: string;
  created_at: string;
}

export interface CompensationHistory {
  id: number;
  employee_id: number;
  change_type: string;
  previous_value: number;
  new_value: number;
  effective_date: string;
  reason: string;
  approved_by: number | null;
  approver_name?: string;
  created_at: string;
}

// ══════════════════════════════════════════════════════════════════════════
// DEPARTMENT FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function getAllDepartments(): Department[] {
  const departments = db
    .prepare(
      `SELECT d.*, 
              (SELECT first_name || ' ' || last_name FROM employees WHERE id = d.manager_id) as manager_name,
              (SELECT COUNT(*) FROM employee_departments WHERE department_id = d.id) as employee_count
       FROM departments d
       ORDER BY d.name`
    )
    .all() as Department[];
  
  return departments;
}

export function getDepartmentById(id: number): Department | null {
  const dept = db
    .prepare(
      `SELECT d.*, 
              (SELECT first_name || ' ' || last_name FROM employees WHERE id = d.manager_id) as manager_name,
              (SELECT COUNT(*) FROM employee_departments WHERE department_id = d.id) as employee_count
       FROM departments d
       WHERE d.id = ?`
    )
    .get(id) as Department | undefined;
  
  return dept || null;
}

export function createDepartment(data: {
  name: string;
  description?: string;
  manager_id?: number;
  budget?: number;
}): Department {
  const result = db
    .prepare(
      `INSERT INTO departments (name, description, manager_id, budget)
       VALUES (?, ?, ?, ?)`
    )
    .run(
      data.name,
      data.description || "",
      data.manager_id || null,
      data.budget || 0
    );
  
  return getDepartmentById(result.lastInsertRowid as number)!;
}

export function updateDepartment(
  id: number,
  data: Partial<Department>
): Department | null {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description);
  }
  if (data.manager_id !== undefined) {
    updates.push("manager_id = ?");
    values.push(data.manager_id);
  }
  if (data.budget !== undefined) {
    updates.push("budget = ?");
    values.push(data.budget);
  }
  if (data.status !== undefined) {
    updates.push("status = ?");
    values.push(data.status);
  }
  
  if (updates.length === 0) return getDepartmentById(id);
  
  updates.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
  values.push(id);
  
  db.prepare(
    `UPDATE departments SET ${updates.join(", ")} WHERE id = ?`
  ).run(...values);
  
  return getDepartmentById(id);
}

export function deleteDepartment(id: number): boolean {
  const result = db.prepare("DELETE FROM departments WHERE id = ?").run(id);
  return result.changes > 0;
}

export function assignEmployeeToDepartment(
  employeeId: number,
  departmentId: number,
  role: string = "member"
): void {
  db.prepare(
    `INSERT OR REPLACE INTO employee_departments (employee_id, department_id, role_in_dept)
     VALUES (?, ?, ?)`
  ).run(employeeId, departmentId, role);
}

export function removeEmployeeFromDepartment(
  employeeId: number,
  departmentId: number
): void {
  db.prepare(
    `DELETE FROM employee_departments 
     WHERE employee_id = ? AND department_id = ?`
  ).run(employeeId, departmentId);
}

export function getEmployeeDepartments(employeeId: number): Department[] {
  return db
    .prepare(
      `SELECT d.*, ed.role_in_dept
       FROM departments d
       JOIN employee_departments ed ON d.id = ed.department_id
       WHERE ed.employee_id = ?
       ORDER BY d.name`
    )
    .all(employeeId) as Department[];
}

// ══════════════════════════════════════════════════════════════════════════
// PAYROLL FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function getAllPayrollRecords(limit = 100): PayrollRecord[] {
  return db
    .prepare(
      `SELECT pr.*, e.first_name || ' ' || e.last_name as employee_name
       FROM payroll_records pr
       JOIN employees e ON pr.employee_id = e.id
       ORDER BY pr.pay_period_start DESC
       LIMIT ?`
    )
    .all(limit) as PayrollRecord[];
}

export function getEmployeePayrollRecords(
  employeeId: number,
  limit = 50
): PayrollRecord[] {
  return db
    .prepare(
      `SELECT * FROM payroll_records
       WHERE employee_id = ?
       ORDER BY pay_period_start DESC
       LIMIT ?`
    )
    .all(employeeId, limit) as PayrollRecord[];
}

export function createPayrollRecord(data: Omit<PayrollRecord, "id" | "created_at">): PayrollRecord {
  const result = db
    .prepare(
      `INSERT INTO payroll_records (
        employee_id, pay_period_start, pay_period_end, regular_hours, 
        overtime_hours, gross_pay, deductions, net_pay, bonus, status, 
        paid_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.employee_id,
      data.pay_period_start,
      data.pay_period_end,
      data.regular_hours,
      data.overtime_hours,
      data.gross_pay,
      data.deductions,
      data.net_pay,
      data.bonus,
      data.status,
      data.paid_date,
      data.notes
    );
  
  return db
    .prepare("SELECT * FROM payroll_records WHERE id = ?")
    .get(result.lastInsertRowid) as PayrollRecord;
}

// ══════════════════════════════════════════════════════════════════════════
// PERFORMANCE REVIEW FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function getAllPerformanceReviews(limit = 100): PerformanceReview[] {
  return db
    .prepare(
      `SELECT pr.*, 
              e.first_name || ' ' || e.last_name as employee_name,
              r.first_name || ' ' || r.last_name as reviewer_name
       FROM performance_reviews pr
       JOIN employees e ON pr.employee_id = e.id
       JOIN employees r ON pr.reviewer_id = r.id
       ORDER BY pr.review_date DESC
       LIMIT ?`
    )
    .all(limit) as PerformanceReview[];
}

export function getEmployeePerformanceReviews(
  employeeId: number
): PerformanceReview[] {
  return db
    .prepare(
      `SELECT pr.*, 
              r.first_name || ' ' || r.last_name as reviewer_name
       FROM performance_reviews pr
       JOIN employees r ON pr.reviewer_id = r.id
       WHERE pr.employee_id = ?
       ORDER BY pr.review_date DESC`
    )
    .all(employeeId) as PerformanceReview[];
}

export function createPerformanceReview(
  data: Omit<PerformanceReview, "id" | "created_at" | "updated_at">
): PerformanceReview {
  const result = db
    .prepare(
      `INSERT INTO performance_reviews (
        employee_id, reviewer_id, review_date, review_type, rating,
        strengths, areas_for_improvement, goals, comments, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.employee_id,
      data.reviewer_id,
      data.review_date,
      data.review_type,
      data.rating,
      data.strengths,
      data.areas_for_improvement,
      data.goals,
      data.comments,
      data.status
    );
  
  return db
    .prepare("SELECT * FROM performance_reviews WHERE id = ?")
    .get(result.lastInsertRowid) as PerformanceReview;
}

// ══════════════════════════════════════════════════════════════════════════
// LEAVE MANAGEMENT FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function getAllLeaveRequests(status?: string): LeaveRequest[] {
  let query = `
    SELECT lr.*, 
           e.first_name || ' ' || e.last_name as employee_name,
           a.first_name || ' ' || a.last_name as approver_name
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    LEFT JOIN employees a ON lr.approved_by = a.id
  `;
  
  if (status) {
    query += ` WHERE lr.status = ?`;
  }
  
  query += ` ORDER BY lr.created_at DESC`;
  
  return status
    ? (db.prepare(query).all(status) as LeaveRequest[])
    : (db.prepare(query).all() as LeaveRequest[]);
}

export function getEmployeeLeaveRequests(employeeId: number): LeaveRequest[] {
  return db
    .prepare(
      `SELECT lr.*,
              a.first_name || ' ' || a.last_name as approver_name
       FROM leave_requests lr
       LEFT JOIN employees a ON lr.approved_by = a.id
       WHERE lr.employee_id = ?
       ORDER BY lr.start_date DESC`
    )
    .all(employeeId) as LeaveRequest[];
}

export function createLeaveRequest(
  data: Omit<LeaveRequest, "id" | "created_at" | "approved_by" | "approved_at">
): LeaveRequest {
  const result = db
    .prepare(
      `INSERT INTO leave_requests (
        employee_id, leave_type, start_date, end_date, days_count, reason, status, comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.employee_id,
      data.leave_type,
      data.start_date,
      data.end_date,
      data.days_count,
      data.reason,
      data.status,
      data.comments
    );
  
  return db
    .prepare("SELECT * FROM leave_requests WHERE id = ?")
    .get(result.lastInsertRowid) as LeaveRequest;
}

export function approveLeaveRequest(
  id: number,
  approverId: number,
  comments?: string
): LeaveRequest | null {
  db.prepare(
    `UPDATE leave_requests 
     SET status = 'approved', approved_by = ?, approved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 
         comments = ?
     WHERE id = ?`
  ).run(approverId, comments || "", id);
  
  return db
    .prepare("SELECT * FROM leave_requests WHERE id = ?")
    .get(id) as LeaveRequest | null;
}

export function getEmployeeLeaveBalance(
  employeeId: number,
  year: number
): LeaveBalance[] {
  return db
    .prepare(
      `SELECT * FROM leave_balances 
       WHERE employee_id = ? AND year = ?
       ORDER BY leave_type`
    )
    .all(employeeId, year) as LeaveBalance[];
}

// ══════════════════════════════════════════════════════════════════════════
// AUDIT LOG FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function createAuditLog(data: {
  user_id?: number;
  employee_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  changes?: string;
  ip_address?: string;
  user_agent?: string;
}): void {
  db.prepare(
    `INSERT INTO audit_logs (
      user_id, employee_id, action, entity_type, entity_id, 
      changes, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    data.user_id || null,
    data.employee_id || null,
    data.action,
    data.entity_type,
    data.entity_id || null,
    data.changes || "",
    data.ip_address || "",
    data.user_agent || ""
  );
}

export function getAuditLogs(limit = 100, entityType?: string): AuditLog[] {
  let query = `SELECT * FROM audit_logs`;
  
  if (entityType) {
    query += ` WHERE entity_type = ?`;
  }
  
  query += ` ORDER BY created_at DESC LIMIT ?`;
  
  return entityType
    ? (db.prepare(query).all(entityType, limit) as AuditLog[])
    : (db.prepare(query).all(limit) as AuditLog[]);
}

// ══════════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTING FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  total_departments: number;
  pending_leave_requests: number;
  total_payroll_this_month: number;
  average_performance_rating: number;
  recent_hires: number;
  turnover_rate: number;
}

export function getDashboardStats(): DashboardStats {
  const totalEmployees = db
    .prepare("SELECT COUNT(*) as count FROM employees")
    .get() as { count: number };
  
  const activeEmployees = db
    .prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'active'")
    .get() as { count: number };
  
  const totalDepartments = db
    .prepare("SELECT COUNT(*) as count FROM departments WHERE status = 'active'")
    .get() as { count: number };
  
  const pendingLeaveRequests = db
    .prepare("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'")
    .get() as { count: number };
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const totalPayroll = db
    .prepare(
      `SELECT COALESCE(SUM(net_pay), 0) as total 
       FROM payroll_records 
       WHERE pay_period_start LIKE ?`
    )
    .get(`${currentMonth}%`) as { total: number };
  
  const avgRating = db
    .prepare(
      `SELECT COALESCE(AVG(rating), 0) as avg 
       FROM performance_reviews 
       WHERE status = 'completed'`
    )
    .get() as { avg: number };
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recentHires = db
    .prepare(
      `SELECT COUNT(*) as count 
       FROM employees 
       WHERE hire_date >= ?`
    )
    .get(thirtyDaysAgo) as { count: number };
  
  return {
    total_employees: totalEmployees.count,
    active_employees: activeEmployees.count,
    total_departments: totalDepartments.count,
    pending_leave_requests: pendingLeaveRequests.count,
    total_payroll_this_month: totalPayroll.total,
    average_performance_rating: avgRating.avg,
    recent_hires: recentHires.count,
    turnover_rate: 0, // Calculate based on terminations
  };
}

export default db;
