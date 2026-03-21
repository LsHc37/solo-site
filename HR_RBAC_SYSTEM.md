# HR & RBAC System Documentation

This document describes the Human Resources (HR) and Role-Based Access Control (RBAC) system implemented in this Next.js application.

## Overview

The HR/RBAC system provides comprehensive user management, role-based permissions, employment status tracking, and time clock functionality. The system uses **better-sqlite3** for data persistence and integrates seamlessly with NextAuth for authentication.

## Database Schema

### Users Table

The core table for user authentication and HR management.

```sql
CREATE TABLE users (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  email               TEXT    NOT NULL UNIQUE,
  password            TEXT    NOT NULL,
  role                TEXT    NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'user')),
  employment_status   TEXT    NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'suspended', 'terminated')),
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

**Fields:**
- `id`: Unique identifier
- `email`: User's email address (unique)
- `password`: Bcrypt hashed password
- `role`: User's role in the hierarchy (admin, manager, staff, or user)
- `employment_status`: Current employment status (active, suspended, or terminated)
- `must_change_password`: Boolean flag (0 or 1) indicating if password change is required
- `created_at`: Timestamp of account creation
- `updated_at`: Timestamp of last update

### Permissions Table

Defines available permissions in the system.

```sql
CREATE TABLE permissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT 'general',
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

**Categories:**
- `employees`: Employee management permissions
- `time`: Time tracking permissions
- `sales`: Sales management permissions
- `reports`: Reporting and analytics permissions
- `content`: Site content management permissions
- `community`: Community engagement permissions
- `system`: System administration permissions

### Employee Permissions Table

Links employees to their granted permissions.

```sql
CREATE TABLE employee_permissions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id   INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  granted_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  granted_by    INTEGER,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES employees(id),
  UNIQUE(employee_id, permission_id)
);
```

### Time Entries Table (Time Clock)

Tracks employee clock-in and clock-out times.

```sql
CREATE TABLE time_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  clock_in    TEXT    NOT NULL,
  clock_out   TEXT,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  notes       TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
```

## Role Hierarchy

The system implements a strict hierarchical role structure:

1. **Admin** (Level 3) - Highest authority
   - Full system access
   - Can manage all other roles
   - Access to admin portal
   - Complete CRUD operations on all resources

2. **Manager** (Level 2) - Middle management
   - Can manage Staff and User roles
   - Access to admin portal
   - Can view all employee data
   - Limited system configuration access

3. **Staff** (Level 1) - Regular employees
   - Can only manage User roles
   - Limited to own data (time, sales)
   - Basic operational permissions

4. **User** (Level 0) - Basic access
   - Read-only community access
   - No management capabilities
   - Limited system interaction

### Role Authority Rules

- Higher roles can manage lower roles
- Roles cannot manage other users of the same or higher level
- Admin role has unrestricted access to all system features

## Employment Status

Three states define a user's employment status:

### Active
- Full system access (subject to role and permissions)
- Can log in and perform assigned duties
- Default status for new employees

### Suspended
- Login blocked
- Temporary status for disciplinary or administrative reasons
- Can be reinstated to Active

### Terminated
- Login permanently blocked
- Used for former employees
- Historical data preserved for audit purposes

## Default Permissions by Role

### Admin
- `full_admin` - Complete system access
- `access_admin_portal` - Admin interface access
- `view_audit_logs` - Security log viewing

### Manager
- `access_admin_portal` - Admin interface access
- `view_employees` - View employee information
- `view_all_time` - View all time entries
- `view_all_sales` - View all sales data
- `view_reports` - Access reports
- `edit_site` - Modify site content
- `manage_content` - Manage content blocks
- `respond_posts` - Reply to community posts
- `moderate_posts` - Moderate community content

### Staff
- `clock_inout` - Record time entries
- `view_own_time` - View personal time data
- `log_sales` - Record sales transactions
- `view_own_sales` - View personal sales
- `view_posts` - View community posts

### User
- `view_posts` - View community posts only

## Available Permissions

### Employee Management
- `manage_employees` - Create, edit, and remove employee accounts
- `view_employees` - View employee information and list
- `assign_permissions` - Grant and revoke employee permissions

