# Database Schema Reference

Quick reference for the complete database schema used in this Next.js application.

## Core Tables

### 1. Users
Primary authentication and HR table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| email | TEXT | NOT NULL UNIQUE | User email address |
| password | TEXT | NOT NULL | Bcrypt hashed password |
| role | TEXT | NOT NULL, CHECK | 'admin', 'manager', 'staff', or 'user' |
| employment_status | TEXT | NOT NULL, CHECK | 'active', 'suspended', or 'terminated' |
| must_change_password | INTEGER | NOT NULL | 0 or 1 (boolean) |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Indexes:**
- `idx_users_role` on `role`
- `idx_users_employment_status` on `employment_status`

---

### 2. Employees
Extended employee information linked to users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | NOT NULL UNIQUE, FK | Reference to users.id |
| employee_number | TEXT | NOT NULL UNIQUE | Employee identification number |
| first_name | TEXT | NOT NULL | First name |
| last_name | TEXT | NOT NULL | Last name |
| phone | TEXT | NOT NULL | Phone number |
| hire_date | TEXT | NOT NULL | ISO 8601 timestamp |
| position | TEXT | NOT NULL | Job title/position |
| status | TEXT | NOT NULL | Employment status |
| hourly_rate | REAL | NOT NULL | Hourly wage |
| notes | TEXT | NOT NULL | Additional notes |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE

**Indexes:**
- `idx_employees_user_id` on `user_id`
- `idx_employees_status` on `status`

---

### 3. Permissions
Available system permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| code | TEXT | NOT NULL UNIQUE | Permission code (e.g., 'edit_site') |
| name | TEXT | NOT NULL | Display name |
| description | TEXT | NOT NULL | Description of permission |
| category | TEXT | NOT NULL | Permission category |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Categories:** employees, time, sales, reports, content, community, system

---

### 4. Employee Permissions
Links employees to their granted permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| employee_id | INTEGER | NOT NULL, FK | Reference to employees.id |
| permission_id | INTEGER | NOT NULL, FK | Reference to permissions.id |
| granted_at | TEXT | NOT NULL | ISO 8601 timestamp |
| granted_by | INTEGER | FK | Reference to employees.id (who granted) |

**Foreign Keys:**
- `employee_id` → `employees(id)` ON DELETE CASCADE
- `permission_id` → `permissions(id)` ON DELETE CASCADE
- `granted_by` → `employees(id)`

**Indexes:**
- `idx_employee_permissions_employee` on `employee_id`

**Constraints:**
- UNIQUE(employee_id, permission_id)

---

### 5. Time Entries (TimeClock)
Employee time tracking with clock-in/out.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| employee_id | INTEGER | NOT NULL, FK | Reference to employees.id |
| clock_in | TEXT | NOT NULL | ISO 8601 timestamp |
| clock_out | TEXT | NULL | ISO 8601 timestamp (null if still clocked in) |
| break_minutes | INTEGER | NOT NULL | Break duration in minutes |
| notes | TEXT | NOT NULL | Entry notes |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Foreign Keys:**
- `employee_id` → `employees(id)` ON DELETE CASCADE

**Indexes:**
- `idx_time_entries_employee_clock_in` on `(employee_id, clock_in DESC)`

---

## Supporting Tables

### 6. Sales
Employee sales tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| employee_id | INTEGER | NOT NULL, FK | Reference to employees.id |
| sale_date | TEXT | NOT NULL | ISO 8601 timestamp |
| customer_name | TEXT | NOT NULL | Customer name |
| product_name | TEXT | NOT NULL | Product name |
| quantity | INTEGER | NOT NULL | Quantity sold |
| unit_price | REAL | NOT NULL | Price per unit |
| total_amount | REAL | NOT NULL | Total sale amount |
| payment_method | TEXT | NOT NULL | Payment method used |
| notes | TEXT | NOT NULL | Sale notes |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Foreign Keys:**
- `employee_id` → `employees(id)` ON DELETE CASCADE

**Indexes:**
- `idx_sales_employee_date` on `(employee_id, sale_date DESC)`
- `idx_sales_date` on `sale_date DESC`

