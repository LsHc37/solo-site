"use client";

import { useEffect, useState } from "react";
import { getAllPermissions } from "@/lib/rbac";

interface StaffMember {
  user_id: number;
  email: string;
  role: string;
  employment_status: string;
  must_change_password: number;
  totp_enabled: number;
  employee_id: number | null;
  employee_number: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  position: string | null;
  status: string | null;
  hourly_rate: number | null;
  hire_date: string | null;
  permissions: string[];
  permissionNames: string[];
}

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
}

export default function ManageStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error("Error loading staff:", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAction(member: StaffMember, action: string) {
    if (action === "edit_permissions") {
      // Fetch all available permissions
      try {
        const res = await fetch("/api/admin/employees/add");
        if (res.ok) {
          const data = await res.json();
          const perms = Object.values(data.permissions).flat() as Permission[];
          setAllPermissions(perms);
          setSelectedStaff(member);
          setSelectedPermissions(member.permissions);
          setShowPermissionsModal(true);
        }
      } catch (err) {
        showToast("Failed to load permissions", false);
      }
      return;
    }

    const actionMap: Record<string, string> = {
      suspend: "suspend this user",
      terminate: "terminate this employee's employment",
      reactivate: "reactivate this user",
    };

    const confirmMsg = actionMap[action];
    if (!confirmMsg || !confirm(`Are you sure you want to ${confirmMsg}? This will take effect immediately.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: member.user_id,
          action,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message);
        loadStaff();
      } else {
        showToast(data.error || "Action failed", false);
      }
    } catch (err) {
      showToast("An error occurred", false);
    } finally {
      setActionLoading(false);
    }
  }

  async function savePermissions() {
    if (!selectedStaff) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedStaff.user_id,
          action: "update_permissions",
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message);
        setShowPermissionsModal(false);
        loadStaff();
      } else {
        showToast(data.error || "Failed to update permissions", false);
      }
    } catch (err) {
      showToast("An error occurred", false);
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = staff.filter((member) => {
    const name = `${member.first_name || ""} ${member.last_name || ""}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return (
      name.includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower) ||
      (member.employee_number && member.employee_number.toLowerCase().includes(searchLower))
    );
  });

  const permissionsByCategory: Record<string, Permission[]> = {};
  allPermissions.forEach((p) => {
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
      <div>
        <h1 className="text-3xl font-black text-[#E6EDF3]">Manage Staff</h1>
        <p className="text-sm mt-1 text-[#8B949E]">
          View and manage all employees, suspend accounts, and control permissions
        </p>
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
          className="w-4 h-4"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, employee number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm w-full text-[#E6EDF3]"
        />
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
      >
        {loading ? (
          <div className="py-16 text-center text-sm text-[#8B949E]">Loading...</div>
        ) : !filtered.length ? (
          <div className="py-16 text-center text-sm text-[#8B949E]">
            {search ? "No matching staff members." : "No staff members found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #21262D" }}>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    Employee
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    Permissions
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    2FA
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-right text-[#8B949E]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, i) => (
                  <tr
                    key={member.user_id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid #21262D" : "none",
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: "#00F0FF15", color: "#00F0FF" }}
                        >
                          {member.first_name?.[0] || member.email[0].toUpperCase()}
                          {member.last_name?.[0] || ""}
                        </div>
                        <div>
                          <div className="font-semibold text-[#E6EDF3]">
                            {member.first_name && member.last_name
                              ? `${member.first_name} ${member.last_name}`
                              : member.email}
                          </div>
                          <div className="text-xs text-[#8B949E]">{member.email}</div>
                          {member.employee_number && (
                            <div className="text-xs text-[#8B949E] font-mono">
                              #{member.employee_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                        style={{
                          backgroundColor:
                            member.role === "admin"
                              ? "#FF000015"
                              : member.role === "manager"
                              ? "#FFA50015"
                              : "#00F0FF15",
                          color:
                            member.role === "admin"
                              ? "#FF6B6B"
                              : member.role === "manager"
                              ? "#FFA500"
                              : "#00F0FF",
                          border: `1px solid ${
                            member.role === "admin"
                              ? "#FF000033"
                              : member.role === "manager"
                              ? "#FFA50033"
                              : "#00F0FF33"
                          }`,
                        }}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                        style={
                          member.employment_status === "active"
                            ? { backgroundColor: "#00F0FF15", color: "#00F0FF", border: "1px solid #00F0FF33" }
                            : member.employment_status === "suspended"
                            ? { backgroundColor: "#FFA50015", color: "#FFA500", border: "1px solid #FFA50033" }
                            : { backgroundColor: "#FF000015", color: "#FF6B6B", border: "1px solid #FF000033" }
                        }
                      >
                        {member.employment_status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#8B949E]">
                      {member.permissions.length} assigned
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {member.totp_enabled ? (
                        <span className="text-green-400">✓ Enabled</span>
                      ) : (
                        <span className="text-[#8B949E]">Disabled</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative group">
                          <button
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                            style={{ borderColor: "#21262D", color: "#00F0FF" }}
                          >
                            Actions ▼
                          </button>
                          <div
                            className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
                            style={{ backgroundColor: "#161B22", border: "1px solid #21262D" }}
                          >
                            <button
                              onClick={() => handleAction(member, "edit_permissions")}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#1F2429] transition-colors text-[#E6EDF3]"
                            >
                              📝 Edit Permissions
                            </button>
                            {member.employment_status === "active" && (
                              <>
                                <button
                                  onClick={() => handleAction(member, "suspend")}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#1F2429] transition-colors text-[#FFA500]"
                                  disabled={actionLoading}
                                >
                                  ⏸️ Suspend
                                </button>
                                <button
                                  onClick={() => handleAction(member, "terminate")}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#1F2429] transition-colors text-[#FF6B6B]"
                                  disabled={actionLoading}
                                >
                                  🚫 End Employment
                                </button>
                              </>
                            )}
                            {member.employment_status === "suspended" && (
                              <button
                                onClick={() => handleAction(member, "reactivate")}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-[#1F2429] transition-colors text-[#00F0FF]"
                                disabled={actionLoading}
                              >
                                ✓ Reactivate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="w-full max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#161B22", border: "1px solid #21262D" }}
          >
            <h2 className="text-2xl font-black mb-4 text-[#E6EDF3]">
              Edit Permissions - {selectedStaff.first_name} {selectedStaff.last_name}
            </h2>

            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category}>
                  <div className="text-xs font-bold mb-2 uppercase text-[#00F0FF]">{category}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.code}
                        className="flex items-start gap-2 p-2 rounded-lg cursor-pointer"
                        style={{ backgroundColor: "#0D1117", border: "1px solid #30363D" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm.code]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter((p) => p !== perm.code));
                            }
                          }}
                          style={{ accentColor: "#00F0FF" }}
                        />
                        <div>
                          <div className="text-xs font-semibold text-[#E6EDF3]">{perm.name}</div>
                          <div className="text-xs text-[#8B949E]">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={savePermissions}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
              >
                {actionLoading ? "Saving..." : "Save Permissions"}
              </button>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ backgroundColor: "#21262D", color: "#E6EDF3" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
