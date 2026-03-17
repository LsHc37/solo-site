"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

type CommunityKind = "question" | "review";

interface CommunityPost {
  id: number;
  kind: CommunityKind;
  author_name: string;
  message: string;
  created_at: string;
}

interface DonationOption {
  label: string;
  description: string;
  href: string;
  cta: string;
  internal?: boolean;
}

const DONATION_OPTIONS = [
  {
    label: "PayPal",
    description: "One-time support for game dev, hosting, and updates.",
    href: "https://www.paypal.com",
    cta: "Donate with PayPal",
  },
  {
    label: "Ko-fi",
    description: "Fuel independent work with small recurring support.",
    href: "https://ko-fi.com",
    cta: "Support on Ko-fi",
  },
  {
    label: "Direct Sponsor",
    description: "Want to sponsor a feature or release milestone?",
    href: "/contact?topic=sponsorship",
    cta: "Contact for sponsorship",
    internal: true,
  },
] as DonationOption[];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | CommunityKind>("all");
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<CommunityKind>("question");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const filteredPosts = useMemo(() => {
    if (activeFilter === "all") {
      return posts;
    }
    return posts.filter((post) => post.kind === activeFilter);
  }, [activeFilter, posts]);

  async function loadPosts() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/public/community", { cache: "no-store" });
      const data = (await response.json()) as { posts?: CommunityPost[] };
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          authorName,
          message,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFormMessage(data.error ?? "Could not post right now.");
        return;
      }

      setAuthorName("");
      setMessage("");
      setKind("question");
      setFormMessage("Posted. Thanks for supporting the community.");
      await loadPosts();
    } catch {
      setFormMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />
      <main>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-10">
        <div
          className="rounded-3xl border p-8 sm:p-10"
          style={{
            background:
              "linear-gradient(120deg, rgba(0,240,255,0.07), rgba(13,17,23,1) 40%, rgba(22,27,34,1))",
            borderColor: "#00F0FF44",
          }}
        >
          <p className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: "#00F0FF" }}>
            Retro Gigz Community
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">Donate, Ask, Review</h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed" style={{ color: "#8B949E" }}>
            Help fund development and join the conversation. This space is for supporters, players,
            and users to ask questions, leave honest reviews, and shape what we build next.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-bold">Support Retro Gigz</h2>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {DONATION_OPTIONS.map((option) => {
            const card = (
              <article
                className="rounded-2xl border p-5 h-full"
                style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
              >
                <p className="text-sm font-bold" style={{ color: "#E6EDF3" }}>
                  {option.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "#8B949E" }}>
                  {option.description}
                </p>
                <div
                  className="mt-5 inline-flex px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
                >
                  {option.cta}
                </div>
              </article>
            );

            if (option.internal) {
              return (
                <Link key={option.label} href={option.href} className="block transition-transform hover:-translate-y-1">
                  {card}
                </Link>
              );
            }

            return (
              <a
                key={option.label}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform hover:-translate-y-1"
              >
                {card}
              </a>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div
          className="lg:col-span-2 rounded-2xl border p-6"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <h2 className="text-xl font-bold">Post a Question or Review</h2>
          <p className="mt-2 text-sm" style={{ color: "#8B949E" }}>
            Keep it useful. Share context and details so others can help quickly.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="kind" className="text-xs font-semibold tracking-wide" style={{ color: "#8B949E" }}>
                Post Type
              </label>
              <select
                id="kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as CommunityKind)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "#0D1117", borderColor: "#30363D" }}
              >
                <option value="question">Question</option>
                <option value="review">Review</option>
              </select>
            </div>

            <div>
              <label htmlFor="author" className="text-xs font-semibold tracking-wide" style={{ color: "#8B949E" }}>
                Name
              </label>
              <input
                id="author"
                value={authorName}
                onChange={(event) => setAuthorName(event.target.value)}
                required
                minLength={2}
                maxLength={60}
                placeholder="Your name"
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "#0D1117", borderColor: "#30363D" }}
              />
            </div>

            <div>
              <label htmlFor="message" className="text-xs font-semibold tracking-wide" style={{ color: "#8B949E" }}>
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                minLength={8}
                maxLength={500}
                rows={6}
                placeholder="Ask your question or leave your review"
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none resize-y"
                style={{ backgroundColor: "#0D1117", borderColor: "#30363D" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
            >
              {isSubmitting ? "Posting..." : "Post to Community"}
            </button>

            {formMessage && (
              <p className="text-xs" style={{ color: formMessage.startsWith("Posted") ? "#00F0FF" : "#FF7B72" }}>
                {formMessage}
              </p>
            )}
          </form>
        </div>

        <div
          className="lg:col-span-3 rounded-2xl border p-6"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Community Feed</h2>
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "All" },
                { key: "question", label: "Questions" },
                { key: "review", label: "Reviews" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key as "all" | CommunityKind)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{
                    borderColor: activeFilter === filter.key ? "#00F0FF" : "#30363D",
                    color: activeFilter === filter.key ? "#00F0FF" : "#8B949E",
                    backgroundColor: activeFilter === filter.key ? "#00F0FF12" : "transparent",
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {isLoading && <p className="text-sm" style={{ color: "#8B949E" }}>Loading posts...</p>}

            {!isLoading && filteredPosts.length === 0 && (
              <p className="text-sm" style={{ color: "#8B949E" }}>
                No posts yet. Be the first to ask a question or share a review.
              </p>
            )}

            {!isLoading &&
              filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: "#0D1117", borderColor: "#30363D" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: post.kind === "question" ? "#1F6FEB22" : "#00F0FF22",
                          color: post.kind === "question" ? "#58A6FF" : "#00F0FF",
                        }}
                      >
                        {post.kind}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "#E6EDF3" }}>
                        {post.author_name}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: "#8B949E" }}>
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "#C9D1D9" }}>
                    {post.message}
                  </p>
                </article>
              ))}
          </div>
        </div>
      </section>
      </main>
      <PublicFooter />
    </div>
  );
}
