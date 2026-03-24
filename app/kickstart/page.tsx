"use client";

import { useState } from "react";

export default function KickstartPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setMessage("AI is building your Life OS...");

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: prompt }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kickstart.solo";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setMessage("Success! kickstart.solo downloaded.");
    } catch (error) {
      console.error(error);
      setMessage("Error generating file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-blue-400">Solo Productivity</h1>
        <h2 className="text-xl mb-6">Magic Text Box Generator</h2>
        <p className="text-gray-400 mb-4">Describe yourself (age, weight, goals, equipment) and the AI will generate your custom .solo configuration file.</p>
        <textarea
          className="w-full h-40 p-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none mb-6"
          placeholder="e.g. I am a 17-year-old male, 160 lbs. I want to build muscle and get a leaner physique. I workout 3 days a week..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all"
        >
          {loading ? "Generating..." : "Generate My Custom .solo File"}
        </button>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-blue-300">{message}</p>
        )}
      </div>
    </div>
  );
}
