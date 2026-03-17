import db from "@/lib/db";

export interface Employee {
  id: number;
  user_id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  hire_date: string;
  position: string;
  status: string;
  hourly_rate: number;
  notes: string;
  email?: string;
  permissions?: string[];
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
}

export interface TimeEntry {
  id: number;
  employee_id: number;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  notes: string;
  hours_worked?: number;
}

export interface Sale {
  id: number;
  employee_id: number;
  sale_date: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: string;
  notes: string;
}

/**
 * Get employee by user ID
 */
export function getEmployeeByUserId(userId: number): Employee | null {
  const row = db
    .prepare(
      `SELECT e.*, u.email 
       FROM employees e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.user_id = ?`
    )
    .get(userId) as Employee | undefined;
  
  if (!row) return null;
  
  // Load permissions
  const permissions = db
    .prepare(
      `SELECT p.code 
       FROM employee_permissions ep
       JOIN permissions p ON ep.permission_id = p.id
       WHERE ep.employee_id = ?`
    )
    .all(row.id) as { code: string }[];
  
  row.permissions = permissions.map(p => p.code);
  return row;
}

/**
 * Get employee by ID
 */
export function getEmployeeById(employeeId: number): Employee | null {
  const row = db
    .prepare(
      `SELECT e.*, u.email 
       FROM employees e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.id = ?`
    )
    .get(employeeId) as Employee | undefined;
  
  if (!row) return null;
  
  // Load permissions
  const permissions = db
    .prepare(
      `SELECT p.code 
       FROM employee_permissions ep
       JOIN permissions p ON ep.permission_id = p.id
       WHERE ep.employee_id = ?`
    )
    .all(row.id) as { code: string }[];
  
  row.permissions = permissions.map(p => p.code);
  return row;
}

/**
 * Check if an employee has a specific permission
 */
export function hasPermission(employee: Employee | null, permissionCode: string): boolean {
  if (!employee) return false;
  
  // Full admin has all permissions
  if (employee.permissions?.includes('full_admin')) return true;
  
  return employee.permissions?.includes(permissionCode) ?? false;
}

/**
 * Get all permissions
 */
export function getAllPermissions(): Permission[] {
  return db
    .prepare(`SELECT * FROM permissions ORDER BY category, name`)
    .all() as Permission[];
}

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(): Record<string, Permission[]> {
  const permissions = getAllPermissions();
  const byCategory: Record<string, Permission[]> = {};
  
  for (const perm of permissions) {
    if (!byCategory[perm.category]) {
      byCategory[perm.category] = [];
    }
    byCategory[perm.category].push(perm);
  }
  
  return byCategory;
}

/**
 * Get all employees
 */
export function getAllEmployees(): Employee[] {
  const rows = db
    .prepare(
      `SELECT e.*, u.email 
       FROM employees e 
       JOIN users u ON e.user_id = u.id 
       ORDER BY e.last_name, e.first_name`
    )
    .all() as Employee[];
  
  // Load permissions for each employee
  for (const employee of rows) {
    const permissions = db
      .prepare(
        `SELECT p.code 
         FROM employee_permissions ep
         JOIN permissions p ON ep.permission_id = p.id
         WHERE ep.employee_id = ?`
      )
      .all(employee.id) as { code: string }[];
    
    employee.permissions = permissions.map(p => p.code);
  }
  
  return rows;
}

/**
 * Get current active time entry for employee
 */
export function getCurrentTimeEntry(employeeId: number): TimeEntry | null {
  return db
    .prepare(
      `SELECT * FROM time_entries 
       WHERE employee_id = ? AND clock_out IS NULL 
       ORDER BY clock_in DESC LIMIT 1`
    )
    .get(employeeId) as TimeEntry | null;
}

/**
 * Calculate hours worked from time entry
 */
export function calculateHoursWorked(entry: TimeEntry): number {
  if (!entry.clock_out) return 0;
  
  const clockIn = new Date(entry.clock_in).getTime();
  const clockOut = new Date(entry.clock_out).getTime();
  const totalMinutes = (clockOut - clockIn) / (1000 * 60);
  const workedMinutes = totalMinutes - (entry.break_minutes || 0);
  
  return Math.max(0, workedMinutes / 60);
}

/**
 * Get time entries for an employee
 */
export function getTimeEntries(employeeId: number, limit = 50): TimeEntry[] {
  const entries = db
    .prepare(
      `SELECT * FROM time_entries 
       WHERE employee_id = ? 
       ORDER BY clock_in DESC 
       LIMIT ?`
    )
    .all(employeeId, limit) as TimeEntry[];
  
  // Calculate hours worked for each entry
  for (const entry of entries) {
    entry.hours_worked = calculateHoursWorked(entry);
  }
  
  return entries;
}

/**
 * Get sales for an employee
 */
export function getSales(employeeId: number, limit = 50): Sale[] {
  return db
    .prepare(
      `SELECT * FROM sales 
       WHERE employee_id = ? 
       ORDER BY sale_date DESC 
       LIMIT ?`
    )
    .all(employeeId, limit) as Sale[];
}

/**
 * Get all sales (for reports)
 */
export function getAllSales(limit = 100): Sale[] {
  return db
    .prepare(
      `SELECT s.*, e.first_name, e.last_name 
       FROM sales s 
       JOIN employees e ON s.employee_id = e.id 
       ORDER BY s.sale_date DESC 
       LIMIT ?`
    )
    .all(limit) as Sale[];
}

/**
 * Generate next employee number
 */
export function generateEmployeeNumber(): string {
  const lastEmployee = db
    .prepare(
      `SELECT employee_number FROM employees 
       ORDER BY id DESC LIMIT 1`
    )
    .get() as { employee_number: string } | undefined;
  
  if (!lastEmployee) {
    return 'EMP001';
  }
  
  const match = lastEmployee.employee_number.match(/\d+$/);
  if (!match) {
    return 'EMP001';
  }
  
  const nextNum = parseInt(match[0]) + 1;
  return `EMP${String(nextNum).padStart(3, '0')}`;
}