### Time & Attendance
- `clock_inout` - Record time entries (clock in and clock out)
- `view_own_time` - View personal time entries
- `view_all_time` - View all employee time entries
- `edit_time_entries` - Modify time entries for any employee

### Sales
- `log_sales` - Record sales transactions
- `view_own_sales` - View personal sales records
- `view_all_sales` - View all employee sales records
- `edit_sales` - Modify sales records
- `delete_sales` - Remove sales records

### Reports & Analytics
- `view_reports` - Access reports and analytics
- `export_data` - Export employee, time, and sales data

### Site & Content Management
- `edit_site` - Modify site content, settings, and configuration
- `view_site_settings` - View site configuration and settings
- `manage_content` - Create, edit, and delete site content blocks
- `manage_files` - Upload, organize, and delete files
- `publish_content` - Publish and unpublish site content

### Community & Engagement
- `respond_posts` - Reply to community questions and reviews
- `moderate_posts` - Edit or remove community posts
- `view_posts` - View community questions and reviews

### System
- `full_admin` - Complete system access and control
- `access_admin_portal` - Access the administration interface
- `view_audit_logs` - View system audit and security logs

## Using the RBAC Library

The `lib/rbac.ts` module provides utility functions for working with the HR/RBAC system.

### Importing

```typescript
import {
  hasPermission,
  hasRoleAuthority,
  canAccessSystem,
  getUserById,
  clockIn,
  clockOut,
  // ... other functions
} from "@/lib/rbac";
```

### Common Operations

#### Check User Access

```typescript
const user = getUserById(userId);
if (user) {
  const access = canAccessSystem(user);
  if (!access.allowed) {
    console.log(`Access denied: ${access.reason}`);
  }
}
```

#### Check Permissions

```typescript
// Check single permission
if (hasPermission(employeeId, "edit_site")) {
  // Allow site editing
}

// Check if user has any of multiple permissions
if (hasAnyPermission(employeeId, ["edit_site", "manage_content"])) {
  // Allow content operations
}

// Check if user has all permissions
if (hasAllPermissions(employeeId, ["edit_site", "publish_content"])) {
  // Allow publishing
}
```

#### Role Management

```typescript
// Check if a role can manage another role
if (canManageRole(managerRole, targetRole)) {
  // Allow management operation
}

// Get roles a user can manage
const managedRoles = getManagedRoles("manager");
// Returns: ["staff", "user"]

// Check role authority
if (hasRoleAuthority(userRole, "manager")) {
  // User is manager or higher
}
```

#### Grant/Revoke Permissions

```typescript
// Grant a permission
grantPermission(employeeId, "edit_site", grantedByEmployeeId);

// Revoke a permission
revokePermission(employeeId, "edit_site");

// Apply default permissions for a role
applyDefaultPermissions(employeeId, "manager", grantedByEmployeeId);
```

#### Time Clock Operations

```typescript
// Clock in
const entry = clockIn(employeeId, "Starting shift");
if (entry) {
  console.log("Clocked in at:", entry.clock_in);
}

// Clock out
const completed = clockOut(employeeId, 30); // 30 minutes break
if (completed) {
  console.log("Clocked out at:", completed.clock_out);
}

// Check if clocked in
if (isClockedIn(employeeId)) {
  console.log("Employee is currently clocked in");
}

// Get time entries
const entries = getTimeEntries(employeeId, startDate, endDate);
```

#### User Management

```typescript
// Update role
updateUserRole(userId, "manager");

// Update employment status
updateEmploymentStatus(userId, "suspended");

// Require password change
setMustChangePassword(userId, true);

// Clear password requirement (after successful change)
clearMustChangePassword(userId);
```

## Authentication Integration

The authentication system in `auth.ts` automatically checks:

1. **Employment Status** - Users with 'suspended' or 'terminated' status cannot log in
2. **Password Change Requirement** - Users with `must_change_password=1` are blocked from login
3. **Role Validation** - Admin portal access requires 'admin' role + valid portal code

### Login Flow

