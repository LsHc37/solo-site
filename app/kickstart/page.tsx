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
    if (value < 20) return "Booting RetroGigz Master AI v3.1...";
    if (value < 40) return "Analyzing demographics & calculating custom macros...";
    if (value < 60) return "Selecting optimal exercises from the Solo Library...";
    if (value < 80) return "Injecting daily habits, goals, and alarms...";
    return "Compiling 4-week program and structuring .solo file...";
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

      if (!res.ok) throw new Error("Failed to generate workout JSON");

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
          <h1 className="text-3xl font-black tracking-tight">Workout JSON Generator</h1>
          <p className="mt-3 text-sm sm:text-base" style={{ color: "#8B949E" }}>
            Describe your age, weight, goals, experience, and equipment. The AI will generate a tailored workout JSON.
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
            {loading ? `Generating... ${Math.round(progress)}%` : "Generate Workout JSON"}
          </button>

          {loading ? (
            <div className="mt-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          {message ? <p className="mt-4 text-sm" style={{ color: "#9CCFD8" }}>{message}</p> : null}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
