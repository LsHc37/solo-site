"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  total_employees: number;
  active_employees: number;
  total_departments: number;
  pending_leave_requests: number;
  total_payroll_this_month: number;
  average_performance_rating: number;
  recent_hires: number;
  turnover_rate: number;
}

interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  created_at: string;
}

export default function EnterpriseDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await fetch("/api/admin/enterprise/dashboard");
      const data = await res.json();
      setStats(data.stats);
      setRecentActivity(data.recentActivity || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const statCards = stats
    ? [
        { label: "Total Employees", value: stats.total_employees, icon: "👥", color: "#00F0FF" },
        { label: "Active Employees", value: stats.active_employees, icon: "✓", color: "#00FF88" },
        { label: "Departments", value: stats.total_departments, icon: "🏢", color: "#FF00FF" },
        { label: "Pending Leave", value: stats.pending_leave_requests, icon: "📅", color: "#FFB800" },
        {
          label: "Monthly Payroll",
          value: `$${stats.total_payroll_this_month.toLocaleString()}`,
          icon: "💰",
          color: "#00F0FF",
        },
        {
          label: "Avg Performance",
          value: stats.average_performance_rating.toFixed(1) + "/5.0",
          icon: "⭐",
          color: "#FFD700",
        },
        { label: "Recent Hires (30d)", value: stats.recent_hires, icon: "🆕", color: "#00FF88" },
        { label: "Turnover Rate", value: stats.turnover_rate.toFixed(1) + "%", icon: "📊", color: "#FF6B6B" },
      ]
    : [];

  const quickLinks = [
    { label: "Manage Departments", href: "/admin/enterprise/departments", icon: "🏢" },
    { label: "Manage Employees", href: "/admin/employees", icon: "👥" },
    { label: "Payroll Records", href: "/admin/enterprise/payroll", icon: "💰" },
    { label: "Performance Reviews", href: "/admin/enterprise/performance", icon: "⭐" },
    { label: "Leave Requests", href: "/admin/enterprise/leave", icon: "📅" },
    { label: "User Management", href: "/admin/users", icon: "🔑" },
  ];

  const actionLabels: Record<string, string> = {
    CREATE_DEPARTMENT: "Created department",
    UPDATE_DEPARTMENT: "Updated department",
    DELETE_DEPARTMENT: "Deleted department",
    CREATE_PAYROLL: "Created payroll record",
    CREATE_PERFORMANCE_REVIEW: "Created performance review",
    CREATE_LEAVE_REQUEST: "Created leave request",
    APPROVE_LEAVE_REQUEST: "Approved leave request",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>
          Enterprise Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
          Comprehensive employee and organizational management system
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm" style={{ color: "#8B949E" }}>
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  ></div>
                </div>
                <div className="text-2xl font-black mb-1" style={{ color: "#E6EDF3" }}>
                  {stat.value}
                </div>
                <div className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-xl font-black mb-4" style={{ color: "#E6EDF3" }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="rounded-xl p-4 border transition-all duration-150 hover:scale-[1.02]"
                  style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{link.icon}</span>
                    <span className="font-semibold" style={{ color: "#E6EDF3" }}>
                      {link.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-black mb-4" style={{ color: "#E6EDF3" }}>
              Recent Activity
            </h2>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
            >
              {!recentActivity.length ? (
                <div className="py-8 text-center text-sm" style={{ color: "#8B949E" }}>
                  No recent activity
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "#21262D" }}>
                  {recentActivity.slice(0, 10).map((log) => (
                    <div key={log.id} className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "#00F0FF" }}
                        ></div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "#E6EDF3" }}>
                            {actionLabels[log.action] || log.action}
                          </div>
                          <div className="text-xs" style={{ color: "#8B949E" }}>
                            {log.entity_type}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs" style={{ color: "#8B949E" }}>
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
