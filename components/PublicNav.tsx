"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import appIcon from "../app_icon.png";

const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
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
      className="sticky top-0 z-40 backdrop-blur-md fade-up"
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid color-mix(in srgb, var(--border) 85%, transparent)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 lift-card"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
              border: "1px solid var(--accent)",
            }}
          >
            <Image src={appIcon} alt="Retro Gigz logo" fill className="object-cover" sizes="32px" />
          </div>
          <span
            className="text-sm font-black uppercase"
            style={{ color: "var(--foreground)", letterSpacing: "0.14em" }}
          >
            Solo <span style={{ color: "var(--accent)" }}>Productivity</span>
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
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  color: active ? "var(--foreground)" : "var(--muted)",
                  backgroundColor: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                  border: `1px solid ${active ? "color-mix(in srgb, var(--accent) 25%, transparent)" : "transparent"}`,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold soft-btn"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 17%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent) 38%, transparent)",
              color: "var(--foreground)",
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
            Login
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
          className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1 fade-up"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  color: active ? "var(--foreground)" : "var(--muted)",
                  backgroundColor: active ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "transparent",
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
              style={{ color: "var(--accent)" }}
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
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
