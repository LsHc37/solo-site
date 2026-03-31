"use client";

import { useState } from "react";
import PublicFooter from "@/components/PublicFooter";
import PublicNav from "@/components/PublicNav";

export default function KickstartPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const getLoadingMessage = (value: number) => {
    if (value < 20) return "Booting RetroGigz Solo Builder v4.0...";
    if (value < 40) return "Studying your goals and calculating a personalized plan...";
    if (value < 60) return "Building sessions from the Solo movement library...";
    if (value < 80) return "Balancing progress, recovery, and daily momentum...";
    return "Finalizing your custom .solo file structure...";
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setProgress(0);
    setMessage(getLoadingMessage(0));

    const tickMs = 100;
    const durationMs = 15000;
    const targetProgress = 95;
    const increment = targetProgress / (durationMs / tickMs);

    let loadingInterval: ReturnType<typeof setInterval> | null = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(targetProgress, prev + increment);
        setMessage(getLoadingMessage(next));
        return next;
      });
    }, tickMs);

    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: prompt }),
      });

      if (!res.ok) throw new Error("Failed to generate workout file");

      const data = await res.json();

      if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
      }

      setProgress(100);
      setMessage("Success! Downloading my-plan.solo...");

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-plan.solo";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
      }

      console.error(error);
      setMessage("Error generating file. Please try again.");
    } finally {
      if (loadingInterval) {
        clearInterval(loadingInterval);
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="rounded-3xl border p-6 sm:p-8" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <h1 className="text-3xl font-black tracking-tight">Make Your Custom .solo File</h1>
          <p className="mt-3 text-sm sm:text-base" style={{ color: "#8B949E" }}>
            Share your age, weight, goals, experience, and equipment. The AI will craft a tailored workout and export your custom .solo file.
          </p>

          <textarea
            className="mt-6 h-44 w-full rounded-xl border p-4 text-sm"
            style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
            placeholder="e.g. I am <AGE> years old, <WEIGHT> lbs, beginner, training 3 days/week with dumbbells at home."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="mt-5 w-full rounded-xl px-6 py-4 text-base font-black uppercase tracking-wide transition disabled:opacity-60"
            style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
          >
            {loading ? `Building Your .solo File... ${Math.round(progress)}%` : "Make My Custom .solo File"}
          </button>

          {message ? <p className="mt-4 text-sm" style={{ color: "#9CCFD8" }}>{message}</p> : null}
        </section>
      </main>
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4" style={{ background: "radial-gradient(circle at 20% 20%, rgba(0, 240, 255, 0.2), transparent 40%), radial-gradient(circle at 85% 25%, rgba(16, 185, 129, 0.2), transparent 35%), linear-gradient(145deg, rgba(13, 17, 23, 0.98), rgba(19, 28, 36, 0.98))" }}>
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <div className="relative w-full max-w-3xl rounded-3xl border p-6 text-center shadow-2xl sm:p-10" style={{ backgroundColor: "rgba(22, 27, 34, 0.92)", borderColor: "rgba(0, 240, 255, 0.35)", backdropFilter: "blur(8px)" }}>
            <p className="text-xs font-extrabold uppercase tracking-[0.32em]" style={{ color: "#00F0FF" }}>Creating Your Custom .solo File</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Hang Tight. Your Plan Is Loading.</h2>
            <p key={message} className="loading-message-enter mx-auto mt-4 max-w-2xl text-sm sm:text-base" style={{ color: "#9CCFD8" }}>
              {message || "Preparing your personalized training blueprint..."}
            </p>

            <div className="mt-8">
              <div className="relative h-5 w-full overflow-hidden rounded-full border" style={{ backgroundColor: "rgba(13, 17, 23, 0.9)", borderColor: "rgba(99, 107, 123, 0.55)" }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-200 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #00F0FF 0%, #27E0B3 45%, #6CF19A 100%)",
                    boxShadow: "0 0 30px rgba(0, 240, 255, 0.45)",
                  }}
                />
              </div>
              <p className="mt-3 text-sm font-semibold tracking-wide" style={{ color: "#C9D1D9" }}>{Math.round(progress)}% complete</p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
              <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(48, 54, 61, 0.85)", backgroundColor: "rgba(13, 17, 23, 0.7)" }}>
                <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8B949E" }}>Phase 1</p>
                <p className="mt-1 text-sm font-semibold">Analyze profile inputs</p>
              </div>
              <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(48, 54, 61, 0.85)", backgroundColor: "rgba(13, 17, 23, 0.7)" }}>
                <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8B949E" }}>Phase 2</p>
                <p className="mt-1 text-sm font-semibold">Assemble training blocks</p>
              </div>
              <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(48, 54, 61, 0.85)", backgroundColor: "rgba(13, 17, 23, 0.7)" }}>
                <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#8B949E" }}>Phase 3</p>
                <p className="mt-1 text-sm font-semibold">Generate .solo export</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <style jsx>{`
        .loading-message-enter {
          animation: loadingMessageEnter 360ms ease-out;
        }

        @keyframes loadingMessageEnter {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <PublicFooter />
    </div>
  );
}
