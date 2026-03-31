"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

interface SiteState {
  maintenanceMode: boolean;
  announcementActive: boolean;
  announcementText: string;
  announcementColor: string;
  siteName: string;
  tagline: string;
  primaryColor: string;
  bgColor: string;
  contactEmail: string;
  soloAndroidPlayStoreUrl: string;
  contentBlocks: Record<string, string>;
}

export default function SoloPage() {
  const [siteState, setSiteState] = useState<SiteState>({
    maintenanceMode: false,
    announcementActive: false,
    announcementText: "",
    announcementColor: "#00F0FF",
    siteName: "Retro Gigz",
    tagline: "Digital Independence.",
    primaryColor: "#00F0FF",
    bgColor: "#0D1117",
    contactEmail: "",
    soloAndroidPlayStoreUrl: "https://play.google.com/store",
    contentBlocks: {},
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
          siteName: data.siteName ?? "Retro Gigz",
          tagline: data.tagline ?? "Digital Independence.",
          primaryColor: data.primaryColor ?? "#00F0FF",
          bgColor: data.bgColor ?? "#0D1117",
          contactEmail: data.contactEmail ?? "",
          soloAndroidPlayStoreUrl: data.soloAndroidPlayStoreUrl ?? "https://play.google.com/store",
          contentBlocks: data.contentBlocks ?? {},
        });
      })
      .finally(() => setSiteStateLoaded(true));
  }, []);

  if (!siteStateLoaded) {
    return (
      <div style={{ backgroundColor: "#0D1117", minHeight: "100vh" }}>
        <PublicNav />
      </div>
    );
  }

  if (siteState.maintenanceMode) {
    return (
      <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
        <PublicNav />
        <main className="flex items-center justify-center px-6 py-32">
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
        <PublicFooter />
      </div>
    );
  }

  const getBlock = (key: string, fallback: string) => {
    const value = siteState.contentBlocks[key];
    return value && value.trim() ? value : fallback;
  };

  const siteName = getBlock("site_name", siteState.siteName || "Retro Gigz");
  const soloHeroTitle = getBlock("solo_hero_title", "100% Offline\n& Private");
  const soloHeroSubheadline = getBlock(
    "solo_hero_subheadline",
    "The ultimate all-in-one life operating system. AI trainer, food scanner, and budget vault. Your data never leaves your device.",
  );

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col-reverse lg:flex-row items-center gap-16">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-tight tracking-tight">
            {soloHeroTitle.split("\n").map((part, index, arr) => (
              <span key={index}>
                {part}
                {index < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="text-lg sm:text-xl leading-relaxed max-w-xl" style={{ color: "#8B949E" }}>
            {soloHeroSubheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              href="/solo/waitlist"
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border"
              style={{
                backgroundColor: "#00F0FF",
                borderColor: "#00F0FF",
                color: "#0D1117",
                boxShadow: "0 0 18px rgba(0, 240, 255, 0.45)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Join iOS Waitlist
            </Link>

            <Link
              href={siteState.soloAndroidPlayStoreUrl || "https://play.google.com/store"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border"
              style={{
                backgroundColor: "transparent",
                borderColor: "#00F0FF",
                color: "#00F0FF",
                boxShadow: "0 0 18px rgba(0, 240, 255, 0.15)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.18 23.76c.3.17.64.22.97.14l12.54-7.24-2.79-2.79-10.72 9.89zM.87 1.46C.34 1.96 0 2.75 0 3.8v16.4c0 1.05.34 1.84.87 2.34l.12.11 9.19-9.19v-.22L1 1.35l-.13.11zM20.93 10.27l-2.63-1.52-3.12 3.12 3.12 3.12 2.65-1.53c.76-.44.76-1.75-.02-2.19zM3.18.24l10.72 9.89-2.79 2.79L1.15.68C1.46.36 1.88.07 3.18.24z" />
              </svg>
              Download on Android
            </Link>
          </div>
        </div>

        {/* Right Column — Phone Mockup Placeholder */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <div
            className="relative w-64 h-[520px] sm:w-72 sm:h-[580px] rounded-[3rem] flex items-center justify-center border"
            style={{
              backgroundColor: "#161B22",
              borderColor: "#30363D",
              boxShadow: "0 0 60px rgba(0, 240, 255, 0.12), 0 0 120px rgba(0, 240, 255, 0.06)",
            }}
          >
            <div className="absolute top-5 w-24 h-6 rounded-full" style={{ backgroundColor: "#0D1117" }} />
            <div
              className="w-[85%] h-[78%] rounded-[2rem] flex flex-col items-center justify-center gap-3 mt-4"
              style={{ backgroundColor: "#0D1117", border: "1px solid #21262D" }}
            >
              <div
                className="w-14 h-14 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #00F0FF 0%, #0070FF 100%)",
                  boxShadow: "0 0 24px rgba(0, 240, 255, 0.5)",
                }}
              />
              <span className="text-xs font-medium" style={{ color: "#8B949E" }}>3D Mockup</span>
            </div>
            <div className="absolute bottom-4 w-24 h-1.5 rounded-full" style={{ backgroundColor: "#30363D" }} />
          </div>
        </div>
      </section>

      {/* Feature Matrix Section */}
      <section className="max-w-7xl mx-auto px-6 pb-28 pt-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight tracking-tight mb-4">
            Everything you need to upgrade your life.
            <br />
            <span style={{ color: "#00F0FF" }}>Zero internet required.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {/* Card 1 — AI Personal Trainer */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0D1117" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M6.5 6.5h11M6.5 17.5h11M4 9.5v5M20 9.5v5M2 11v2M22 11v2" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base mb-1" style={{ color: "#E6EDF3" }}>AI Personal Trainer</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>Custom bodybuilding and calisthenics routines generated on-device and adapted to your progress — no gym subscription needed.</p>
            </div>
          </div>

          {/* Card 2 — Food Scanner */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0D1117" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M3 5v2M3 19v-2M21 5v2M21 19v-2M3 7h1v10H3M7 7h1v10H7M11 7h2v10h-2M15 7h1v10h-1M18 7h1v10h-1" />
                <path d="M3 3h4M3 21h4M17 3h4M17 21h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base mb-1" style={{ color: "#E6EDF3" }}>400k+ Item Food Scanner</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>Scan any barcode and instantly get full macros and micronutrients from a massive offline database — no camera permission to any server.</p>
            </div>
          </div>

          {/* Card 3 — Habit Tracking */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0D1117" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14l2.5 2.5L16 11" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base mb-1" style={{ color: "#E6EDF3" }}>Habit Tracking</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>Build streaks, track daily rituals, and visualize long-term consistency — all stored locally with no cloud sync required.</p>
            </div>
          </div>

          {/* Card 4 — Deep Work Timer */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0D1117" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l3 3" />
                <path d="M9 3h6M12 3v2" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base mb-1" style={{ color: "#E6EDF3" }}>Deep Work Timer</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>Pomodoro and custom focus sessions with session logs, distraction blocking, and offline ambient soundscapes.</p>
            </div>
          </div>

          {/* Card 5 — Offline Budget Vault */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0D1117" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1.5" fill="#00F0FF" stroke="none" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base mb-1" style={{ color: "#E6EDF3" }}>Offline Budget Vault</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>Track income, expenses, and savings goals with encrypted local storage. Your financial data never touches a server.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Promise Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0D1117", borderTop: "1px solid #21262D", borderBottom: "1px solid #21262D" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #00F0FF 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #00F0FF 0px, transparent 1px, transparent 40px)" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6" style={{ borderColor: "#00F0FF33", color: "#00F0FF", backgroundColor: "#00F0FF0D" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              End-to-End Private
            </div>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              Your Data. Your Device.<br /><span style={{ color: "#00F0FF" }}>Your Business.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-5 p-8 rounded-2xl border" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#0D1117", boxShadow: "0 0 20px rgba(0,240,255,0.1)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  <line x1="17" y1="3" x2="21" y2="7" stroke="#FF4444" strokeWidth="2" /><line x1="21" y1="3" x2="17" y2="7" stroke="#FF4444" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#E6EDF3" }}>Zero Accounts Required</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>No sign-up. No email. No profile. Open the app and go — your identity stays entirely yours, completely anonymous by design.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "#00F0FF99" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00F0FF" }} />AUTH_REQUIRED: FALSE
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-5 p-8 rounded-2xl border" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#0D1117", boxShadow: "0 0 20px rgba(0,240,255,0.1)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <circle cx="12" cy="12" r="9" /><path d="M3.6 9h16.8M3.6 15h16.8" />
                  <path d="M12 3a12 12 0 0 1 3 9 12 12 0 0 1-3 9M12 3a12 12 0 0 0-3 9 12 12 0 0 0 3 9" />
                  <line x1="4" y1="4" x2="20" y2="20" stroke="#FF4444" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#E6EDF3" }}>Zero Tracking Pixels</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>No analytics SDKs, no ad network calls, no invisible beacons. The app makes zero outbound network requests — ever.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "#00F0FF99" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00F0FF" }} />OUTBOUND_REQUESTS: 0
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-5 p-8 rounded-2xl border" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#0D1117", boxShadow: "0 0 20px rgba(0,240,255,0.1)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" /><line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#E6EDF3" }}>100% Local Storage</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>Every byte lives on-device in an encrypted local database. No cloud backup means no cloud breach. Your vault stays sealed.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "#00F0FF99" }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00F0FF" }} />STORAGE: ON_DEVICE_ONLY
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