---

### 7. Content Blocks
CMS content blocks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| key | TEXT | NOT NULL UNIQUE | Block key/identifier |
| value | TEXT | NOT NULL | Block content |
| label | TEXT | NOT NULL | Display label |
| section | TEXT | NOT NULL | Content section |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

---

### 8. Site Settings
Application configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | TEXT | PRIMARY KEY | Setting key |
| value | TEXT | NOT NULL | Setting value |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

---

### 9. Announcements
Site-wide announcements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| message | TEXT | NOT NULL | Announcement message |
| active | INTEGER | NOT NULL | 0 or 1 (boolean) |
| color | TEXT | NOT NULL | Display color (hex) |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

---

### 10. Community Posts
User-generated questions and reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| kind | TEXT | NOT NULL, CHECK | 'question' or 'review' |
| author_name | TEXT | NOT NULL | Post author name |
| message | TEXT | NOT NULL | Post content |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Indexes:**
- `idx_community_posts_created_at` on `created_at DESC`
- `idx_community_posts_kind_created_at` on `(kind, created_at DESC)`

---

## Security Tables

### 11. Auth Events
Authentication event logging.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier |
| event | TEXT | NOT NULL | Event type |
| email | TEXT | NULL | User email |
| ip | TEXT | NULL | IP address |
| success | INTEGER | NOT NULL | 0 or 1 (boolean) |
| reason | TEXT | NOT NULL | Event reason/details |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Indexes:**
- `idx_auth_events_email_created_at` on `(email, created_at)`
- `idx_auth_events_ip_created_at` on `(ip, created_at)`

---

### 12. Auth Lockouts
Rate limiting and lockout tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key_type | TEXT | PRIMARY KEY (composite) | 'email' or 'ip' |
| key_value | TEXT | PRIMARY KEY (composite) | Email address or IP |
| blocked_until | TEXT | NOT NULL | ISO 8601 timestamp |
| reason | TEXT | NOT NULL | Lockout reason |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Primary Key:** (key_type, key_value)

---

## Relationships Diagram

```
users (1) ←→ (1) employees
  │
  └─→ (n) auth_events

employees (1) ←→ (n) employee_permissions
  │
  ├─→ (n) time_entries
  ├─→ (n) sales
  └─→ (self) granted_by in employee_permissions

permissions (1) ←→ (n) employee_permissions
```

---

## Role Hierarchy

```
admin (Level 3)
  │
  └─→ manager (Level 2)
        │
        └─→ staff (Level 1)
              │
              └─→ user (Level 0)
```

**Authority Rules:**
- Higher levels can manage lower levels
- Same level cannot manage each other
- Admin has unrestricted access

---

## Default Permissions by Role

### Admin
- full_admin
- access_admin_portal
- view_audit_logs

### Manager
- access_admin_portal
- view_employees
- view_all_time
- view_all_sales
- view_reports
- edit_site
- manage_content
- respond_posts
- moderate_posts

### Staff
- clock_inout
- view_own_time
- log_sales
- view_own_sales
- view_posts

### User
- view_posts

---

## Employment Status Flow

```
┌─────────┐
│ Active  │ ←──── Default for new employees
└────┬────┘
     │
     ├─→ Suspended ←──→ Can be reinstated to Active
     │
     └─→ Terminated ──→ Permanent (login blocked)
```

---

## Database Technology

- **Engine:** SQLite 3 (better-sqlite3)
- **Mode:** WAL (Write-Ahead Logging)
- **Location:** `users.db` in project root
- **Migrations:** Automatic on application start
- **Timestamps:** ISO 8601 format (UTC)

---

## Quick Stats

- **Total Tables:** 12
- **Foreign Key Relationships:** 8
- **Indexes:** 12
- **Default Permissions:** 27
- **Role Levels:** 4
- **Employment Statuses:** 3

---

## Notes

1. All timestamps use ISO 8601 format in UTC
2. Foreign keys cascade on delete where appropriate
3. SQLite booleans stored as INTEGER (0 or 1)
4. Password hashing uses bcrypt with cost factor 12
5. All new columns added via safe migrations (preserve existing data)
