import Link from "next/link";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#0D1117", borderTop: "1px solid #21262D" }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #00F0FF22, #00F0FF08)",
                  border: "1px solid #00F0FF44",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#00F0FF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="text-sm font-black uppercase"
                style={{ color: "#E6EDF3", letterSpacing: "0.14em" }}
              >
                Solo <span style={{ color: "#00F0FF" }}>Productivity</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#8B949E" }}>
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
                    className="text-sm"
                    style={{ color: "#8B949E" }}
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
                { href: "/login", label: "Account" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm"
                    style={{ color: "#8B949E" }}
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
          style={{ borderTop: "1px solid #21262D" }}
        >
          <p className="text-xs" style={{ color: "#8B949E" }}>
            © {year} Solo Productivity. All rights reserved.
          </p>
          <p
            className="text-xs font-semibold tracking-wider"
            style={{ color: "#00F0FF55" }}
          >
            Digital Independence.
          </p>
        </div>
      </div>
    </footer>
  );
}
