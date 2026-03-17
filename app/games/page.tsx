import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function GamesPage() {
  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />
      <main>
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div
          className="rounded-2xl border p-8 sm:p-12"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold"
            style={{ borderColor: "#00F0FF44", color: "#00F0FF", backgroundColor: "#00F0FF12" }}>
            Retro Gigz Games
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mt-5 tracking-tight">
            Vanguard Is In Development
          </h1>
          <p className="text-base sm:text-lg mt-4 leading-relaxed" style={{ color: "#8B949E" }}>
            Our flagship tactical shooter is actively in production. We are focused on depth,
            replayability, and performance-first gameplay.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact?topic=games-news"
              className="px-5 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
            >
              Get Development Updates
            </Link>
            <Link
              href="/"
              className="px-5 py-3 rounded-xl text-sm font-semibold border"
              style={{ borderColor: "#21262D", color: "#8B949E" }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
      </main>
      <PublicFooter />
    </div>
  );
}
