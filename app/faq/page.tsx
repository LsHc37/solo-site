const FAQS = [
  {
    q: "Do your apps require an account?",
    a: "Most Solo features are designed to work fully offline on-device. Account requirements are minimized and optional where possible.",
  },
  {
    q: "Where is my data stored?",
    a: "We prioritize local-first storage for user-sensitive data and avoid unnecessary third-party sharing.",
  },
  {
    q: "How can I get support?",
    a: "Use the Contact & Support page and include your platform, app version, and issue details.",
  },
];

import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function FaqPage() {
  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />
      <main>
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black tracking-tight">Frequently Asked Questions</h1>
        <div className="mt-8 grid gap-4">
          {FAQS.map((item) => (
            <article
              key={item.q}
              className="rounded-2xl border p-6"
              style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
            >
              <h2 className="text-lg font-bold">{item.q}</h2>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "#8B949E" }}>{item.a}</p>
            </article>
          ))}
        </div>
      </section>
      </main>
      <PublicFooter />
    </div>
  );
}
