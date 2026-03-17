"use client";

import { type Data, Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { useCallback, useEffect, useRef, useState } from "react";
import config from "../../../puck.config";

const DRAFT_KEY = "retrogigz-puck-draft";
const AUTOSAVE_DELAY_MS = 1500;

const emptyData: Data = {
  root: { props: { title: "" } },
  content: [],
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function VisualBuilderPage() {
  const [data, setData] = useState<Data>(emptyData);
  const [loading, setLoading] = useState(true);
  const [publishStatus, setPublishStatus] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI Magic button state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const puckRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/admin/puck", { cache: "no-store" })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("Failed to load Puck data")),
      )
      .then((payload: { data?: Data }) => {
        const serverData = payload?.data;
        const rawDraft = localStorage.getItem(DRAFT_KEY);

        if (rawDraft) {
          try {
            const draft = JSON.parse(rawDraft) as Data;
            // If the server has no published content yet, restore the local draft
            if (!serverData || serverData.content.length === 0) {
              setData(draft);
              setPublishStatus("Restored unsaved draft.");
            } else {
              setData(serverData);
            }
          } catch {
            if (serverData) setData(serverData);
          }
        } else if (serverData) {
          setData(serverData);
        }
      })
      .catch(() => {
        const rawDraft = localStorage.getItem(DRAFT_KEY);
        if (rawDraft) {
          try {
            setData(JSON.parse(rawDraft) as Data);
            setPublishStatus("Server unavailable. Restored from local draft.");
          } catch {
            setPublishStatus("Could not load saved layout. Starting with an empty canvas.");
          }
        } else {
          setPublishStatus("Could not load saved layout. Starting with an empty canvas.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((updatedData: Data) => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setSaveStatus("saving");
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(updatedData));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, AUTOSAVE_DELAY_MS);
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-400">Loading visual builder...</div>;
  }

  const saveStatusConfig: Record<SaveStatus, { label: string; className: string }> = {
    idle: { label: "", className: "" },
    saving: { label: "Saving draft\u2026", className: "text-slate-400 animate-pulse" },
    saved: { label: "Draft saved \u2713", className: "text-cyan-400" },
    error: { label: "Draft save failed", className: "text-rose-400" },
  };

  return (
    <div className="space-y-4 relative">
      {/* Floating AI Magic button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
        onClick={() => setAiOpen((open) => !open)}
      >
        <span role="img" aria-label="magic">✨</span> AI Magic
      </button>

      {/* AI input popup */}
      {aiOpen && (
        <div className="fixed bottom-20 right-8 z-50 bg-slate-800 border border-cyan-400 rounded-xl p-4 shadow-lg w-80 flex flex-col gap-2">
          <label htmlFor="ai-prompt" className="text-xs text-cyan-300 mb-1">Describe your layout:</label>
          <input
            id="ai-prompt"
            type="text"
            className="px-3 py-2 rounded border border-slate-600 bg-slate-900 text-white focus:outline-none focus:border-cyan-400"
            placeholder="e.g. Hero section with CTA"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && aiPrompt.trim()) {
                setAiLoading(true);
                try {
                  const { askLocalAI } = await import("../../../lib/askLocalAI");
                  const aiData = await askLocalAI(aiPrompt);
                  setAiOpen(false);
                  setAiPrompt("");
                  setAiLoading(false);
                  // Update Puck preview instantly
                  setData(aiData);
                  // If using puckRef, update via puckRef.current.setData(aiData)
                  if (puckRef.current && puckRef.current.setData) {
                    puckRef.current.setData(aiData);
                  }
                } catch (err: any) {
                  setAiLoading(false);
                  alert("AI error: " + (err?.message || "Unknown error"));
                }
              }
            }}
            disabled={aiLoading}
            autoFocus
          />
          {aiLoading && (
            <div className="flex items-center gap-2 mt-2">
              <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-xs text-cyan-300">AI is thinking</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Visual Builder</h1>
          <p className="mt-1 text-sm text-slate-400">
            Build and publish content visually with Puck.
          </p>
          {publishStatus ? (
            <p className="mt-2 text-xs text-cyan-300">{publishStatus}</p>
          ) : null}
        </div>
        {saveStatus !== "idle" && (
          <p className={`mt-1 shrink-0 text-xs ${saveStatusConfig[saveStatus].className}`}>
            {saveStatusConfig[saveStatus].label}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        <Puck
          config={config}
          data={data}
          onChange={handleChange}
          onPublish={async (publishedData) => {
            const response = await fetch("/api/admin/puck", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: publishedData }),
            });

            if (!response.ok) {
              setPublishStatus("Publish failed. Please try again.");
              return;
            }

            // Clear the local draft now that it's been published to the server
            localStorage.removeItem(DRAFT_KEY);
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
            setSaveStatus("idle");
            setPublishStatus("Published successfully.");
            console.log("Puck publish payload:", publishedData);
          }}
        />
      </div>
    </div>
  );
}
