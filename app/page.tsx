"use client";

import Link from "next/link";
import { Render, type Data } from "@measured/puck";
import { useEffect, useState } from "react";
import config from "../puck.config";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

const emptyData: Data = { root: { props: { title: "" } }, content: [] };

function HomeHero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 fade-up">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full blur-[140px] opacity-10"
          style={{ backgroundColor: "#00F0FF" }}
        />
      </div>

      <div className="mx-auto max-w-5xl stagger">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest"
          style={{ borderColor: "#00F0FF33", color: "#00F0FF", backgroundColor: "#00F0FF0A" }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
          Solo Productivity
        </div>

        <h1
          className="text-5xl font-black leading-none tracking-tight sm:text-6xl lg:text-7xl"
          style={{ color: "#E6EDF3" }}
        >
          Built{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #00F0FF, #60A5FA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Different.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: "#8B949E" }}>
          Privacy-first productivity software built for focused solo execution. Plan better,
          train smarter, and keep your data under your control.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/solo"
            className="rounded-xl px-6 py-3 text-sm font-bold soft-btn"
            style={{
              backgroundColor: "#00F0FF",
              color: "#0D1117",
              boxShadow: "0 0 24px rgba(0,240,255,0.35)",
            }}
          >
            Explore Solo Productivity
          </Link>
          <Link
            href="/community"
            className="rounded-xl border px-6 py-3 text-sm font-bold soft-btn"
            style={{ borderColor: "#30363D", color: "#8B949E" }}
          >
            Join Community
          </Link>
        </div>
      </div>
    </section>
  );
}

