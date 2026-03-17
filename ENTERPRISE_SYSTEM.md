# Enterprise Management System

## Overview

A comprehensive enterprise-level employee and organizational management system built on top of the existing employee management system. This system provides advanced features for large organizations to manage departments, payroll, performance reviews, leave requests, and more.

## Features

### 🏢 Organizational Structure
- **Departments**: Create and manage organizational departments
- **Department Managers**: Assign managers to departments
- **Budget Tracking**: Set and monitor department budgets
- **Employee Assignment**: Assign employees to departments
- **Hierarchy Management**: Track organizational structure

### 💰 Payroll Management
- **Payroll Records**: Comprehensive payroll tracking for all employees
- **Pay Period Management**: Track pay periods (weekly, bi-weekly, monthly)
- **Hours Tracking**: Regular and overtime hours calculation
- **Deductions & Bonuses**: Track deductions, bonuses, and net pay
- **Payment Status**: Track pending, paid, and processed payroll
- **Historical Records**: Complete payroll history for auditing

### ⭐ Performance Management
- **Performance Reviews**: Conduct employee performance reviews
- **Rating System**: 1-5 star rating system
- **Review Types**: Annual, quarterly, probationary, etc.
- **Strengths & Improvements**: Document employee strengths and areas for improvement
- **Goal Setting**: Set and track employee goals
- **Review History**: Complete review history for each employee

### 📅 Leave Management
- **Leave Requests**: Employees can request time off
- **Leave Types**: Vacation, sick leave, personal, unpaid, etc.
- **Approval Workflow**: Managers can approve/reject leave requests
- **Leave Balances**: Track available leave days by type and year
- **Calendar Integration**: View leave schedules
- **Automatic Calculations**: Days count and balance updates

### 📊 Audit & Compliance
- **Audit Logs**: Complete audit trail of all system activities
- **Change Tracking**: Track who made what changes and when
- **IP Address Logging**: Security and compliance tracking
- **Entity History**: Track changes to employees, departments, etc.
- **Compliance Reports**: Generate reports for auditing

### 📈 Analytics & Reporting
- **Dashboard Statistics**: Real-time enterprise metrics
- **Employee Metrics**: Total, active, turnover rate
- **Payroll Analytics**: Monthly payroll totals
- **Performance Trends**: Average performance ratings
- **Leave Statistics**: Pending requests, utilization rates
- **Department Analytics**: Budget utilization, headcount

## Database Schema

### New Tables

#### `departments`
Organizational departments with budget tracking:
```sql
- id, name, description
- manager_id (links to employees)
- budget, status
- created_at, updated_at
```

#### `employee_departments`
Many-to-many relationship between employees and departments:
```sql
- id, employee_id, department_id
- role_in_dept (member, lead, etc.)
- assigned_at
```

#### `payroll_records`
Comprehensive payroll tracking:
```sql
- id, employee_id
- pay_period_start, pay_period_end
- regular_hours, overtime_hours
- gross_pay, deductions, net_pay, bonus
- status (pending, paid, processed)
- paid_date, notes
- created_at
```

#### `performance_reviews`
Employee performance evaluations:
```sql
- id, employee_id, reviewer_id
- review_date, review_type
- rating (1-5), strengths, areas_for_improvement
- goals, comments, status
- created_at, updated_at
```

#### `leave_requests`
Time-off request management:
```sql
- id, employee_id, leave_type
- start_date, end_date, days_count
- reason, status (pending, approved, rejected)
- approved_by, approved_at, comments
- created_at
```

#### `leave_balances`
Track available leave days:
```sql
- id, employee_id, leave_type
- total_days, used_days, remaining_days
- year, updated_at
```

#### `audit_logs`
Complete audit trail:
```sql
- id, user_id, employee_id
- action, entity_type, entity_id
- changes (JSON), ip_address, user_agent
- created_at
```

#### `employee_notes`
Private admin notes about employees:
```sql
- id, employee_id, created_by
- note_type, content, is_private
- created_at
```

