"use client";

import { useEffect, useState } from "react";

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");

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

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadEmployees() {
    try {
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      setEmployees(data.employees || []);
      setPermissions(data.permissions || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

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
        showToast("Employee updated successfully");
        loadEmployees();
        setShowModal(false);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update", false);
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
        showToast("Employee created successfully");
        loadEmployees();
        setShowModal(false);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create", false);
      }
    }
  }

  async function deleteEmployee(emp: Employee) {
    if (!confirm(`Delete ${emp.first_name} ${emp.last_name}? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/employees?id=${emp.id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Employee deleted");
      loadEmployees();
    } else {
      const data = await res.json();
      showToast(data.error || "Failed to delete", false);
    }
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

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl"
          style={{
            backgroundColor: toast.ok ? "#00F0FF15" : "#FF000015",
            border: `1px solid ${toast.ok ? "#00F0FF44" : "#FF000044"}`,
            color: toast.ok ? "#00F0FF" : "#FF6B6B",
          }}
        >
          {toast.msg}
        </div>
      )}

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
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
          style={{
            backgroundColor: "#00F0FF",
            color: "#0D1117",
          }}
        >
          + Add Employee
        </button>
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
                      style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                    />
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
                  className="px-4 py-2 rounded-xl text-sm font-bold"
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
    </div>
  );
}
