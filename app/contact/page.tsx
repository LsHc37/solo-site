import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const params = await searchParams;
  const topic = (params.topic ?? "general").replace(/[^a-zA-Z0-9\-_]/g, "");

  const reasons = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      ),
      title: "App Support",
      topic: "app-support",
      desc: "Issues, bugs, or feature requests for Solo or any of our apps.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Partnership / Sponsorship",
      topic: "sponsorship",
      desc: "Interested in collaborating, partnering, or sponsoring a milestone.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
        </svg>
      ),
      title: "Games News / Beta",
      topic: "games-news",
      desc: "Get updates on Vanguard development or join the beta list.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: "General Inquiry",
      topic: "general",
      desc: "Anything else — press, licensing, or just a hello.",
    },
  ];

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />
      <main>
        <section className="max-w-4xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-black tracking-tight">Contact & Support</h1>
          <p className="text-sm mt-3 max-w-lg" style={{ color: "#8B949E" }}>
            For support, partnerships, game news, or anything else — email us directly. We read everything.
          </p>

          {/* Reason cards */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((r) => (
              <a
                key={r.topic}
                href={`mailto:support@retrogigz.com?subject=${encodeURIComponent(`[${r.topic}] Retro Gigz Contact`)}`}
                className="group flex gap-4 rounded-2xl border p-5 transition-all duration-200"
                style={{ backgroundColor: "#161B22", borderColor: r.topic === topic ? "#00F0FF44" : "#21262D" }}
              >
                <div
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#00F0FF0A", border: "1px solid #00F0FF22" }}
                >
                  {r.icon}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#E6EDF3" }}>{r.title}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8B949E" }}>{r.desc}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Direct email */}
          <div className="mt-8 rounded-2xl border p-6" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <p className="text-xs uppercase font-semibold tracking-wider" style={{ color: "#8B949E" }}>
              Direct Email
            </p>
            <p className="text-sm mt-2 font-mono" style={{ color: "#00F0FF" }}>
              [{topic}] Retro Gigz Support Request
            </p>
            <a
              href={`mailto:support@retrogigz.com?subject=${encodeURIComponent(`[${topic}] Retro Gigz Support Request`)}`}
              className="inline-flex mt-5 items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email support@retrogigz.com
            </a>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
