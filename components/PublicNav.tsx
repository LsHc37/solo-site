"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
  { href: "/games", label: "Games" },
  { href: "/solo", label: "Solo" },
  { href: "/kickstart", label: "Get Custom Plan" },
  { href: "/community", label: "Community" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent), transparent)",
              border: "1px solid var(--accent)",
              opacity: 0.3,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="var(--accent)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-sm font-black uppercase"
            style={{ color: "var(--foreground)", letterSpacing: "0.14em" }}
          >
            Retro<span style={{ color: "var(--accent)" }}>Gigz</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{
                  color: active ? "var(--foreground)" : "var(--muted)",
                  backgroundColor: active ? "var(--surface)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-150"
            style={{
              backgroundColor: "var(--accent)",
              border: "1px solid var(--accent)",
              opacity: 0.3,
              color: "var(--accent)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </svg>
            Account
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-9 h-9 rounded-lg border flex items-center justify-center"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {open ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="w-4 h-4"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="w-4 h-4"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--accent)" : "var(--muted)",
                  backgroundColor: active ? "var(--accent)" : "transparent",
                  opacity: active ? 0.15 : 1,
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-1 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold"
              style={{ color: "#00F0FF" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              </svg>
              Account / Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
