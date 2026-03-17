# Employee Management System

This document describes the new employee backend system with sales logging, time tracking, and granular permission management.

## Overview

The system has been upgraded with:
- ✅ **Employee Management** - Full CRUD for employee accounts
- ✅ **Time Tracking** - Clock in/out with break time tracking
- ✅ **Sales Logging** - Record transactions with customer details
- ✅ **Granular Permissions** - Role-based access control with 16 different permissions
- ✅ **Employee Portal** - Dedicated interface for employees to manage their work
- ✅ **Admin Controls** - Complete oversight and management capabilities

## Database Structure

### New Tables

#### `employees`
Stores employee profile information:
- `id`, `user_id` (links to users table)
- `employee_number` (auto-generated: EMP001, EMP002, etc.)
- `first_name`, `last_name`, `phone`
- `hire_date`, `position`, `status` (active/inactive)
- `hourly_rate`, `notes`

#### `permissions`
Defines available permissions:
- 16 pre-configured permissions across 5 categories:
  - **Employees**: manage_employees, view_employees, assign_permissions
  - **Time**: clock_inout, view_own_time, view_all_time, edit_time_entries
  - **Sales**: log_sales, view_own_sales, view_all_sales, edit_sales, delete_sales
  - **Reports**: view_reports, export_data
  - **System**: full_admin (grants all permissions)

#### `employee_permissions`
Junction table linking employees to their granted permissions

#### `time_entries`
Tracks employee work hours:
- Clock in/out timestamps
- Break minutes
- Notes for each shift

#### `sales`
Records sales transactions:
- Product details (name, quantity, unit price)
- Customer information
- Payment method
- Timestamps and employee association

## User Roles

### Admin (role='admin')
- Full system access via admin portal
- Can manage all employees
- Can assign/revoke permissions
- Access to all reports and data

### Employee (role='employee')
- Custom login credentials (email/password)
- Access based on granted permissions
- Can use Employee Portal at `/employee`
- Cannot access admin portal

### User (role='user')
- Regular site users
- No employee or admin privileges

## How to Use

### For Admins

#### 1. Creating Employees
1. Log in to admin portal: `/login?mode=admin` with admin portal code
2. Navigate to **Employees** in the sidebar
3. Click **+ Add Employee**
4. Fill in employee details:
   - Email (will be their login username)
   - Password (initial password they'll use)
   - First/Last name, phone, position
   - Hourly rate and hire date
5. Select permissions based on their role:
   - **Cashier**: clock_inout, log_sales, view_own_sales, view_own_time
   - **Manager**: All of above + view_all_sales, view_all_time, view_reports, manage_employees
   - **Admin**: Grant full_admin permission for complete access
6. Click **Create Employee**

#### 2. Managing Permissions
- Edit any employee to modify their permissions
- Permissions are immediately effective
- Use permission categories to organize access:
  - Grant "full_admin" for complete system access
  - Mix and match specific permissions for custom roles

#### 3. Viewing Employee Activity
- Check time entries from admin panel (coming soon)
- View sales reports filtered by employee
- Monitor employee status (active/inactive)

### For Employees

#### 1. Logging In
1. Go to `/login`
2. Enter email and password (provided by admin)
3. Check the account creation consent box
4. Click **Sign In**
5. Will be redirected to Employee Portal

#### 2. Clock In/Out
1. Navigate to `/employee`
2. Click **Clock In** when starting shift
3. Timer will show elapsed time
4. Click **Clock Out** when ending shift
5. Enter break minutes taken (optional)
6. Confirm clock out

#### 3. Logging Sales
1. Click **+ Log New Sale** button
2. Enter product details:
   - Product name (required)
   - Quantity and unit price (required)
   - Customer name (optional)
   - Payment method (cash/card/check/other)
3. Click **Log Sale**
4. Sale appears in recent sales list

#### 4. Viewing History
- Recent time entries show last 10 shifts with hours worked
- Recent sales show last 10 transactions
- Stats cards display today's sales and totals

## API Endpoints

### Admin Routes (require admin authentication)

**`/api/admin/employees`**
- `GET` - List all employees with permissions
- `POST` - Create new employee
- `PATCH` - Update employee details/permissions
- `DELETE` - Remove employee (cascade deletes time/sales)

### Employee Routes (require employee authentication)

**`/api/employee/time`**
- `GET` - Fetch current and recent time entries
- `POST` - Clock in or clock out
- `PATCH` - Update time entry (requires edit_time_entries permission)

**`/api/employee/sales`**
- `GET` - Fetch employee's sales with stats
- `POST` - Log new sale
- `PATCH` - Update sale (requires edit_sales permission)
- `DELETE` - Remove sale (requires delete_sales permission)

## Permission Matrix

| Permission | Description | Typical Roles |
|------------|-------------|---------------|
| `full_admin` | Complete system access | Owner, Manager |
| `manage_employees` | Create/edit/delete employees | Manager, HR |
| `view_employees` | View employee list | Manager |
| `assign_permissions` | Grant/revoke permissions | Manager |
| `clock_inout` | Record time entries | All employees |
| `view_own_time` | View personal time entries | All employees |
| `view_all_time` | View all employee time | Manager |
| `edit_time_entries` | Modify time records | Manager |
| `log_sales` | Record sales transactions | Sales staff |
| `view_own_sales` | View personal sales | Sales staff |
| `view_all_sales` | View all sales | Manager |
| `edit_sales` | Modify sale records | Manager |
| `delete_sales` | Remove sales | Manager |
| `view_reports` | Access analytics | Manager |
| `export_data` | Export data to files | Manager |

## Security Features

- Passwords are hashed with bcrypt (12 rounds)
- Permission checks on every API call
- Employee data isolated per user account
- Admin portal requires separate authentication code
- Database foreign key constraints prevent orphaned data

## Quick Start Checklist

- [x] Database schema created automatically on first run
- [ ] Create your first employee via admin panel
- [ ] Test employee login at `/login`
- [ ] Employee clocks in at `/employee`
- [ ] Employee logs a test sale
- [ ] Verify data appears in admin employee view

## Future Enhancements

Possible additions:
- Employee reports dashboard in admin
- Time clock with geolocation verification
- Sales analytics and charts
- Scheduled shifts and calendar
- Employee performance metrics
- Payroll integration
- Multi-location support
- Mobile app for employees

## Support

For issues or questions:
1. Check the admin logs at `/admin/server-console`
2. Verify employee has necessary permissions
3. Check database integrity with SQLite browser
4. Review API responses in browser dev tools

---

**System Version**: 1.0  
**Last Updated**: March 2026
