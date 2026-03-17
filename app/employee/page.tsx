"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TimeEntry {
  id: number;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  hours_worked?: number;
  notes: string;
}

interface Sale {
  id: number;
  sale_date: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_name: string;
  payment_method: string;
}

export default function EmployeePortal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesStats, setSalesStats] = useState({ total: 0, today: 0, count: 0 });
  const [employee, setEmployee] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState("0");

  // Sale form
  const [saleForm, setSaleForm] = useState({
    product_name: "",
    quantity: "1",
    unit_price: "",
    customer_name: "",
    payment_method: "cash",
    notes: "",
  });

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadTimeData() {
    try {
      const res = await fetch("/api/employee/time");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCurrentEntry(data.currentEntry);
      setTimeEntries(data.entries || []);
      setEmployee(data.employee);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSalesData() {
    try {
      const res = await fetch("/api/employee/sales");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSales(data.sales || []);
      setSalesStats(data.stats || { total: 0, today: 0, count: 0 });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }

    Promise.all([loadTimeData(), loadSalesData()]).finally(() => setLoading(false));
  }, [session, status, router]);

  async function handleClockIn() {
    try {
      const res = await fetch("/api/employee/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clock_in" }),
      });

      if (res.ok) {
        showToast("Clocked in successfully! 🎉");
        loadTimeData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to clock in", false);
      }
    } catch (err) {
      showToast("Failed to clock in", false);
    }
  }

  async function handleClockOut() {
    if (!clockingOut) {
      setClockingOut(true);
      return;
    }

    try {
      const res = await fetch("/api/employee/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clock_out",
          break_minutes: parseInt(breakMinutes) || 0,
        }),
      });

      if (res.ok) {
        showToast("Clocked out successfully! 👋");
        loadTimeData();
        setClockingOut(false);
        setBreakMinutes("0");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to clock out", false);
      }
    } catch (err) {
      showToast("Failed to clock out", false);
    }
  }

  async function handleLogSale(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/employee/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saleForm,
          quantity: parseInt(saleForm.quantity),
          unit_price: parseFloat(saleForm.unit_price),
        }),
      });

      if (res.ok) {
        showToast("Sale logged successfully! 💰");
        loadSalesData();
        setShowSaleModal(false);
        setSaleForm({
          product_name: "",
          quantity: "1",
          unit_price: "",
          customer_name: "",
          payment_method: "cash",
          notes: "",
        });
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to log sale", false);
      }
    } catch (err) {
      showToast("Failed to log sale", false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0D1117" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#00F0FF" }} />
          <p style={{ color: "#8B949E" }}>Loading...</p>
        </div>
      </div>
    );
  }

  const isClockedIn = currentEntry !== null;
  const clockInTime = currentEntry ? new Date(currentEntry.clock_in) : null;
  const elapsedMs = clockInTime ? Date.now() - clockInTime.getTime() : 0;
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "#0D1117" }}>
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

      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>
              Employee Portal
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
              Welcome back, {employee?.name || "Employee"}! #{employee?.employee_number}
            </p>
          </div>
        </div>

        {/* Clock In/Out Card */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: "#E6EDF3" }}>
            Time Clock
          </h2>

          {!clockingOut ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isClockedIn ? "#00F0FF15" : "#8B949E15",
                  border: `3px solid ${isClockedIn ? "#00F0FF" : "#8B949E"}`,
                }}
              >
                <div className="text-center">
                  <div className="text-2xl font-black" style={{ color: isClockedIn ? "#00F0FF" : "#8B949E" }}>
                    {isClockedIn ? `${elapsedHours}h` : "OFF"}
                  </div>
                  {isClockedIn && (
                    <div className="text-xs" style={{ color: "#8B949E" }}>
                      {elapsedMinutes}m
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                {isClockedIn ? (
                  <div>
                    <div className="text-sm mb-2" style={{ color: "#8B949E" }}>
                      Clocked in at: <span style={{ color: "#E6EDF3" }}>{clockInTime?.toLocaleTimeString()}</span>
                    </div>
                    <button
                      onClick={handleClockOut}
                      className="px-6 py-3 rounded-xl text-sm font-bold"
                      style={{ backgroundColor: "#FF6B6B", color: "#FFF" }}
                    >
                      Clock Out
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm mb-2" style={{ color: "#8B949E" }}>
                      Ready to start your shift?
                    </div>
                    <button
                      onClick={handleClockIn}
                      className="px-6 py-3 rounded-xl text-sm font-bold"
                      style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
                    >
                      Clock In
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm" style={{ color: "#E6EDF3" }}>
                How many minutes of break did you take?
              </p>
              <input
                type="number"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
                placeholder="0"
                className="px-4 py-2 rounded-lg text-sm outline-none max-w-xs"
                style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleClockOut}
                  className="px-6 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
                >
                  Confirm Clock Out
                </button>
                <button
                  onClick={() => {
                    setClockingOut(false);
                    setBreakMinutes("0");
                  }}
                  className="px-6 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: "#21262D", color: "#E6EDF3" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
          >
            <div className="text-xs font-semibold uppercase mb-2" style={{ color: "#8B949E" }}>
              Today's Sales
            </div>
            <div className="text-3xl font-black" style={{ color: "#00F0FF" }}>
              ${salesStats.today.toFixed(2)}
            </div>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
          >
            <div className="text-xs font-semibold uppercase mb-2" style={{ color: "#8B949E" }}>
              Total Sales
            </div>
            <div className="text-3xl font-black" style={{ color: "#E6EDF3" }}>
              ${salesStats.total.toFixed(2)}
            </div>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
          >
            <div className="text-xs font-semibold uppercase mb-2" style={{ color: "#8B949E" }}>
              Transactions
            </div>
            <div className="text-3xl font-black" style={{ color: "#E6EDF3" }}>
              {salesStats.count}
            </div>
          </div>
        </div>

        {/* Log Sale Button */}
        <button
          onClick={() => setShowSaleModal(true)}
          className="w-full py-4 rounded-xl text-sm font-bold transition-all"
          style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
        >
          + Log New Sale
        </button>

        {/* Recent Activity Tabs */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: "#E6EDF3" }}>
              Recent Time Entries
            </h2>
            {timeEntries.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#8B949E" }}>
                No time entries yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #21262D" }}>
                      {["Date", "Clock In", "Clock Out", "Hours"].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "#8B949E" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeEntries.slice(0, 10).map((entry, i) => (
                      <tr key={entry.id} style={{ borderBottom: i < 9 ? "1px solid #21262D" : "none" }}>
                        <td className="px-3 py-2" style={{ color: "#E6EDF3" }}>
                          {new Date(entry.clock_in).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2" style={{ color: "#E6EDF3" }}>
                          {new Date(entry.clock_in).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2" style={{ color: "#E6EDF3" }}>
                          {entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : "Active"}
                        </td>
                        <td className="px-3 py-2 font-semibold" style={{ color: "#00F0FF" }}>
                          {entry.hours_worked ? `${entry.hours_worked.toFixed(2)}h` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: "#E6EDF3" }}>
              Recent Sales
            </h2>
            {sales.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#8B949E" }}>
                No sales logged yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #21262D" }}>
                      {["Date", "Product", "Qty", "Price", "Total"].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "#8B949E" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 10).map((sale, i) => (
                      <tr key={sale.id} style={{ borderBottom: i < 9 ? "1px solid #21262D" : "none" }}>
                        <td className="px-3 py-2" style={{ color: "#E6EDF3" }}>
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2" style={{ color: "#E6EDF3" }}>
                          {sale.product_name}
                        </td>
                        <td className="px-3 py-2" style={{ color: "#8B949E" }}>
                          {sale.quantity}
                        </td>
                        <td className="px-3 py-2" style={{ color: "#8B949E" }}>
                          ${sale.unit_price.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 font-semibold" style={{ color: "#00F0FF" }}>
                          ${sale.total_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ backgroundColor: "#161B22", border: "1px solid #21262D" }}
          >
            <h2 className="text-2xl font-black mb-4" style={{ color: "#E6EDF3" }}>
              Log Sale
            </h2>

            <form onSubmit={handleLogSale} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={saleForm.product_name}
                  onChange={(e) => setSaleForm({ ...saleForm, product_name: e.target.value })}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={saleForm.unit_price}
                    onChange={(e) => setSaleForm({ ...saleForm, unit_price: e.target.value })}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={saleForm.customer_name}
                  onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                  Payment Method
                </label>
                <select
                  value={saleForm.payment_method}
                  onChange={(e) => setSaleForm({ ...saleForm, payment_method: e.target.value })}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3" }}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
                >
                  Log Sale
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
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
