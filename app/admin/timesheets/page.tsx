"use client";

import { useEffect, useState } from "react";

interface TimeEntry {
  id: number;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  hours_worked: number | null;
  notes: string;
  employee_id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  position: string;
}

interface Employee {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  position: string;
}

export default function TimesheetsPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalHours: "0", totalEntries: 0, uniqueEmployees: 0 });

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadTimesheets();
  }, [employeeFilter, startDate, endDate]);

  async function loadTimesheets() {
    try {
      const params = new URLSearchParams();
      if (employeeFilter) params.append("employee", employeeFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/admin/timesheets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setEmployees(data.employees || []);
        setStats(data.stats || { totalHours: "0", totalEntries: 0, uniqueEmployees: 0 });
      }
    } catch (err) {
      console.error("Error loading timesheets:", err);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setEmployeeFilter("");
    setStartDate("");
    setEndDate("");
  }

  function exportToCSV() {
    const headers = ["Employee #", "Name", "Position", "Clock In", "Clock Out", "Break (min)", "Hours"];
    const rows = entries.map((entry) => [
      entry.employee_number,
      `${entry.first_name} ${entry.last_name}`,
      entry.position,
      new Date(entry.clock_in).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      entry.clock_out ? new Date(entry.clock_out).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Active",
      entry.break_minutes.toString(),
      entry.hours_worked ? entry.hours_worked.toFixed(2) : "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheets_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#E6EDF3]">Timesheets</h1>
          <p className="text-sm mt-1 text-[#8B949E]">
            View and manage all employee time entries
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={entries.length === 0}
          className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
        >
          📥 Export to CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div className="text-xs font-semibold uppercase mb-2 text-[#8B949E]">
            Total Hours
          </div>
          <div className="text-3xl font-black text-[#00F0FF]">{stats.totalHours}h</div>
        </div>
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div className="text-xs font-semibold uppercase mb-2 text-[#8B949E]">
            Total Entries
          </div>
          <div className="text-3xl font-black text-[#E6EDF3]">{stats.totalEntries}</div>
        </div>
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div className="text-xs font-semibold uppercase mb-2 text-[#8B949E]">
            Employees
          </div>
          <div className="text-3xl font-black text-[#E6EDF3]">{stats.uniqueEmployees}</div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
      >
        <h2 className="text-xl font-bold mb-4 text-[#E6EDF3]">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#8B949E]">
              Employee Name/Number
            </label>
            <input
              type="text"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-[#E6EDF3] focus:border-[#00F0FF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#8B949E]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-[#E6EDF3] focus:border-[#00F0FF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#8B949E]">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-[#E6EDF3] focus:border-[#00F0FF] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-[#21262D] text-[#8B949E] rounded-lg hover:bg-[#1F2429] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
      >
        {loading ? (
          <div className="py-16 text-center text-sm text-[#8B949E]">Loading...</div>
        ) : !entries.length ? (
          <div className="py-16 text-center text-sm text-[#8B949E]">
            No timesheet entries found. Adjust your filters or check back later.
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
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    Clock In
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    Clock Out
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    Break
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left text-[#8B949E]">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: i < entries.length - 1 ? "1px solid #21262D" : "none",
                    }}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-semibold text-[#E6EDF3]">
                          {entry.first_name} {entry.last_name}
                        </div>
                        <div className="text-xs text-[#8B949E]">
                          #{entry.employee_number} · {entry.position}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#E6EDF3]">
                      {new Date(entry.clock_in).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                    <td className="px-5 py-4 text-[#E6EDF3]">
                      {new Date(entry.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-5 py-4">
                      {entry.clock_out ? (
                        <span className="text-[#E6EDF3]">
                          {new Date(entry.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-[#00F0FF] font-semibold">🟢 Active</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#8B949E]">
                      {entry.break_minutes} min
                    </td>
                    <td className="px-5 py-4">
                      {entry.hours_worked !== null ? (
                        <span className="text-[#00F0FF] font-bold">
                          {entry.hours_worked.toFixed(2)}h
                        </span>
                      ) : (
                        <span className="text-[#8B949E]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Summary */}
      {!loading && entries.length > 0 && (
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <h2 className="text-xl font-bold mb-4 text-[#E6EDF3]">Summary by Employee</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(
              entries.reduce((acc, entry) => {
                const key = entry.employee_id;
                if (!acc.has(key)) {
                  acc.set(key, {
                    name: `${entry.first_name} ${entry.last_name}`,
                    number: entry.employee_number,
                    position: entry.position,
                    hours: 0,
                    entries: 0,
                  });
                }
                const emp = acc.get(key)!;
                if (entry.hours_worked) emp.hours += entry.hours_worked;
                emp.entries++;
                return acc;
              }, new Map<number, any>())
            ).map(([id, data]) => (
              <div
                key={id}
                className="p-4 rounded-lg"
                style={{ backgroundColor: "#0D1117", border: "1px solid #30363D" }}
              >
                <div className="font-semibold text-[#E6EDF3]">{data.name}</div>
                <div className="text-xs text-[#8B949E] mb-2">
                  #{data.number} · {data.position}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-[#8B949E]">Hours:</span>
                    <span className="text-[#00F0FF] font-bold ml-1">
                      {data.hours.toFixed(2)}h
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8B949E]">Entries:</span>
                    <span className="text-[#E6EDF3] font-semibold ml-1">{data.entries}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
