"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingRole, setPendingRole] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d: { users: User[] }) => {
        setUsers(d.users ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changeRole(id: number, role: string) {
    setPendingRole((p) => ({ ...p, [id]: role }));
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x)));
      showToast(`Role updated to ${role}`);
    } else {
      showToast(data.error ?? "Failed", false);
    }
    setPendingRole((p) => { const n = { ...p }; delete n[id]; return n; });
  }

  async function deleteUser(id: number, email: string) {
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.id !== id));
      showToast("User deleted");
    } else {
      showToast(data.error ?? "Failed", false);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
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
          <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>Users</h1>
          <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
            Manage accounts, assign roles, and remove users.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B949E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-48"
            style={{ color: "#E6EDF3" }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
      >
        {loading ? (
          <div className="py-16 text-center text-sm" style={{ color: "#8B949E" }}>
            Loading users…
          </div>
        ) : !filtered.length ? (
          <div className="py-16 text-center text-sm" style={{ color: "#8B949E" }}>
            {search ? "No matching users." : "No users yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #21262D" }}>
                  {["#", "Email", "Role", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}
                      style={{ color: "#8B949E" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid #21262D" : "none",
                    }}
                  >
                    <td className="px-5 py-4 font-mono text-xs" style={{ color: "#8B949E" }}>
                      {u.id}
                    </td>
                    <td className="px-5 py-4" style={{ color: "#E6EDF3" }}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: "#00F0FF15", color: "#00F0FF" }}
                        >
                          {u.email[0]?.toUpperCase()}
                        </div>
                        {u.email}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={
                          u.role === "admin"
                            ? { backgroundColor: "#00F0FF15", color: "#00F0FF", border: "1px solid #00F0FF33" }
                            : { backgroundColor: "#8B949E15", color: "#8B949E", border: "1px solid #8B949E33" }
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: "#8B949E" }}>
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role toggle */}
                        {pendingRole[u.id] ? (
                          <span className="text-xs" style={{ color: "#8B949E" }}>Saving…</span>
                        ) : (
                          <button
                            onClick={() => changeRole(u.id, u.role === "admin" ? "user" : "admin")}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150"
                            style={{
                              borderColor: "#21262D",
                              color: "#8B949E",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = "#00F0FF44";
                              (e.currentTarget as HTMLElement).style.color = "#00F0FF";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = "#21262D";
                              (e.currentTarget as HTMLElement).style.color = "#8B949E";
                            }}
                          >
                            {u.role === "admin" ? "Make User" : "Make Admin"}
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-150"
                          style={{ borderColor: "#21262D", color: "#8B949E" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "#FF000044";
                            (e.currentTarget as HTMLElement).style.color = "#FF6B6B";
                            (e.currentTarget as HTMLElement).style.backgroundColor = "#FF000010";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "#21262D";
                            (e.currentTarget as HTMLElement).style.color = "#8B949E";
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                          }}
                          title="Delete user"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
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

      {/* Count */}
      {!loading && (
        <p className="text-xs" style={{ color: "#8B949E" }}>
          Showing {filtered.length} of {users.length} user{users.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