#### `employee_benefits`
Employee benefits tracking:
```sql
- id, employee_id, benefit_type
- benefit_name, provider, coverage
- cost, start_date, end_date, status
- notes, created_at
```

#### `training_records`
Employee training and certification tracking:
```sql
- id, employee_id, training_name
- training_type, provider
- completion_date, expiry_date
- certificate_path, cost, status
- notes, created_at
```

#### `compensation_history`
Track salary and wage changes:
```sql
- id, employee_id, change_type
- previous_value, new_value
- effective_date, reason
- approved_by, created_at
```

## API Endpoints

### Department Management
- `GET /api/admin/enterprise/departments` - List all departments
- `POST /api/admin/enterprise/departments` - Create department
- `PATCH /api/admin/enterprise/departments` - Update department
- `DELETE /api/admin/enterprise/departments` - Remove department

### Payroll Management
- `GET /api/admin/enterprise/payroll` - List payroll records
- `GET /api/admin/enterprise/payroll?employee_id=X` - Get employee payroll
- `POST /api/admin/enterprise/payroll` - Create payroll record

### Performance Management
- `GET /api/admin/enterprise/performance` - List performance reviews
- `GET /api/admin/enterprise/performance?employee_id=X` - Get employee reviews
- `POST /api/admin/enterprise/performance` - Create performance review

### Leave Management
- `GET /api/admin/enterprise/leave` - List leave requests
- `GET /api/admin/enterprise/leave?status=pending` - Filter by status
- `POST /api/admin/enterprise/leave` - Create leave request
- `PATCH /api/admin/enterprise/leave` - Approve/reject leave request

### Dashboard & Analytics
- `GET /api/admin/enterprise/dashboard` - Get dashboard statistics and recent activity

## User Interface

### Enterprise Dashboard (`/admin/enterprise`)
- **Statistics Cards**: 8 key metrics at a glance
  - Total Employees
  - Active Employees
  - Departments
  - Pending Leave Requests
  - Monthly Payroll Total
  - Average Performance Rating
  - Recent Hires (30 days)
  - Turnover Rate
- **Quick Actions**: Direct links to all management areas
- **Recent Activity**: Latest system actions and changes

### Department Management (`/admin/enterprise/departments`)
- **Department Grid**: Visual cards showing all departments
- **Department Details**: Name, description, manager, budget, employee count
- **Create/Edit Modal**: Full department management
- **Search & Filter**: Find departments quickly
- **Delete Protection**: Confirmation dialogs

### Payroll Management (`/admin/enterprise/payroll`)
- **Payroll Table**: All payroll records with employee names
- **Pay Period Tracking**: Start/end dates with status
- **Hours Breakdown**: Regular and overtime hours
- **Pay Calculations**: Gross pay, deductions, net pay, bonuses
- **Status Management**: Pending, paid, processed
- **Export Capability**: Generate payroll reports

### Performance Management (`/admin/enterprise/performance`)
- **Reviews List**: All performance reviews
- **Rating Display**: Visual star ratings
- **Review Details**: Strengths, improvements, goals, comments
- **Reviewer Tracking**: Who conducted each review
- **Status Workflow**: Draft, completed, archived
- **Employee History**: View all reviews for an employee

### Leave Management (`/admin/enterprise/leave`)
- **Leave Requests Table**: All pending and historical requests
- **Status Filtering**: Filter by pending, approved, rejected
- **Leave Type Badges**: Visual indicators for leave types
- **Approval Workflow**: One-click approve/reject
- **Balance Tracking**: See available leave days
- **Calendar View**: Visualize team leave schedules

## Security & Permissions

All enterprise features require admin authentication:
- Admin role required for all enterprise endpoints
- Session-based authentication
- Audit logging for all actions
- IP address and user agent tracking
- Change history for compliance

## Integration with Existing Systems

