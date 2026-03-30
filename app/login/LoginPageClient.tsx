"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { getSafeCallbackUrl } from "@/lib/safe-callback-url";
import { validateEmail, validatePassword } from "@/lib/form-validation";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const isAdminLogin = searchParams.get("mode") === "admin" || callbackUrl.startsWith("/admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPortalCode, setAdminPortalCode] = useState("");
  const [createAccountConsent, setCreateAccountConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  // Form validation
  const emailError = useMemo(() => (email ? validateEmail(email) : null), [email]);
  const passwordError = useMemo(() => (password ? validatePassword(password) : null), [password]);

  const isFormValid = useMemo(() => {
    if (!email || !password) return false;
    if (emailError || passwordError) return false;
    if (isAdminLogin && !adminPortalCode.trim()) return false;
    if (!isAdminLogin && !createAccountConsent) return false;
    return true;
  }, [email, password, emailError, passwordError, adminPortalCode, createAccountConsent, isAdminLogin]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isAdminLogin && !adminPortalCode.trim()) {
      setError("Enter the admin portal code to continue.");
      return;
    }

    if (!isAdminLogin && !createAccountConsent) {
      setError("Please acknowledge first-time account creation before continuing.");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      adminPortalCode: isAdminLogin ? adminPortalCode.trim() : "",
      adminLoginIntent: isAdminLogin ? "true" : "false",
      createAccountConsent: createAccountConsent ? "true" : "false",
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        isAdminLogin
          ? "Admin access was denied. Check your account password and the admin portal code."
          : "Invalid email or password. Please try again.",
      );
    } else {
      router.replace(callbackUrl);
    }
  }

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ backgroundColor: "#0D1117" }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-1/4 -left-1/2 w-96 h-96 rounded-full blur-[120px] opacity-15 animate-pulse"
          style={{ backgroundColor: "#00F0FF" }}
        />
        <div
          className="absolute bottom-1/3 -right-1/2 w-96 h-96 rounded-full blur-[120px] opacity-15 animate-pulse"
          style={{ backgroundColor: "#00F0FF", animationDelay: "1s" }}
        />
      </div>

      <div className="w-full max-w-md">
        {/* Card container */}
        <div
          className="rounded-2xl border p-8 flex flex-col gap-6 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
          style={{
            backgroundColor: "rgba(22, 27, 34, 0.8)",
            borderColor: "#21262D",
            boxShadow: "0 0 60px rgba(0,240,255,0.05), inset 0 0 1px rgba(0,240,255,0.1)",
          }}
        >
          {/* Header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110"
                style={{
                  backgroundColor: "#00F0FF15",
                  border: "1px solid #00F0FF33",
                }}
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
              <div>
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{ color: "#E6EDF3" }}
                >
                  {isAdminLogin ? "Admin Access" : "Welcome Back"}
                </h1>
                <p className="text-xs font-semibold" style={{ color: "#00F0FF" }}>
                  {isAdminLogin ? "Control Panel" : "Secure Login"}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#8B949E" }}>
              {isAdminLogin
                ? "Enter your credentials and admin portal code to unlock the control panel."
                : "Sign in to your account. A new account is created automatically on first sign-in."}
            </p>
          </div>

          <div style={{ borderTop: "1px solid #21262D" }} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#8B949E" }}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  suppressHydrationWarning
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 pr-10"
                  style={{
                    backgroundColor: "#0D1117",
                    border: emailError ? "1px solid #EF4444" : "1px solid #30363D",
                    color: "#E6EDF3",
                  }}
                  onFocus={(e) => {
                    if (!emailError) e.currentTarget.style.borderColor = "#00F0FF66";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = emailError ? "#EF4444" : "#30363D";
                  }}
                />
                {email && !emailError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                    ✓
                  </div>
                )}
              </div>
              {emailError && <p className="text-xs" style={{ color: "#EF4444" }}>{emailError}</p>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#8B949E" }}
              >
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  suppressHydrationWarning
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 pr-10"
                  style={{
                    backgroundColor: "#0D1117",
                    border: passwordError ? "1px solid #EF4444" : "1px solid #30363D",
                    color: "#E6EDF3",
                  }}
                  onFocus={(e) => {
                    if (!passwordError) e.currentTarget.style.borderColor = "#00F0FF66";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = passwordError ? "#EF4444" : "#30363D";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-xs font-semibold"
                  style={{ color: "#00F0FF" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordError && <p className="text-xs" style={{ color: "#EF4444" }}>{passwordError}</p>}
            </div>

            {/* Admin Portal Code Field */}
            {isAdminLogin && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="admin-portal-code"
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#8B949E" }}
                >
                  Admin Portal Code
                </label>
                <div className="relative group">
                  <input
                    id="admin-portal-code"
                    type={showAdminCode ? "text" : "password"}
                    name="adminPortalCode"
                    autoComplete="one-time-code"
                    suppressHydrationWarning
                    required
                    value={adminPortalCode}
                    onChange={(e) => setAdminPortalCode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 pr-10"
                    style={{
                      backgroundColor: "#0D1117",
                      border: error && adminPortalCode ? "1px solid #FF6B6B66" : "1px solid #30363D",
                      color: "#E6EDF3",
                    }}
                    onFocus={(e) => {
                      if (!error || !adminPortalCode) e.currentTarget.style.borderColor = "#00F0FF66";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = error && adminPortalCode ? "#FF6B6B66" : "#30363D";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminCode(!showAdminCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-xs font-semibold"
                    style={{ color: "#00F0FF" }}
                  >
                    {showAdminCode ? "Hide" : "Show"}
                  </button>
                </div>
                <div
                  className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "#00F0FF0A",
                    borderLeft: "3px solid #00F0FF",
                    color: "#8B949E",
                  }}
                >
                  <span style={{ color: "#00F0FF" }}>ℹ</span>
                  <span>Only existing admin accounts can access the control panel.</span>
                </div>
              </div>
            )}

            {/* Consent Checkbox */}
            {!isAdminLogin && (
              <label
                htmlFor="create-account-consent"
                className="flex items-start gap-2.5 rounded-xl border px-4 py-3 transition-all hover:border-opacity-100 cursor-pointer group"
                style={{
                  backgroundColor: createAccountConsent ? "#00F0FF0A" : "#0D1117",
                  borderColor: createAccountConsent ? "#00F0FF44" : "#21262D",
                }}
              >
                <input
                  id="create-account-consent"
                  type="checkbox"
                  checked={createAccountConsent}
                  onChange={(e) => setCreateAccountConsent(e.target.checked)}
                  className="mt-0.5 flex-shrink-0"
                  style={{ accentColor: "#00F0FF" }}
                />
                <span className="text-xs leading-relaxed transition-colors" style={{ color: createAccountConsent ? "#E6EDF3" : "#8B949E" }}>
                  I understand that signing in will create a new account if this email does not exist yet.
                </span>
              </label>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-lg px-4 py-3 border animate-in fade-in slide-in-from-top-2"
                style={{
                  color: "#FF6B6B",
                  backgroundColor: "#FF6B6B08",
                  borderColor: "#FF6B6B33",
                }}
              >
                <span className="text-lg flex-shrink-0">⚠</span>
                <span className="text-xs leading-relaxed">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full rounded-xl py-3.5 font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 group relative overflow-hidden"
              style={{
                backgroundColor: "#00F0FF",
                color: "#0D1117",
                boxShadow: loading && isFormValid ? "0 0 24px rgba(0,240,255,0.4)" : "none",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-active:opacity-30 translate-x-full group-hover:translate-x-0 transition-all" />
              {loading ? (
                <span className="flex items-center justify-center gap-2 relative z-10">
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
                <span className="relative z-10">{isAdminLogin ? "Unlock Admin Portal" : "Sign In"}</span>
              )}
            </button>
          </form>

          <div style={{ borderTop: "1px solid #21262D" }} />

          {/* Footer */}
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <p className="text-xs" style={{ color: "#8B949E" }}>
                {isAdminLogin ? "Not an admin? " : "Admin access? "}
                <Link
                  href={isAdminLogin ? "/login" : "/login?mode=admin&callbackUrl=%2Fadmin"}
                  className="font-semibold transition-colors hover:text-opacity-80"
                  style={{ color: "#00F0FF" }}
                >
                  {isAdminLogin ? "Standard login" : "Admin login"}
                </Link>
              </p>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
              style={{
                backgroundColor: "#00F0FF08",
                borderLeft: "3px solid #00F0FF44",
                color: "#8B949E",
              }}
            >
              <span style={{ color: "#00F0FF" }}>🔒</span>
              <span>Military-grade encryption protects your data</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}