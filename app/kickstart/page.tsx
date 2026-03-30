"use client";

import PublicFooter from "@/components/PublicFooter";
import PublicNav from "@/components/PublicNav";
import PromptAnalyzer, { analyzePrompt } from "@/components/PromptAnalyzer";
import { useEffect, useRef, useState } from "react";

type FitnessGoal = "cut" | "bulk" | "maintain";
type ActivityLevel = "sedentary" | "light" | "active" | "athlete";
type MainFocus = "school" | "career" | "general_organization";

interface KickstartFormData {
  age: string;
  gender: string;
  weightLbs: string;
  height: string;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  mainFocus: MainFocus;
}

const defaultForm: KickstartFormData = {
  age: "",
  gender: "",
  weightLbs: "",
  height: "",
  fitnessGoal: "maintain",
  activityLevel: "light",
  mainFocus: "general_organization",
};

const fitnessGoalOptions: Array<{ value: FitnessGoal; label: string; description: string }> = [
  { value: "cut", label: "Cut", description: "Lose body fat while preserving muscle" },
  { value: "bulk", label: "Bulk", description: "Build muscle with a calorie surplus" },
  { value: "maintain", label: "Maintain", description: "Keep your current composition" },
];

const activityLevelOptions: Array<{ value: ActivityLevel; label: string; description: string }> = [
  { value: "sedentary", label: "Sedentary", description: "Desk-heavy routine with minimal movement" },
  { value: "light", label: "Light", description: "Some walking and light activity most days" },
  { value: "active", label: "Active", description: "Regular training and movement" },
  { value: "athlete", label: "Athlete", description: "High-volume training and sport performance" },
];

const focusOptions: Array<{ value: MainFocus; label: string; description: string }> = [
  { value: "school", label: "School", description: "Improve study flow and assignment consistency" },
  { value: "career", label: "Career", description: "Drive professional output and momentum" },
  {
    value: "general_organization",
    label: "General Organization",
    description: "Get your day-to-day tasks and routines in order",
  },
];

