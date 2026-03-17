"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
      </svg>
    ),
  },
  {
    href: "/admin/enterprise",
    label: "Enterprise",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    href: "/admin/employees",
    label: "Employees",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/content",
    label: "Content",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    href: "/admin/files",
    label: "File Manager",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    href: "/admin/visual-builder",
    label: "Visual Builder",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h6M7 16h8" />
      </svg>
    ),
  },
  {
    href: "/admin/editor",
    label: "Page Editor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    ),
  },
];

interface Props {
  userEmail: string;
}

export default function AdminSidebar({ userEmail }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg border flex items-center justify-center"
        style={{ backgroundColor: "#161B22", borderColor: "#21262D", color: "#8B949E" }}
        aria-label={mobileOpen ? "Close admin navigation" : "Open admin navigation"}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          {mobileOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-30"
          style={{ backgroundColor: "rgba(13, 17, 23, 0.65)" }}
          onClick={() => setMobileOpen(false)}
          aria-label="Close admin navigation overlay"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full flex flex-col z-40 transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: "240px",
          backgroundColor: "#161B22",
          borderRight: "1px solid #21262D",
        }}
      >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid #21262D" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#00F0FF15", border: "1px solid #00F0FF33" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-xs font-black tracking-widest" style={{ color: "#E6EDF3" }}>
            RETRO GIGZ
          </span>
          <span className="text-[10px] font-semibold tracking-wider mt-0.5" style={{ color: "#00F0FF" }}>
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: active ? "#1C2128" : "transparent",
                color: active ? "#00F0FF" : "#8B949E",
                border: active ? "1px solid #21262D" : "1px solid transparent",
              }}
            >
              <span style={{ color: active ? "#00F0FF" : "#8B949E" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: user + logout */}
      <div
        className="px-3 py-4 flex flex-col gap-2"
        style={{ borderTop: "1px solid #21262D" }}
      >
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
          style={{ backgroundColor: "#0D1117", border: "1px solid #21262D" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ backgroundColor: "#00F0FF20", color: "#00F0FF" }}
          >
            {userEmail[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-[10px] font-semibold" style={{ color: "#8B949E" }}>
              Signed in as
            </span>
            <span
              className="text-xs font-medium truncate max-w-[140px]"
              style={{ color: "#E6EDF3" }}
              title={userEmail}
            >
              {userEmail}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all duration-150"
          style={{ color: "#8B949E" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#FF000015";
            (e.currentTarget as HTMLElement).style.color = "#FF6B6B";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#8B949E";
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
      </aside>
    </>
  );
}