```
1. User enters credentials
2. System checks IP/email lockouts
3. System validates credentials
4. System checks employment_status (must be 'active')
5. System checks must_change_password (must be 0)
6. If admin portal login: validate role + portal code
7. Grant access and create session
```

## Security Features

### Employment Status Enforcement
- Suspended/terminated users are automatically blocked at login
- No access to any system resources when status is not 'active'

### Password Change Enforcement
- Users flagged with `must_change_password` cannot log in
- Useful for forcing password updates after security events
- Must be cleared after successful password change

### Role-Based Access Control
- Permissions checked at both route and component level
- Hierarchical role system prevents privilege escalation
- Fine-grained permissions for specific operations

### Audit Trail
- All permission grants tracked with `granted_by` field
- All time entries have creation and update timestamps
- Auth events table logs all login attempts and outcomes

## API Usage Examples

### Creating a New Employee with Role

```typescript
// In your API route or server action
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { applyDefaultPermissions } from "@/lib/rbac";

// Create user
const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
const result = db.prepare(
  `INSERT INTO users (email, password, role, employment_status, must_change_password)
   VALUES (?, ?, ?, 'active', 1)`
).run(email, hashedPassword, role);

const userId = result.lastInsertRowid;

// Create employee record
const empResult = db.prepare(
  `INSERT INTO employees (user_id, employee_number, first_name, last_name, position, hourly_rate)
   VALUES (?, ?, ?, ?, ?, ?)`
).run(userId, employeeNumber, firstName, lastName, position, hourlyRate);

// Apply default permissions based on role
applyDefaultPermissions(empResult.lastInsertRowid, role);
```

### Changing User Role

```typescript
import { updateUserRole, applyDefaultPermissions } from "@/lib/rbac";

// Update the role
updateUserRole(userId, "manager");

// Get employee record
const employee = db.prepare(
  "SELECT id FROM employees WHERE user_id = ?"
).get(userId) as { id: number };

// Clear existing permissions
db.prepare(
  "DELETE FROM employee_permissions WHERE employee_id = ?"
).run(employee.id);

// Apply new default permissions
applyDefaultPermissions(employee.id, "manager");
```

### Suspending an Employee

```typescript
import { updateEmploymentStatus } from "@/lib/rbac";

// Suspend the employee
updateEmploymentStatus(userId, "suspended");

// They will be unable to log in until status is changed back to 'active'
```

## Best Practices

1. **Always check employment status** before granting access to sensitive operations
2. **Use role hierarchy** to determine management permissions
3. **Apply default permissions** when creating or updating user roles
4. **Log permission changes** by always passing `grantedBy` parameter
5. **Force password changes** for new employees and after security incidents
6. **Audit regularly** using the auth_events table
7. **Use time clock functions** to ensure only one active entry per employee

## Migration Notes

The database schema includes safe migrations that:
- Add new columns to existing `users` table
- Preserve existing data
- Set appropriate defaults for new fields
- Are idempotent (can be run multiple times safely)

Existing user accounts will automatically receive:
- `employment_status = 'active'`
- `must_change_password = 0`
- Their existing role or default 'staff' if none set

## TypeScript Types

All types are exported from `lib/rbac.ts`:

```typescript
type UserRole = "admin" | "manager" | "staff" | "user";
type EmploymentStatus = "active" | "suspended" | "terminated";

interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  employment_status: EmploymentStatus;
  must_change_password: number;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
}

interface TimeClockEntry {
  id: number;
  employee_id: number;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  notes: string;
  created_at: string;
  updated_at: string;
}
```

## Troubleshooting

### User Cannot Log In

Check in order:
1. Employment status is 'active'
2. `must_change_password` is 0
3. Password is correct
4. Email/IP is not locked out
5. For admin portal: role is 'admin' and portal code is correct

### Permission Denied

Check:
1. Employee record exists and is linked to user
2. Required permission is granted in `employee_permissions` table
3. Role has authority for the operation
4. Employment status is 'active'

### Time Clock Issues

Check:
1. Employee record exists
2. No orphaned clock-in entries (use `isClockedIn()` to check)
3. Timestamps are in ISO 8601 format

## Support

For additional help or to report issues, consult the development team or check the codebase for implementation examples.