The enterprise system seamlessly integrates with:
- **Employee Management**: Extends existing employee records
- **Time Tracking**: Uses clock-in/out data for payroll
- **User Management**: Links to user accounts
- **Permissions System**: Respects existing permission structure
- **Admin Portal**: Integrated into admin sidebar navigation

## Usage Guide

### For Administrators

#### Setting Up Departments
1. Navigate to **Enterprise > Departments**
2. Click **+ Add Department**
3. Fill in department details:
   - Name (required)
   - Description
   - Manager (select from employees)
   - Budget
4. Click **Create Department**

#### Processing Payroll
1. Navigate to **Enterprise > Payroll**
2. Click **+ Create Payroll Record**
3. Select employee and pay period
4. Enter hours worked (regular/overtime)
5. System calculates gross pay based on hourly rate
6. Enter deductions and bonuses
7. System calculates net pay
8. Save record with status (pending/paid)

#### Conducting Performance Reviews
1. Navigate to **Enterprise > Performance**
2. Click **+ New Review**
3. Select employee and reviewer
4. Choose review type (annual, quarterly, etc.)
5. Assign rating (1-5 stars)
6. Document:
   - Strengths
   - Areas for improvement
   - Goals for next period
   - Additional comments
7. Save as draft or mark completed

#### Managing Leave Requests
1. Navigate to **Enterprise > Leave**
2. View pending requests
3. Click on a request to review details
4. Approve or reject with comments
5. System automatically updates leave balances

### For Managers

Managers with appropriate permissions can:
- View their department's employees
- Approve leave requests for their team
- Conduct performance reviews
- View payroll summaries (if permitted)

## Reporting & Analytics

### Available Reports
- **Headcount Reports**: Total and active employees by department
- **Payroll Reports**: Monthly/quarterly/annual payroll totals
- **Performance Reports**: Average ratings, review completion rates
- **Leave Reports**: Utilization rates, pending requests
- **Turnover Reports**: Hiring and termination trends
- **Department Reports**: Budget utilization, headcount

### Dashboard Metrics
The enterprise dashboard provides real-time metrics:
- Total employee count and active status
- Department count
- Pending leave requests requiring attention
- Current month payroll total
- Average performance rating across all reviews
- New hires in last 30 days
- Turnover rate calculation

## Best Practices

### Department Management
- Assign clear managers to each department
- Set realistic budgets
- Review department structure quarterly
- Keep descriptions up-to-date

### Payroll Processing
- Process payroll on consistent schedule
- Review hours carefully before finalizing
- Keep detailed notes on special circumstances
- Archive paid records for compliance

### Performance Reviews
- Conduct reviews on consistent schedule
- Be specific in feedback
- Set measurable goals
- Follow up on previous goals

### Leave Management
- Respond to requests promptly
- Be consistent with approval policies
- Track patterns and trends
- Plan for coverage during absences

### Data Security
- Audit logs regularly reviewed
- Limit access to sensitive payroll data
- Use strong passwords for admin accounts
- Keep employee records confidential

## Future Enhancements

Planned features for future releases:
- **Scheduling System**: Shift scheduling and calendar management
- **Onboarding Workflows**: New hire checklists and documentation
- **Benefits Administration**: Comprehensive benefits management
- **Training Programs**: Course management and tracking
- **Goal Management**: OKR and KPI tracking
- **Document Management**: Centralized employee documents
- **Mobile Access**: Mobile app for employees
- **Reporting Builder**: Custom report creation
- **Email Notifications**: Automated alerts and reminders
- **Multi-location Support**: Manage multiple office locations
- **Expense Tracking**: Employee expense reports
- **Recruitment**: Applicant tracking system integration

## Support

For technical issues or questions:
1. Check the admin logs at `/admin/server-console`
2. Review audit logs for recent changes
3. Verify user permissions
4. Contact system administrator

---

**System Version**: 2.0  
**Last Updated**: March 2026  
**Compatible with**: Employee Management System v1.0+
