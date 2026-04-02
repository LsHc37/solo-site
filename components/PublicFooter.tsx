import Image from "next/image";
import Link from "next/link";
import appIcon from "../app_icon.png";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "var(--background)", borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 fade-up">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0"
                style={{
                  backgroundColor: "#00F0FF12",
                  border: "1px solid #00F0FF44",
                }}
              >
                <Image src={appIcon} alt="Retro Gigz logo" fill className="object-cover" sizes="28px" />
              </div>
              <span
                className="text-sm font-black uppercase"
                style={{ color: "var(--foreground)", letterSpacing: "0.14em" }}
              >
                Solo <span style={{ color: "var(--accent)" }}>Productivity</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--muted)" }}>
              Privacy-first software for solo builders, runners, and focused creators.
              Built for digital independence and deep work.
            </p>
          </div>

          {/* Products */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#8B949E" }}
            >
              Products
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/solo", label: "Solo App" },
                { href: "/community", label: "Community" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm soft-btn"
                    style={{ color: "var(--muted)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#8B949E" }}
            >
              Company
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/account", label: "Account" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm soft-btn"
                    style={{ color: "var(--muted)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            © {year} Solo Productivity. All rights reserved.
          </p>
          <p
            className="text-xs font-semibold tracking-wider"
            style={{ color: "color-mix(in srgb, var(--accent) 50%, transparent)" }}
          >
            Digital Independence.
          </p>
        </div>
      </div>
    </footer>
  );
}
