"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  userCount: number;
  adminCount: number;
  contentCount: number;
  settingsCount: number;
  recentUsers: { id: number; email: string; role: string; created_at: string }[];
}

function StatCard({
  label,
  value,
  sub,
  href,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  href?: string;
  icon: React.ReactNode;
}) {
  const inner = (
    <div
      className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-200"
      style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#00F0FF10", border: "1px solid #00F0FF22" }}
        >
          {icon}
        </div>
        {href && (
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B949E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-3xl font-black" style={{ color: "#E6EDF3" }}>{value}</p>
        <p className="text-sm font-semibold mt-1" style={{ color: "#8B949E" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "#8B949E66" }}>{sub}</p>}
      </div>
    </div>
  );

  if (href)
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );

  return inner;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d: Stats) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: "#8B949E" }}>
          Overview of your site, users, and content.
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl animate-pulse"
              style={{ backgroundColor: "#161B22" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats?.userCount ?? 0}
            sub={`${stats?.adminCount ?? 0} admin${(stats?.adminCount ?? 0) !== 1 ? "s" : ""}`}
            href="/admin/users"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
              </svg>
            }
          />
          <StatCard
            label="Content Blocks"
            value={stats?.contentCount ?? 0}
            sub="Editable text entries"
            href="/admin/content"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            }
          />
          <StatCard
            label="Site Settings"
            value={stats?.settingsCount ?? 0}
            sub="Configured options"
            href="/admin/settings"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            }
          />
          <StatCard
            label="Public Files"
            value="Browse"
            sub="Manage uploaded assets"
            href="/admin/files"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Recent Users */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #21262D" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>
            Recent Users
          </h2>
          <Link
            href="/admin/users"
            className="text-xs font-semibold transition-colors"
            style={{ color: "#00F0FF" }}
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-sm" style={{ color: "#8B949E" }}>
            Loading…
          </div>
        ) : !stats?.recentUsers?.length ? (
          <div className="px-6 py-8 text-center text-sm" style={{ color: "#8B949E" }}>
            No users yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #21262D" }}>
                {["#", "Email", "Role", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#8B949E" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: i < stats.recentUsers.length - 1 ? "1px solid #21262D" : "none",
                  }}
                >
                  <td className="px-6 py-3 font-mono text-xs" style={{ color: "#8B949E" }}>
                    {u.id}
                  </td>
                  <td className="px-6 py-3" style={{ color: "#E6EDF3" }}>
                    {u.email}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={
                        u.role === "admin"
                          ? { backgroundColor: "#00F0FF15", color: "#00F0FF", border: "1px solid #00F0FF33" }
                          : { backgroundColor: "#8B949E15", color: "#8B949E", border: "1px solid #8B949E33" }
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs" style={{ color: "#8B949E" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Links */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: "#E6EDF3" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: "/admin/content", label: "Edit Content", desc: "Update page text" },
            { href: "/admin/settings", label: "Site Settings", desc: "Colors, metadata" },
            { href: "/admin/files", label: "Upload Files", desc: "Manage public assets" },
            { href: "/admin/users", label: "Manage Users", desc: "Roles & accounts" },
            { href: "/admin/editor", label: "Code Editor", desc: "Edit source files" },
            { href: "/", label: "View Site", desc: "Open the live site", external: true },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="flex flex-col gap-1 p-4 rounded-xl border transition-all duration-150"
              style={{ backgroundColor: "#0D1117", borderColor: "#21262D" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#00F0FF44";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#21262D";
              }}
            >
              <span className="text-sm font-semibold" style={{ color: "#E6EDF3" }}>
                {item.label}
              </span>
              <span className="text-xs" style={{ color: "#8B949E" }}>
                {item.desc}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
