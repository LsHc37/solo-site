"use client";
import { useEffect, useState } from "react";

interface SiteState {
  maintenanceMode: boolean;
  announcementActive: boolean;
  announcementText: string;
  announcementColor: string;
}

export default function Home() {
  const [siteState, setSiteState] = useState<SiteState>({
    maintenanceMode: false,
    announcementActive: false,
    announcementText: "",
    announcementColor: "#00F0FF",
  });
  const [siteStateLoaded, setSiteStateLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/public/site-state", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: SiteState) => {
        setSiteState({
          maintenanceMode: Boolean(data.maintenanceMode),
          announcementActive: Boolean(data.announcementActive),
          announcementText: data.announcementText ?? "",
          announcementColor: data.announcementColor ?? "#00F0FF",
        });
      })
      .finally(() => setSiteStateLoaded(true));
  }, []);

  if (!siteStateLoaded) {
    return <main className="min-h-screen" style={{ backgroundColor: "#0D1117" }} />;
  }

  if (siteState.maintenanceMode) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: "#0D1117", color: "#E6EDF3" }}
      >
        <div
          className="w-full max-w-2xl rounded-2xl border p-10 text-center"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Maintenance Mode</h1>
          <p className="mt-3 text-sm sm:text-base" style={{ color: "#8B949E" }}>
            We are currently performing maintenance. Please check back shortly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0D1117", color: "#E6EDF3" }}>
      {siteState.announcementActive && siteState.announcementText && (
        <div
          className="px-6 py-2.5 text-center text-sm font-semibold"
          style={{
            color: siteState.announcementColor,
            backgroundColor: `${siteState.announcementColor}1A`,
            borderBottom: `1px solid ${siteState.announcementColor}55`,
          }}
        >
          {siteState.announcementText}
        </div>
      )}

      {/* ── Sticky Nav ───────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: "#0D1117",
          borderBottom: "1px solid #161B22",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="text-sm font-black tracking-widest" style={{ color: "#E6EDF3" }}>
          RETRO GIGZ
        </span>
        <a
          href="/login"
          className="text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 tracking-wide"
          style={{
            border: "1px solid #00F0FF",
            color: "#00F0FF",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#00F0FF15";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(0,240,255,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          Account
        </a>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle radial glow behind headline */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,240,255,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-28 text-center flex flex-col items-center gap-6">
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest"
            style={{ borderColor: "#00F0FF33", color: "#00F0FF", backgroundColor: "#00F0FF0D" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#00F0FF" }} />
            Master Technology &amp; Software Publisher
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl xl:text-8xl font-black leading-none tracking-tight">
            Digital<br />
            <span style={{ color: "#00F0FF" }}>Independence.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl leading-relaxed max-w-2xl"
            style={{ color: "#8B949E" }}
          >
            A master publisher building privacy-first applications, independent games, and tactical
            apparel. We build software that respects your silence.
          </p>

          {/* CTA */}
          <a
            href="#divisions"
            className="mt-2 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              backgroundColor: "#00F0FF",
              color: "#0D1117",
              boxShadow: "0 0 24px rgba(0,240,255,0.4)",
            }}
          >
            Explore Our Divisions
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── Privacy Pledge ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div
          className="rounded-2xl border p-10 flex flex-col gap-8"
          style={{ backgroundColor: "#161B22", borderColor: "#00F0FF22", boxShadow: "0 0 48px rgba(0,240,255,0.05)" }}
        >
          {/* Heading */}
          <div className="flex flex-col gap-2 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#0D1117", border: "1px solid #00F0FF33" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "#E6EDF3" }}>
              Your Data. Your Device. <span style={{ color: "#00F0FF" }}>Always.</span>
            </h2>
            <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#8B949E" }}>
              Retro Gigz is committed to the absolute protection of user data. This is not a policy
              — it is the foundation every product we build is engineered on.
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {/* Pillar 1 */}
            <div className="flex flex-col gap-3 p-6 rounded-xl" style={{ backgroundColor: "#0D1117", border: "1px solid #21262D" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00F0FF10", border: "1px solid #00F0FF33" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
                </svg>
              </div>
              <h3 className="text-sm font-bold tracking-tight" style={{ color: "#E6EDF3" }}>Data Stays on Our Servers</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#8B949E" }}>
                Any account data you choose to store with us lives exclusively on Retro Gigz
                infrastructure. It is never sold, shared, or transmitted to third parties — ever.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col gap-3 p-6 rounded-xl" style={{ backgroundColor: "#0D1117", border: "1px solid #21262D" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00F0FF10", border: "1px solid #00F0FF33" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5" />
                  <line x1="9" y1="7" x2="15" y2="7" />
                  <line x1="9" y1="11" x2="15" y2="11" />
                </svg>
              </div>
              <h3 className="text-sm font-bold tracking-tight" style={{ color: "#E6EDF3" }}>100% Offline Apps</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#8B949E" }}>
                All Retro Gigz applications are built to run entirely on your device without an
                internet connection. No background sync. No cloud dependency. No hidden uploads.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col gap-3 p-6 rounded-xl" style={{ backgroundColor: "#0D1117", border: "1px solid #21262D" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00F0FF10", border: "1px solid #00F0FF33" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeDasharray="2 3" />
                </svg>
              </div>
              <h3 className="text-sm font-bold tracking-tight" style={{ color: "#E6EDF3" }}>Zero Data Leaving Your Device</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#8B949E" }}>
                Your personal data — habits, health metrics, financials, usage patterns — never
                leaves your device under any circumstance. What happens on your phone stays on your phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Division Cards ────────────────────────────────────────────── */}
      <section id="divisions" className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#8B949E" }}>
            Three divisions. One mission.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Division 1: Solo Productivity ── */}
          <a
            href="/solo"
            className="group flex flex-col gap-6 p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
            style={{
              backgroundColor: "#161B22",
              borderColor: "#21262D",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#00F0FF55";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(0,240,255,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#21262D";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#0D1117" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold" style={{ color: "#E6EDF3" }}>Solo Productivity</h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>
                Privacy-first mobile apps that run 100% offline. AI personal trainer, food scanner,
                deep work timer, habit tracker, and budget vault — all in one device-locked suite.
              </p>
            </div>
            <div
              className="text-xs font-mono px-3 py-1.5 rounded-lg self-start"
              style={{ backgroundColor: "#0D1117", color: "#00F0FF99", border: "1px solid #21262D" }}
            >
              retrogigz.com/solo →
            </div>
          </a>

          {/* ── Division 2: Retro Gigz Games ── */}
          <div
            className="group flex flex-col gap-6 p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-default"
            style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#00F0FF55";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(0,240,255,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#21262D";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#0D1117" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="2" y="6" width="20" height="12" rx="3" />
                <path d="M6 12h4M8 10v4" />
                <circle cx="15" cy="11" r="1" fill="#00F0FF" stroke="none" />
                <circle cx="18" cy="13" r="1" fill="#00F0FF" stroke="none" />
              </svg>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold" style={{ color: "#E6EDF3" }}>Retro Gigz Games</h3>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#00F0FF15", color: "#00F0FF", border: "1px solid #00F0FF33" }}
                >
                  Coming Soon
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>
                Independent game studio focused on tactical and immersive experiences. Our flagship
                title <span style={{ color: "#E6EDF3", fontWeight: 600 }}>Vanguard</span> is a
                hardcore tactical shooter built for players who demand depth, strategy, and
                replayability.
              </p>
            </div>
            <div
              className="text-xs font-mono px-3 py-1.5 rounded-lg self-start"
              style={{ backgroundColor: "#0D1117", color: "#00F0FF99", border: "1px solid #21262D" }}
            >
              FLAGSHIP: VANGUARD
            </div>
          </div>

          {/* ── Division 3: Apparel Division ── */}
          <a
            href="https://www.dmclothingandapparel.com/home"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-6 p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
            style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#00F0FF55";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(0,240,255,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#21262D";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#0D1117" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M20.38 3.46L16 2l-4 4-4-4-4.38 1.46A2 2 0 0 0 2 5.36V22h20V5.36a2 2 0 0 0-1.62-1.9z" />
              </svg>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold" style={{ color: "#E6EDF3" }}>Apparel Division</h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>
                Tactical and minimalist streetwear for the digitally sovereign. Designed for
                operators who move quietly, think independently, and dress with intent. No logos. No noise.
              </p>
            </div>
            <div
              className="text-xs font-mono px-3 py-1.5 rounded-lg self-start"
              style={{ backgroundColor: "#0D1117", color: "#00F0FF99", border: "1px solid #21262D" }}
            >
              COLLECTION: DROP_001
            </div>
          </a>

        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #21262D" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-wide" style={{ color: "#E6EDF3" }}>
            RETRO GIGZ
            <span className="ml-3 font-normal" style={{ color: "#8B949E" }}>
              &copy; {new Date().getFullYear()} All rights reserved.
            </span>
          </p>
          <nav className="flex items-center gap-6">
            {["FAQ", "Contact & Support", "Privacy Policy"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-sm transition-colors duration-150 hover:text-white"
                style={{ color: "#8B949E" }}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>

    </main>
  );
}
