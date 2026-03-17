"use client";

import { useEffect, useState } from "react";

interface Department {
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

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  employee_number: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager_id: "",
    budget: "0",
  });

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadDepartments() {
    try {
      const res = await fetch("/api/admin/enterprise/departments");
      const data = await res.json();
      setDepartments(data.departments || []);
      setEmployees(data.employees || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function openCreateModal() {
    setEditingDepartment(null);
    setFormData({
      name: "",
      description: "",
      manager_id: "",
      budget: "0",
    });
    setShowModal(true);
  }

  function openEditModal(dept: Department) {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      manager_id: dept.manager_id?.toString() || "",
      budget: dept.budget.toString(),
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description,
      manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
      budget: parseFloat(formData.budget),
    };

    if (editingDepartment) {
      const res = await fetch("/api/admin/enterprise/departments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingDepartment.id, ...payload }),
      });

      if (res.ok) {
        showToast("Department updated successfully");
        loadDepartments();
        setShowModal(false);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update", false);
      }
    } else {
      const res = await fetch("/api/admin/enterprise/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Department created successfully");
        loadDepartments();
        setShowModal(false);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create", false);
      }
    }
  }

  async function deleteDepartment(dept: Department) {
    if (!confirm(`Delete ${dept.name}? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/enterprise/departments?id=${dept.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      showToast("Department deleted");
      loadDepartments();
    } else {
      const data = await res.json();
      showToast(data.error || "Failed to delete", false);
    }
  }

  const filtered = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.description.toLowerCase().includes(search.toLowerCase()) ||
      dept.manager_name?.toLowerCase().includes(search.toLowerCase())
  );

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
            Departments
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
            Manage organizational structure and department budgets
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
          + Add Department
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
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm w-full"
          style={{ color: "#E6EDF3" }}
        />
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: "#8B949E" }}>
          Loading...
        </div>
      ) : !filtered.length ? (
        <div className="py-16 text-center text-sm" style={{ color: "#8B949E" }}>
          {search ? "No matching departments." : "No departments yet. Create your first department to get started."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-black mb-1" style={{ color: "#E6EDF3" }}>
                    {dept.name}
                  </h3>
                  <p className="text-xs mb-3" style={{ color: "#8B949E" }}>
                    {dept.description || "No description"}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full ml-2"
                  style={
                    dept.status === "active"
                      ? { backgroundColor: "#00F0FF15", color: "#00F0FF", border: "1px solid #00F0FF33" }
                      : { backgroundColor: "#8B949E15", color: "#8B949E", border: "1px solid #8B949E33" }
                  }
                >
                  {dept.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "#8B949E" }}>Manager:</span>
                  <span style={{ color: "#E6EDF3" }}>{dept.manager_name || "None"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "#8B949E" }}>Employees:</span>
                  <span style={{ color: "#E6EDF3" }}>{dept.employee_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "#8B949E" }}>Budget:</span>
                  <span style={{ color: "#E6EDF3" }}>${dept.budget.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(dept)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all"
                  style={{ borderColor: "#21262D", color: "#00F0FF" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteDepartment(dept)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border transition-all"
                  style={{ borderColor: "#21262D", color: "#FF6B6B" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="w-full max-w-2xl rounded-2xl p-6"
            style={{ backgroundColor: "#161B22", border: "1px solid #21262D" }}
          >
            <h2 className="text-2xl font-black mb-4" style={{ color: "#E6EDF3" }}>
              {editingDepartment ? "Edit Department" : "Add Department"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Manager
                  </label>
                  <select
                    value={formData.manager_id}
                    onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  >
                    <option value="">None</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Budget
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
                >
                  {editingDepartment ? "Update Department" : "Create Department"}
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
