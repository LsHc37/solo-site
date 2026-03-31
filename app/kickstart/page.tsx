"use client";

import { useState } from "react";
import PublicFooter from "@/components/PublicFooter";
import PublicNav from "@/components/PublicNav";

export default function KickstartPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);

    const loadingSteps = [
      "Analyzing demographics...",
      "Calculating custom macros...",
      "Designing master workout library...",
      "Validating RPE constraints...",
      "Packaging .solo file...",
    ];

    let stepIndex = 0;
    setMessage(loadingSteps[stepIndex]);

    let loadingInterval: ReturnType<typeof setInterval> | null = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingSteps.length;
      setMessage(loadingSteps[stepIndex]);
    }, 1500);

    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: prompt }),
      });

      if (!res.ok) throw new Error("Failed to generate workout JSON");

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-plan.solo";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
      }

      setMessage("Success! my-plan.solo downloaded.");
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
            {loading ? "Generating..." : "Generate Workout JSON"}
          </button>

          {message ? <p className="mt-4 text-sm" style={{ color: "#9CCFD8" }}>{message}</p> : null}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
