"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { useConfirmDialog } from "@/lib/confirm-dialog-context";
import { SkeletonTable } from "@/components/Skeletons";
import { PaginationControls } from "@/components/PaginationControls";
import { validateEmail, validatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthLabel } from "@/lib/form-validation";

interface Employee {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  hourly_rate: number;
  hire_date: string;
  permissions?: string[];
}

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
}

export default function EmployeesPage() {
  const { addToast } = useToast();
  const { confirm: showConfirm } = useConfirmDialog();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, hasNext: false, hasPrev: false });

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    position: "Employee",
    hourly_rate: "0",
    hire_date: new Date().toISOString().split("T")[0],
    notes: "",
    selectedPermissions: [] as string[],
  });

  // Form validation
  const emailError = useMemo(() => {
    if (!editingEmployee && formData.email) {
      return validateEmail(formData.email);
    }
    return null;
  }, [formData.email, editingEmployee]);

  const passwordValidation = useMemo(() => {
    if (!editingEmployee && formData.password) {
      return validatePasswordStrength(formData.password);
    }
    return { isValid: true, errors: [], score: 0 };
  }, [formData.password, editingEmployee]);

  const isFormValid = useMemo(() => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) return false;
    if (!editingEmployee) {
      // Creating new employee: need email and valid password
      if (!formData.email.trim()) return false;
      if (!passwordValidation.isValid) return false;
      return !emailError;
    }
    // Editing: email not required
    return true;
  }, [formData.first_name, formData.last_name, formData.email, passwordValidation, emailError, editingEmployee]);

  async function loadEmployees() {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await fetch("/api/admin/employees?" + params);
      const data = await res.json();
      setEmployees(data.data || []);
      setPagination(data.meta || { total: 0, pages: 0, hasNext: false, hasPrev: false });
      setPermissions(data.permissions || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, [page, limit]);

  function openCreateModal() {
    setEditingEmployee(null);
    setFormData({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      position: "Employee",
      hourly_rate: "0",
      hire_date: new Date().toISOString().split("T")[0],
      notes: "",
      selectedPermissions: [],
    });
    setShowModal(true);
  }

  function openEditModal(emp: Employee) {
    setEditingEmployee(emp);
    setFormData({
      email: emp.email,
      password: "",
      first_name: emp.first_name,
      last_name: emp.last_name,
      phone: emp.phone,
      position: emp.position,
      hourly_rate: String(emp.hourly_rate),
      hire_date: emp.hire_date.split("T")[0],
      notes: "",
      selectedPermissions: emp.permissions || [],
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingEmployee) {
      // Update
      const res = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEmployee.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          position: formData.position,
          hourly_rate: parseFloat(formData.hourly_rate),
          status: editingEmployee.status,
          notes: formData.notes,
          permissions: formData.selectedPermissions,
        }),
      });

      if (res.ok) {
        addToast("Employee updated successfully", "success");
        loadEmployees();
        setShowModal(false);
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to update", "error");
      }
    } else {
      // Create
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hourly_rate: parseFloat(formData.hourly_rate),
          permissions: formData.selectedPermissions,
        }),
      });

      if (res.ok) {
        addToast("Employee created successfully", "success");
        loadEmployees();
        setShowModal(false);
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to create", "error");
        addToast(data.error || "Failed to create", "error");
      }
    }
  }

  async function deleteEmployee(emp: Employee) {
    await showConfirm({
      title: "Delete Employee?",
      description: `Are you sure you want to delete ${emp.first_name} ${emp.last_name}? This action cannot be undone and will remove all associated records.`,
      confirmText: "Delete Employee",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: async () => {
        const res = await fetch(`/api/admin/employees?id=${emp.id}`, { method: "DELETE" });
        if (res.ok) {
          addToast("Employee deleted", "success");
          loadEmployees();
        } else {
          const data = await res.json();
          addToast(data.error || "Failed to delete", "error");
        }
      },
    });
  }

  const filtered = employees.filter(
    (emp) =>
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_number.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase())
  );

  const permissionsByCategory: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!permissionsByCategory[p.category]) permissionsByCategory[p.category] = [];
    permissionsByCategory[p.category].push(p);
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--foreground)" }}>Employees</h1>
        </div>
        <SkeletonTable rows={8} columns={7} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>
            Employees
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
            Manage employee accounts, permissions, and access control.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/employees/add"
            className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
            style={{
              backgroundColor: "#00F0FF",
              color: "#0D1117",
            }}
          >
            ➕ Add Employee (New)
          </Link>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
            style={{
              backgroundColor: "#161B22",
              color: "#8B949E",
              border: "1px solid #21262D",
            }}
          >
            + Quick Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8B949E"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 flex-shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm w-full"
          style={{ color: "#E6EDF3" }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
      >
        {loading ? (
          <div className="py-16 text-center text-sm" style={{ color: "#8B949E" }}>
            Loading...
          </div>
        ) : !filtered.length ? (
          <div className="py-16 text-center text-sm" style={{ color: "#8B949E" }}>
            {search ? "No matching employees." : "No employees yet. Add your first employee to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #21262D" }}>
                  {["#", "Name", "Email", "Position", "Status", "Rate", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                        h === "Actions" ? "text-right" : "text-left"
                      }`}
                      style={{ color: "#8B949E" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid #21262D" : "none",
                    }}
                  >
                    <td className="px-5 py-4 font-mono text-xs" style={{ color: "#8B949E" }}>
                      {emp.employee_number}
                    </td>
                    <td className="px-5 py-4" style={{ color: "#E6EDF3" }}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: "#00F0FF15", color: "#00F0FF" }}
                        >
                          {emp.first_name[0]}
                          {emp.last_name[0]}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div className="text-xs" style={{ color: "#8B949E" }}>
                            {emp.permissions?.length || 0} permissions
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: "#8B949E" }}>
                      {emp.email}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: "#E6EDF3" }}>
                      {emp.position}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={
                          emp.status === "active"
                            ? { backgroundColor: "#00F0FF15", color: "#00F0FF", border: "1px solid #00F0FF33" }
                            : { backgroundColor: "#8B949E15", color: "#8B949E", border: "1px solid #8B949E33" }
                        }
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold" style={{ color: "#E6EDF3" }}>
                      ${emp.hourly_rate.toFixed(2)}/hr
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                          style={{ borderColor: "#21262D", color: "#00F0FF" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEmployee(emp)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all"
                          style={{ borderColor: "#21262D", color: "#8B949E" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="w-full max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#161B22", border: "1px solid #21262D" }}
          >
            <h2 className="text-2xl font-black mb-4" style={{ color: "#E6EDF3" }}>
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
              </div>

              {!editingEmployee && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-3 py-2 rounded-lg text-sm outline-none"
                      style={{
                        backgroundColor: "#0D1117",
                        border: emailError ? "1px solid #EF4444" : "1px solid #30363D",
                        color: "#E6EDF3",
                      }}
                    />
                    {emailError && <p className="text-xs" style={{ color: "#EF4444" }}>{emailError}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                      Password * <span style={{ fontSize: "10px", color: "#8B949E" }}>({getPasswordStrengthLabel(passwordValidation.score) || "Enter password"})</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="px-3 py-2 rounded-lg text-sm outline-none"
                      style={{
                        backgroundColor: "#0D1117",
                        border: !passwordValidation.isValid && formData.password ? "1px solid #EF4444" : "1px solid #30363D",
                        color: "#E6EDF3",
                      }}
                      placeholder="Min 8 chars, 1 upper, 1 number, 1 special"
                    />
                    {passwordValidation.errors.length > 0 && (
                      <ul className="text-xs space-y-1" style={{ color: "#EF4444" }}>
                        {passwordValidation.errors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    )}
                    {formData.password && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${passwordValidation.score}%`,
                              backgroundColor: getPasswordStrengthColor(passwordValidation.score),
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: getPasswordStrengthColor(passwordValidation.score) }}>
                          {getPasswordStrengthLabel(passwordValidation.score)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                  Permissions
                </label>
                <div className="flex flex-col gap-3">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <div className="text-xs font-bold mb-2 uppercase" style={{ color: "#00F0FF" }}>
                        {category}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <label
                            key={perm.code}
                            className="flex items-start gap-2 p-2 rounded-lg cursor-pointer"
                            style={{ backgroundColor: "#0D1117", border: "1px solid #30363D" }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.selectedPermissions.includes(perm.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    selectedPermissions: [...formData.selectedPermissions, perm.code],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedPermissions: formData.selectedPermissions.filter((p) => p !== perm.code),
                                  });
                                }
                              }}
                              style={{ accentColor: "#00F0FF" }}
                            />
                            <div>
                              <div className="text-xs font-semibold" style={{ color: "#E6EDF3" }}>
                                {perm.name}
                              </div>
                              <div className="text-xs" style={{ color: "#8B949E" }}>
                                {perm.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
                >
                  {editingEmployee ? "Update Employee" : "Create Employee"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: "#21262D", color: "#E6EDF3" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Pagination */}
        {!loading && (
          <PaginationControls
            page={page}
            pages={pagination.pages}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            onPageChange={setPage}
            itemsPerPage={limit}
            onItemsPerPageChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            total={pagination.total}
            currentCount={employees.length}
          />
        )}
    </div>
  );
}
