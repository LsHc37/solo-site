"use client";

import PublicFooter from "@/components/PublicFooter";
import PublicNav from "@/components/PublicNav";
import { useState } from "react";

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

  function handleChange<K extends keyof KickstartFormData>(field: K, value: KickstartFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
                  placeholder="e.g. 5'11\ or 180 cm"
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
            className="w-full rounded-2xl px-6 py-4 text-base font-black uppercase tracking-wide transition sm:text-lg"
            style={{ backgroundColor: "#00F0FF", color: "#0D1117", boxShadow: "0 0 28px rgba(0,240,255,0.35)" }}
          >
            Generate My .solo File
          </button>
        </form>
      </main>

      <PublicFooter />
    </div>
  );
}
