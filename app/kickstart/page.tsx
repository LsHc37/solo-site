"use client";

import { useState } from "react";

export default function KickstartPage() {
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);

    if (!userInput.trim()) {
      setError("Please describe yourself to get started");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const data = await response.json();

      // Create a Blob from the JSON response
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      // Create a temporary download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "kickstart.solo";

      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      // Clear input and show success
      setUserInput("");
      setIsSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error generating plan:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while generating your plan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Build Your Life OS
          </h1>
          <p className="text-lg text-slate-300">
            Describe yourself and we'll generate your custom .solo file
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit}>
            {/* Textarea Label */}
            <label htmlFor="userInput" className="block text-slate-200 font-semibold mb-3">
              Tell us about yourself
            </label>

            {/* Textarea */}
            <textarea
              id="userInput"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Share your details (e.g., Age: 28, Weight: 180 lbs, Goals: Build muscle and improve fitness, Equipment: Gym access, dumbbells)"
              disabled={isLoading}
              className="w-full h-48 p-4 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition disabled:opacity-50"
            />

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="mt-4 p-3 rounded-lg bg-green-900/30 border border-green-700 text-green-300 text-sm">
                ✓ Your .solo file has been downloaded! Ready to transform your
                life.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  AI is building your Life OS...
                </>
              ) : (
                "Generate My Custom .solo File"
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>
            Your API key stays secure on our servers. Your .solo file will be
            downloaded to your device.
          </p>
        </div>
      </div>
    </div>
  );
}
