"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function getSafeCallbackUrl(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.replace(callbackUrl);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0D1117" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 flex flex-col gap-6"
        style={{
          backgroundColor: "#161B22",
          borderColor: "#21262D",
          boxShadow: "0 0 60px rgba(0,240,255,0.05)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          {/* Lock icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-1"
            style={{ backgroundColor: "#0D1117" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1.5" fill="#00F0FF" stroke="none" />
            </svg>
          </div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "#E6EDF3" }}
          >
            Secure Access
          </h1>
          <p className="text-sm" style={{ color: "#8B949E" }}>
            Enter your credentials to access your account. A new account is created automatically if you&apos;re signing in for the first time.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #21262D" }} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#8B949E" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                backgroundColor: "#0D1117",
                border: "1px solid #30363D",
                color: "#E6EDF3",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#00F0FF66")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#30363D")}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#8B949E" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                backgroundColor: "#0D1117",
                border: "1px solid #30363D",
                color: "#E6EDF3",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#00F0FF66")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#30363D")}
            />
          </div>

          {/* Error message */}
          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2 border"
              style={{
                color: "#FF6B6B",
                backgroundColor: "#FF6B6B0D",
                borderColor: "#FF6B6B33",
              }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            style={{
              backgroundColor: "#00F0FF",
              color: "#0D1117",
              boxShadow: loading ? "none" : "0 0 24px rgba(0,240,255,0.45)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Authenticating...
              </span>
            ) : (
              "Access Account"
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-xs" style={{ color: "#8B949E" }}>
          Your credentials are protected. Retro Gigz never shares your data.
          <br />
          <span style={{ color: "#30363D" }}>Powered by Retro Gigz Secure Auth</span>
        </p>
      </div>
    </main>
  );
}
