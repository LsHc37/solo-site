"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function SoloWaitlistPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!trimmedEmail && !trimmedPhone) {
      setError("Please enter either an email or phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/public/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not submit your request.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
    } catch {
      setError("Could not submit your request right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />

      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="rounded-2xl border p-8 sm:p-10" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#00F0FF" }}>
            SOLO APP
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">Join the iOS Waitlist</h1>
          <p className="mt-3 text-sm sm:text-base" style={{ color: "#8B949E" }}>
            Enter your name and either your email or phone number. We will contact you when iOS access opens.
          </p>

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#8B949E" }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#8B949E" }}>Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#8B949E" }}>Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: "#0D1117", borderColor: "#30363D", color: "#E6EDF3" }}
                placeholder="(555) 123-4567"
              />
            </div>

            <p className="text-xs" style={{ color: "#8B949E" }}>
              At least one contact method is required.
            </p>

            {error && (
              <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#FF6B6B55", color: "#FF6B6B", backgroundColor: "#FF6B6B11" }}>
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#00F0FF55", color: "#00F0FF", backgroundColor: "#00F0FF11" }}>
                You are on the list. We will reach out soon.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-xl px-5 py-3 text-sm font-bold transition-opacity"
              style={{ backgroundColor: "#00F0FF", color: "#0D1117", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Submitting..." : "Join Waitlist"}
            </button>
          </form>

          <div className="mt-6">
            <Link href="/solo" className="text-sm font-semibold" style={{ color: "#00F0FF" }}>
              Back to Solo page
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