function DivisionsSection() {
  const cards = [
    {
      href: "/solo",
      accent: "#00F0FF",
      tag: "Solo App",
      title: "100% Offline & Private",
      body: "The all-in-one life OS. AI trainer, 400,000+ local foods to search and track, and budget vault. Your data never leaves your device.",
      cta: "Learn more →",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      ),
    },
    {
      href: "/community",
      accent: "#34D399",
      tag: "Community",
      title: "Questions & Reviews",
      body: "Ask questions, share feedback, and help shape the future of what we build.",
      cta: "Join the discussion →",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <section className="px-6 py-16 fade-up">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-3xl font-black tracking-tight" style={{ color: "#E6EDF3" }}>
          Solo Productivity Platform
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 stagger">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col gap-4 rounded-2xl border p-6 lift-card"
              style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${card.accent}12`,
                  border: `1px solid ${card.accent}33`,
                }}
              >
                {card.icon}
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: card.accent }}>
                  {card.tag}
                </p>
                <h3 className="mb-2 text-base font-bold" style={{ color: "#E6EDF3" }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>
                  {card.body}
                </p>
              </div>
              <p className="mt-auto text-xs font-semibold" style={{ color: card.accent }}>
                {card.cta}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MomentumSection() {
  const metrics = [
    {
      value: "10k+",
      label: "Focused sessions started",
      detail: "Deep work blocks launched by solo operators using the system every week.",
    },
    {
      value: "94%",
      label: "Users report clearer priorities",
      detail: "A cleaner daily plan means less context switching and fewer abandoned tasks.",
    },
    {
      value: "3x",
      label: "Faster routine setup",
      detail: "Build custom run + fitness + planning systems in minutes instead of hours.",
    },
  ];

  return (
    <section className="px-6 py-14 fade-up">
      <div className="mx-auto max-w-5xl">
        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#00F0FF" }}>
                Momentum Snapshot
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl" style={{ color: "#E6EDF3" }}>
                Workflows that actually stick.
              </h2>
            </div>
            <p className="max-w-lg text-sm" style={{ color: "#8B949E" }}>
              Built for people who need clear systems, not noisy dashboards. Every tool is designed for repeatable momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 stagger">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border p-4 lift-card"
                style={{ borderColor: "#2A3340", backgroundColor: "#0D1117" }}
              >
                <p className="text-3xl font-black" style={{ color: "#00F0FF" }}>{metric.value}</p>
                <p className="mt-2 text-sm font-bold" style={{ color: "#E6EDF3" }}>{metric.label}</p>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "#8B949E" }}>{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Capture Your Intent",
      body: "Drop your goal, constraints, and schedule. The system structures your day into actionable blocks.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      ),
    },
    {
      title: "Train With Structure",
      body: "Turn intent into daily execution: routines, runs, meals, and priorities mapped into one flow.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      title: "Review and Compound",
      body: "See what moved the needle, keep what works, and tighten the next day in under five minutes.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M3 3v5h5" />
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
        </svg>
      ),
    },
  ];

  return (
    <section className="px-6 py-16 fade-up">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#00F0FF" }}>
              Workflow
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight" style={{ color: "#E6EDF3" }}>
              From idea to consistent execution
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 stagger">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border p-5 lift-card"
              style={{ borderColor: "#21262D", backgroundColor: "#161B22" }}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black" style={{ color: "#E6EDF3", borderColor: "#2F3B49" }}>
                  {index + 1}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: "#0D1117", border: "1px solid #2A3340" }}>
                  {step.icon}
                </div>
              </div>
              <h3 className="mt-4 text-base font-black" style={{ color: "#E6EDF3" }}>{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#8B949E" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const cases = [
    {
      title: "Solo Builder Stack",
      body: "Ship features, manage clients, and protect deep work windows without losing momentum.",
      tag: "Builders",
    },
    {
      title: "Runner Performance Loop",
      body: "Track training load, nutrition, and recovery with one private offline-first routine.",
      tag: "Athletes",
    },
    {
      title: "Creator Focus Engine",
      body: "Plan content, maintain fitness, and execute your weekly priorities from one system.",
      tag: "Creators",
    },
  ];

  return (
    <section className="px-6 py-10 fade-up">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border p-7 sm:p-9" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#00F0FF" }}>Use Cases</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight" style={{ color: "#E6EDF3" }}>
              Pick your mode. Keep your edge.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 stagger">
            {cases.map((item) => (
              <div key={item.title} className="rounded-xl border p-4 lift-card" style={{ borderColor: "#2A3340", backgroundColor: "#0D1117" }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "#00F0FF" }}>{item.tag}</p>
                <h3 className="mt-2 text-sm font-black" style={{ color: "#E6EDF3" }}>{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "#8B949E" }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  const pillars = [
    {
      title: "No Cloud by Default",
      body: "We build offline-first. Your data stays on your device unless you explicitly choose to share it.",
    },
    {
      title: "Open Principles",
      body: "No hidden trackers, no background uploads, no selling your data. Full stop.",
    },
    {
      title: "Built to Last",
      body: "Software that doesn't degrade when subscriptions end or servers go down. It's yours.",
    },
  ];

  return (
    <section className="px-6 py-16 fade-up">
      <div className="mx-auto max-w-5xl">
        <div
          className="rounded-2xl border p-8 sm:p-12"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: "#00F0FF33", color: "#00F0FF", backgroundColor: "#00F0FF0A" }}
          >
            Privacy First
          </div>
          <h2 className="mb-3 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "#E6EDF3" }}>
            Privacy is the default,
            <br />
            not a feature.
          </h2>
          <p className="mb-10 text-base" style={{ color: "#8B949E" }}>
            Every product we ship is designed from the ground up with your privacy in mind.
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 stagger">
            {pillars.map((p) => (
              <div key={p.title}>
                <div
                  className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#00F0FF12", border: "1px solid #00F0FF33" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="mb-1.5 text-sm font-bold" style={{ color: "#E6EDF3" }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityCTA() {
  return (
    <section className="px-6 pb-24 pt-8 fade-up">
      <div className="mx-auto max-w-5xl">
        <div
          className="rounded-2xl border p-8 text-center sm:p-12 lift-card"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <h2 className="mb-3 text-3xl font-black" style={{ color: "#E6EDF3" }}>
            Become part of the mission.
          </h2>
          <p className="mx-auto mb-6 max-w-md text-base" style={{ color: "#8B949E" }}>
            Ask questions, share reviews, and help shape what we build next.
          </p>
          <Link
            href="/community"
            className="inline-flex rounded-xl px-6 py-3 text-sm font-bold soft-btn"
            style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
          >
            Join the Community
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [data, setData] = useState<Data>(emptyData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/public/puck", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((payload: { data?: Data }) => {
        if (payload?.data) setData(payload.data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const hasContent = Array.isArray(data.content) && data.content.length > 0;

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />

      {!loaded ? (
        <div className="mx-auto max-w-5xl animate-pulse space-y-4 px-6 py-16">
          <div className="h-20 rounded-2xl" style={{ backgroundColor: "#161B22" }} />
          <div className="h-64 rounded-2xl" style={{ backgroundColor: "#161B22" }} />
          <div className="h-40 rounded-2xl" style={{ backgroundColor: "#161B22" }} />
        </div>
      ) : hasContent ? (
        <main>
          <section className="mx-auto max-w-5xl px-4 py-8">
            <Render config={config} data={data} />
          </section>
          <MomentumSection />
          <HowItWorksSection />
          <UseCasesSection />
        </main>
      ) : (
        <main>
          <HomeHero />
          <MomentumSection />
          <DivisionsSection />
          <HowItWorksSection />
          <UseCasesSection />
          <PrivacySection />
          <CommunityCTA />
        </main>
      )}

      <PublicFooter />
    </div>
  );
}
