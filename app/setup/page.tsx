"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [totpSecret, setTotpSecret] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [enable2FA, setEnable2FA] = useState(true);
  
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    loadSetup();
  }, []);

  async function loadSetup() {
    try {
      const res = await fetch("/api/auth/setup");
      if (res.ok) {
        const data = await res.json();
        setTotpSecret(data.secret);
        setTotpUri(data.uri);
        setMustChangePassword(data.mustChangePassword);
      } else {
        setError("Failed to load setup. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }

    if (enable2FA && totpCode.length !== 6) {
      setError("Please enter a valid 6-digit code from your authenticator app");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          totpSecret: enable2FA ? totpSecret : null,
          totpCode: enable2FA ? totpCode : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Setup failed");
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-[#8B949E]">Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-[#E6EDF3] mb-2">Setup Complete!</h1>
          <p className="text-[#8B949E] mb-4">
            Your account has been configured successfully. You will be redirected to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">
            {mustChangePassword ? "⚠️ Password Change Required" : "Account Setup"}
          </h1>
          <p className="text-[#8B949E]">
            {mustChangePassword 
              ? "You must change your password and set up 2FA before continuing"
              : "Secure your account with a new password and two-factor authentication"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Password Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#00F0FF]">1. Change Password</h2>
            
            <div>
              <label className="block text-sm font-medium text-[#8B949E] mb-2">
                Current/Temporary Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-[#E6EDF3] focus:border-[#00F0FF] focus:outline-none"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B949E] mb-2">
                New Password (min. 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-[#E6EDF3] focus:border-[#00F0FF] focus:outline-none"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B949E] mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-[#E6EDF3] focus:border-[#00F0FF] focus:outline-none"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {/* 2FA Section */}
          <div className="space-y-4 pt-6 border-t border-[#30363D]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#00F0FF]">2. Two-Factor Authentication</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enable2FA}
                  onChange={(e) => setEnable2FA(e.target.checked)}
                  className="w-5 h-5"
                  style={{ accentColor: "#00F0FF" }}
                />
                <span className="text-sm text-[#E6EDF3]">Enable 2FA</span>
              </label>
            </div>

            {enable2FA && (
              <div className="space-y-4 bg-[#0D1117] border border-[#30363D] rounded-lg p-6">
                <div className="space-y-3">
                  <p className="text-sm text-[#8B949E]">
                    <strong className="text-[#E6EDF3]">Step 1:</strong> Install an authenticator app on your phone:
                  </p>
                  <ul className="text-sm text-[#8B949E] list-disc list-inside ml-4 space-y-1">
                    <li>Google Authenticator</li>
                    <li>Microsoft Authenticator</li>
                    <li>Authy</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-[#8B949E]">
                    <strong className="text-[#E6EDF3]">Step 2:</strong> Scan this QR code or enter the secret manually:
                  </p>
                  
                  {/* QR Code Placeholder */}
                  <div className="bg-white p-6 rounded-lg inline-block">
                    <div className="text-center">
                      <div className="text-8xl mb-2">📱</div>
                      <p className="text-xs text-gray-600">QR Code Generator</p>
                      <p className="text-xs text-gray-500 mt-1">Use the secret below</p>
                    </div>
                  </div>

                  <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
                    <p className="text-xs text-[#8B949E] mb-2">Manual Entry Secret:</p>
                    <code className="text-sm text-[#00F0FF] font-mono break-all block">
                      {totpSecret}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(totpSecret);
                        alert("Secret copied to clipboard!");
                      }}
                      className="mt-2 text-xs text-[#8B949E] hover:text-[#E6EDF3]"
                    >
                      📋 Copy Secret
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-[#8B949E]">
                    <strong className="text-[#E6EDF3]">Step 3:</strong> Enter the 6-digit code from your app:
                  </p>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required={enable2FA}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-[#161B22] border border-[#30363D] rounded-lg text-[#E6EDF3] text-center text-2xl font-mono tracking-widest focus:border-[#00F0FF] focus:outline-none"
                    placeholder="000000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#00F0FF] text-black font-bold rounded-lg hover:bg-[#00D8E8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Setting up..." : "Complete Setup"}
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-6 py-3 bg-[#161B22] text-[#8B949E] rounded-lg hover:bg-[#1F2429] transition-colors"
            >
              Cancel & Logout
            </button>
          </div>

          <p className="text-xs text-[#8B949E] text-center">
            💡 Tip: Save your authenticator backup codes in a secure location
          </p>
        </form>
      </div>
    </div>
  );
}
