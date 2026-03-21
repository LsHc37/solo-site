"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
}

interface EmployeeData {
  id: number;
  userId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  position: string;
  hourlyRate: number;
  phone: string;
  temporaryPassword: string;
  permissions: { code: string; name: string }[];
}

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [permissionsData, setPermissionsData] = useState<Record<string, Permission[]>>({});
  const [newEmployee, setNewEmployee] = useState<EmployeeData | null>(null);
  const [showCard, setShowCard] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "staff" | "user">("staff");
  const [position, setPosition] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch available permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await fetch("/api/admin/employees/add");
        if (res.ok) {
          const data = await res.json();
          setPermissionsData(data.permissions);
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
      }
    };
    fetchPermissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          role,
          position: position || "Employee",
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
          phone,
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create employee");
      }

      setNewEmployee(data.employee);
      setShowCard(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateAnother = () => {
    setNewEmployee(null);
    setShowCard(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("staff");
    setPosition("");
    setHourlyRate("");
    setPhone("");
    setSelectedPermissions([]);
    setError("");
  };

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  if (showCard && newEmployee) {
    return (
      <>
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .onboarding-card,
            .onboarding-card * {
              visibility: visible;
            }
            .onboarding-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        <div className="min-h-screen bg-[#0D1117] p-8">
          <div className="max-w-4xl mx-auto">
            <div className="no-print mb-8 flex gap-4">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-[#00F0FF] text-black font-bold rounded hover:bg-[#00D8E8] transition-colors"
              >
                🖨️ Print Onboarding Card
              </button>
              <button
                onClick={handleCreateAnother}
                className="px-6 py-3 bg-[#161B22] text-[#E6EDF3] font-bold rounded hover:bg-[#1F2429] transition-colors"
              >
                ➕ Create Another Employee
              </button>
              <button
                onClick={() => router.push("/admin/employees")}
                className="px-6 py-3 bg-[#161B22] text-[#8B949E] rounded hover:bg-[#1F2429] transition-colors"
              >
                ← Back to Employees
              </button>
            </div>

            {/* Onboarding Card */}
            <div className="onboarding-card bg-white text-black p-12 rounded-lg shadow-2xl">
              <div className="border-4 border-[#00F0FF] rounded-lg p-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-2" style={{ color: "#00F0FF" }}>
                    Welcome to the Team!
                  </h1>
                  <p className="text-xl text-gray-600">Employee Onboarding Card</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="border-b-2 border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="text-2xl font-bold">
                      {newEmployee.firstName} {newEmployee.lastName}
                    </p>
                  </div>

                  <div className="border-b-2 border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Employee Number</p>
                    <p className="text-xl font-mono">{newEmployee.employeeNumber}</p>
                  </div>

                  <div className="border-b-2 border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <p className="text-xl font-semibold capitalize">{newEmployee.role}</p>
                  </div>

                  <div className="border-b-2 border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Position</p>
                    <p className="text-xl">{newEmployee.position}</p>
                  </div>

                  <div className="border-b-2 border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="text-xl font-mono">{newEmployee.email}</p>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
                    <p className="text-sm text-yellow-800 mb-2 font-bold">
                      ⚠️ TEMPORARY PASSWORD (Change on First Login)
                    </p>
                    <p className="text-2xl font-mono font-bold text-yellow-900 break-all">
                      {newEmployee.temporaryPassword}
                    </p>
                  </div>

                  <div className="border-b-2 border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Login URL</p>
                    <p className="text-lg font-mono break-all">
                      {typeof window !== "undefined" ? window.location.origin : ""}/login
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-sm font-bold mb-3">Assigned Permissions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {newEmployee.permissions.map((perm) => (
                      <div key={perm.code} className="text-sm text-gray-700">
                        ✓ {perm.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-500">
                  <p>Please keep this card secure. You will be required to change your password on first login.</p>
                  <p className="mt-2">If you have any questions, please contact your supervisor.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/employees")}
            className="text-[#8B949E] hover:text-[#E6EDF3] mb-4"
          >
            ← Back to Employees
          </button>
          <h1 className="text-4xl font-bold mb-2">Add New Employee</h1>
          <p className="text-[#8B949E]">Create a new employee account with role and permissions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#161B22] rounded-lg p-8 space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#00F0FF]">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Role & Position */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#00F0FF]">Role & Position</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hierarchy Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  required
                  className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded focus:border-[#00F0FF] focus:outline-none"
                >
                  <option value="user">User (Level 0)</option>
                  <option value="staff">Staff (Level 1)</option>
                  <option value="manager">Manager (Level 2)</option>
                  <option value="admin">Admin (Level 3)</option>
                </select>
                <p className="text-xs text-[#8B949E] mt-1">
                  Higher levels can manage lower levels
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Position/Title</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g., Sales Associate, Manager"
                  className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#00F0FF]">Custom Permissions</h2>
            <p className="text-sm text-[#8B949E] mb-4">
              Default permissions for the role will be applied automatically. Select additional permissions below.
            </p>

            <div className="space-y-6">
              {Object.entries(permissionsData).map(([category, perms]) => (
                <div key={category} className="border border-[#30363D] rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((perm) => (
                      <label key={perm.code} className="flex items-start gap-3 cursor-pointer hover:bg-[#0D1117] p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.code)}
                          onChange={() => togglePermission(perm.code)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-sm">{perm.name}</div>
                          <div className="text-xs text-[#8B949E]">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-[#30363D]">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#00F0FF] text-black font-bold rounded hover:bg-[#00D8E8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/employees")}
              className="px-8 py-3 bg-[#0D1117] text-[#8B949E] rounded hover:bg-[#161B22] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