export default function KickstartPage() {
  const [formData, setFormData] = useState<KickstartFormData>(defaultForm);
  const [userPrompt, setUserPrompt] = useState("");
  const [generationState, setGenerationState] = useState<"idle" | "loading" | "success">("idle");
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promptScore = analyzePrompt(userPrompt).score;
  const canGenerate = promptScore >= 50;
  const isGenerating = generationState !== "idle";

  const generationStatuses = [
    "Connecting to RetroGigz Engine...",
    `Calibrating Macros for ${formData.age || "Age"}/${formData.weightLbs || "Weight"}...`,
    "Structuring 4-Week Periodization...",
    "Securing .solo Payload...",
  ];

  function clearGenerationTimers() {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }

    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearGenerationTimers();
    };
  }, []);

  function handleChange<K extends keyof KickstartFormData>(field: K, value: KickstartFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function triggerSoloDownload() {
    const payload = {
      generatedAt: new Date().toISOString(),
      prompt: userPrompt,
      age: Number(formData.age),
      gender: formData.gender,
      weightLbs: Number(formData.weightLbs),
      height: formData.height,
      fitnessGoal: formData.fitnessGoal,
      activityLevel: formData.activityLevel,
      productivityFocus: formData.mainFocus,
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `retrogigz-kickstart-${date}.solo`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canGenerate || isGenerating) {
      return;
    }

    clearGenerationTimers();
    setIsOverlayVisible(true);
    setGenerationState("loading");
    setStatusIndex(0);

    statusIntervalRef.current = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % generationStatuses.length);
    }, 170);

    finishTimeoutRef.current = setTimeout(() => {
      clearGenerationTimers();
      triggerSoloDownload();
      setGenerationState("success");

      closeTimeoutRef.current = setTimeout(() => {
        setIsOverlayVisible(false);
        setGenerationState("idle");
      }, 1300);
    }, 3000);

    console.log("Solo Productivity Kickstart payload:", {
      age: Number(formData.age),
      gender: formData.gender,
      weightLbs: Number(formData.weightLbs),
      height: formData.height,
      fitnessGoal: formData.fitnessGoal,
      activityLevel: formData.activityLevel,
      productivityFocus: formData.mainFocus,
    });
  }

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-3xl border p-6 sm:p-10" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl" style={{ backgroundColor: "#00F0FF22" }} />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full blur-3xl" style={{ backgroundColor: "#60A5FA18" }} />

          <div className="relative">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ borderColor: "#00F0FF40", color: "#00F0FF", backgroundColor: "#00F0FF12" }}>
              App Kickstart Generator
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Solo Productivity Kickstart</h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base" style={{ color: "#8B949E" }}>
              Build your personalized starter profile. This form is currently client-side only and logs your selections in the browser console.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border p-5 sm:p-6" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <h2 className="text-lg font-bold">0. Describe Your Plan</h2>
            <p className="mt-2 text-sm" style={{ color: "#8B949E" }}>
              Type your fitness-plan prompt with details like demographics, goals, diet, and schedule.
            </p>
            <textarea
              value={userPrompt}
              onChange={(event) => setUserPrompt(event.target.value)}
              placeholder="Example: I am 27, 175 lbs, want to lean out, target 2200 calories with high protein, and train at home 4 days a week."
              rows={5}
              className="mt-4 w-full rounded-xl border px-3 py-2 text-sm"
              style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
            />
            <PromptAnalyzer text={userPrompt} />

            <section className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-900 p-5 sm:p-6">
              <h3 className="text-lg font-black tracking-wide text-zinc-100">How to Inject Your Protocol</h3>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <article className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100">1. Generate</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    Fill out stats and click generate.
                  </p>
                </article>

                <article className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100">2. Download</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    Save the secure .solo file to your device.
                  </p>
                </article>

                <article className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-100">3. Import</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    Open the Solo App &gt; Settings &gt; Import .solo to overwrite your Life OS.
                  </p>
                </article>
              </div>
            </section>
          </section>

          <section className="rounded-2xl border p-5 sm:p-6" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <h2 className="text-lg font-bold">1. Basic Info</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Age
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.age}
                  onChange={(event) => handleChange("age", event.target.value)}
                  className="h-11 rounded-xl border px-3 text-sm"
                  style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Gender
                <input
                  type="text"
                  required
                  placeholder="e.g. Male, Female, Non-binary"
                  value={formData.gender}
                  onChange={(event) => handleChange("gender", event.target.value)}
                  className="h-11 rounded-xl border px-3 text-sm"
                  style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Weight (lbs)
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.weightLbs}
                  onChange={(event) => handleChange("weightLbs", event.target.value)}
                  className="h-11 rounded-xl border px-3 text-sm"
                  style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Height
                <input
                  type="text"
                  required
                  placeholder="e.g. 5'11\" or 180 cm"
                  value={formData.height}
                  onChange={(event) => handleChange("height", event.target.value)}
                  className="h-11 rounded-xl border px-3 text-sm"
                  style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border p-5 sm:p-6" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <h2 className="text-lg font-bold">2. Fitness Goal</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {fitnessGoalOptions.map((option) => {
                const selected = formData.fitnessGoal === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange("fitnessGoal", option.value)}
                    className="rounded-xl border p-4 text-left transition"
                    style={{
                      backgroundColor: selected ? "#00F0FF12" : "#0D1117",
                      borderColor: selected ? "#00F0FF66" : "#30363D",
                    }}
                  >
                    <p className="font-semibold" style={{ color: selected ? "#00F0FF" : "#E6EDF3" }}>
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "#8B949E" }}>
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border p-5 sm:p-6" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <h2 className="text-lg font-bold">3. Activity Level</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activityLevelOptions.map((option) => {
                const selected = formData.activityLevel === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange("activityLevel", option.value)}
                    className="rounded-xl border p-4 text-left transition"
                    style={{
                      backgroundColor: selected ? "#00F0FF12" : "#0D1117",
                      borderColor: selected ? "#00F0FF66" : "#30363D",
                    }}
                  >
                    <p className="font-semibold" style={{ color: selected ? "#00F0FF" : "#E6EDF3" }}>
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "#8B949E" }}>
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border p-5 sm:p-6" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
            <h2 className="text-lg font-bold">4. Productivity Focus</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {focusOptions.map((option) => {
                const selected = formData.mainFocus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange("mainFocus", option.value)}
                    className="rounded-xl border p-4 text-left transition"
                    style={{
                      backgroundColor: selected ? "#00F0FF12" : "#0D1117",
                      borderColor: selected ? "#00F0FF66" : "#30363D",
                    }}
                  >
                    <p className="font-semibold" style={{ color: selected ? "#00F0FF" : "#E6EDF3" }}>
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "#8B949E" }}>
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="submit"
            disabled={!canGenerate || isGenerating}
            className="w-full rounded-2xl px-6 py-4 text-base font-black uppercase tracking-wide transition sm:text-lg"
            style={{
              backgroundColor: isGenerating ? "#14532D" : canGenerate ? "#00F0FF" : "#30363D",
              color: isGenerating ? "#D1FAE5" : canGenerate ? "#0D1117" : "#8B949E",
              boxShadow: isGenerating
                ? "0 0 34px rgba(34,197,94,0.45)"
                : canGenerate
                  ? "0 0 28px rgba(0,240,255,0.35)"
                  : "none",
              cursor: !canGenerate || isGenerating ? "not-allowed" : "pointer",
            }}
          >
            {!canGenerate
              ? "Prompt strength must be 50%+ to generate"
              : generationState === "loading"
                ? "Generating .solo Payload..."
                : generationState === "success"
                  ? "Success: .solo Payload Secured"
                  : "Generate My .solo File"}
          </button>
        </form>

        {isOverlayVisible ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div
              className="w-full max-w-2xl overflow-hidden rounded-2xl border"
              style={{
                borderColor: generationState === "success" ? "#22C55E99" : "#00F0FF66",
                boxShadow:
                  generationState === "success"
                    ? "0 0 48px rgba(34,197,94,0.35)"
                    : "0 0 42px rgba(0,240,255,0.22)",
                background:
                  generationState === "success"
                    ? "linear-gradient(180deg, #07140C 0%, #0B1B12 100%)"
                    : "linear-gradient(180deg, #0B1220 0%, #0A1018 100%)",
              }}
            >
              <div className="flex items-center justify-between border-b px-5 py-3 text-xs uppercase tracking-widest" style={{ borderColor: "#1F2937", color: "#9CA3AF" }}>
                <span>RETROGIGZ_TERMINAL://KICKSTART</span>
                <span>{generationState === "success" ? "ONLINE" : "PROCESSING"}</span>
              </div>

              <div className="relative p-5 font-mono text-sm">
                <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(transparent 50%, rgba(0,0,0,0.28) 50%)", backgroundSize: "100% 3px" }} />

                {generationState === "loading" ? (
                  <div className="relative space-y-4" style={{ color: "#A5F3FC" }}>
                    <p className="text-xs uppercase tracking-widest text-cyan-300">Booting sequence...</p>
                    <p className="text-lg leading-relaxed animate-pulse">&gt; {generationStatuses[statusIndex]}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {generationStatuses.map((status, index) => (
                        <div
                          key={status}
                          className="rounded-md border px-3 py-2 text-xs transition"
                          style={{
                            borderColor: index === statusIndex ? "#00F0FF80" : "#334155",
                            color: index === statusIndex ? "#67E8F9" : "#64748B",
                            backgroundColor: index === statusIndex ? "#00F0FF14" : "#0B1220",
                          }}
                        >
                          [{index + 1}] {status}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative space-y-4" style={{ color: "#86EFAC" }}>
                    <p className="text-xs uppercase tracking-widest text-green-300">Payload complete</p>
                    <p className="text-2xl font-bold">SUCCESS</p>
                    <p className="text-sm text-green-200">.solo file encrypted, packaged, and downloaded to your device.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <PublicFooter />
    </div>
  );
}
