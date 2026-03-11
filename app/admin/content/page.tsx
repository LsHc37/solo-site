"use client";

import { useEffect, useState, useCallback } from "react";

interface Block {
  id: number;
  key: string;
  value: string;
  label: string;
  section: string;
  updated_at: string;
}

const SECTIONS = ["general", "hero", "privacy", "divisions", "footer"];

function BlockCard({
  block,
  onSave,
  onDelete,
}: {
  block: Block;
  onSave: (key: string, value: string, label: string, section: string) => Promise<void>;
  onDelete: (key: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(block.value);
  const [label, setLabel] = useState(block.label);
  const [section, setSection] = useState(block.section);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(block.key, value, label, section);
    setSaving(false);
    setEditing(false);
  }

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ backgroundColor: "#0D1117", borderColor: editing ? "#00F0FF44" : "#21262D" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "#161B22", color: "#00F0FF" }}>
              {block.key}
            </code>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#8B949E15", color: "#8B949E", border: "1px solid #8B949E22" }}
            >
              {block.section}
            </span>
          </div>
          {block.label && (
            <p className="text-xs" style={{ color: "#8B949E" }}>{block.label}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setEditing((e) => !e)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-150"
            style={{ borderColor: "#21262D", color: editing ? "#00F0FF" : "#8B949E" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete block "${block.key}"?`)) onDelete(block.key);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-150"
            style={{ borderColor: "#21262D", color: "#8B949E" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#FF000044";
              (e.currentTarget as HTMLElement).style.color = "#FF6B6B";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#21262D";
              (e.currentTarget as HTMLElement).style.color = "#8B949E";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8B949E" }}>
                Display Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: "#161B22", borderColor: "#21262D", color: "#E6EDF3" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8B949E" }}>
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: "#161B22", borderColor: "#21262D", color: "#E6EDF3" }}
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8B949E" }}>
              Content
            </label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              className="px-3 py-2 rounded-lg border text-sm outline-none resize-y font-mono"
              style={{ backgroundColor: "#161B22", borderColor: "#21262D", color: "#E6EDF3", minHeight: "80px" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150"
              style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setValue(block.value);
                setLabel(block.label);
                setSection(block.section);
                setEditing(false);
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium border"
              style={{ borderColor: "#21262D", color: "#8B949E" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap break-words"
          style={{ color: "#E6EDF3" }}
        >
          {block.value || <span style={{ color: "#8B949E" }}>(empty)</span>}
        </p>
      )}

      <p className="text-[10px]" style={{ color: "#8B949E44" }}>
        Updated {new Date(block.updated_at).toLocaleString()}
      </p>
    </div>
  );
}

export default function ContentPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("all");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // New block form
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newSection, setNewSection] = useState("general");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d: { blocks: Block[] }) => {
        setBlocks(d.blocks ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveBlock(key: string, value: string, label: string, section: string) {
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, label, section }),
    });
    if (res.ok) {
      setBlocks((bs) =>
        bs.map((b) =>
          b.key === key ? { ...b, value, label, section, updated_at: new Date().toISOString() } : b,
        ),
      );
      showToast("Block saved");
    } else {
      showToast("Save failed", false);
    }
  }

  async function deleteBlock(key: string) {
    const res = await fetch(`/api/admin/content?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setBlocks((bs) => bs.filter((b) => b.key !== key));
      showToast("Block deleted");
    } else {
      showToast("Delete failed", false);
    }
  }

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: newKey.trim(), value: newValue, label: newLabel || newKey.trim(), section: newSection }),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      showToast("Block created");
      setNewKey(""); setNewValue(""); setNewLabel(""); setNewSection("general");
      setShowForm(false);
      load();
    } else {
      showToast(data.error ?? "Failed", false);
    }
    setAdding(false);
  }

  const sections = ["all", ...Array.from(new Set(blocks.map((b) => b.section)))];
  const filtered =
    activeSection === "all" ? blocks : blocks.filter((b) => b.section === activeSection);

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl"
          style={{
            backgroundColor: toast.ok ? "#00F0FF15" : "#FF000015",
            border: `1px solid ${toast.ok ? "#00F0FF44" : "#FF000044"}`,
            color: toast.ok ? "#00F0FF" : "#FF6B6B",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>Content Blocks</h1>
          <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
            Named text blocks you can reference throughout your pages.
          </p>
        </div>
        <button
          onClick={() => setShowForm((f) => !f)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all duration-150"
          style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Block
        </button>
      </div>

      {/* New block form */}
      {showForm && (
        <form
          onSubmit={addBlock}
          className="rounded-2xl border p-6 flex flex-col gap-4"
          style={{ backgroundColor: "#161B22", borderColor: "#00F0FF33" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Create New Block</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>Key *</label>
              <input
                required
                type="text"
                placeholder="e.g. hero_headline"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.replace(/\s/g, "_"))}
                className="px-3 py-2.5 rounded-lg border text-sm outline-none font-mono"
                style={{ backgroundColor: "#0D1117", borderColor: "#21262D", color: "#E6EDF3" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>Display Label</label>
              <input
                type="text"
                placeholder="Human-readable name"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: "#0D1117", borderColor: "#21262D", color: "#E6EDF3" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>Section</label>
              <select
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: "#0D1117", borderColor: "#21262D", color: "#E6EDF3" }}
              >
                {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "#8B949E" }}>Content</label>
            <textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              rows={3}
              placeholder="Enter the block content…"
              className="px-3 py-2.5 rounded-lg border text-sm outline-none resize-y"
              style={{ backgroundColor: "#0D1117", borderColor: "#21262D", color: "#E6EDF3" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2 rounded-lg text-sm font-bold"
              style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
            >
              {adding ? "Creating…" : "Create Block"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: "#21262D", color: "#8B949E" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Section filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150"
            style={
              activeSection === s
                ? { backgroundColor: "#00F0FF15", color: "#00F0FF", border: "1px solid #00F0FF33" }
                : { backgroundColor: "#161B22", color: "#8B949E", border: "1px solid #21262D" }
            }
          >
            {s}
            {s !== "all" && (
              <span className="ml-1.5 opacity-60">
                {blocks.filter((b) => b.section === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Blocks grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: "#161B22" }} />
          ))}
        </div>
      ) : !filtered.length ? (
        <div
          className="rounded-2xl border py-16 text-center"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          <p className="text-sm" style={{ color: "#8B949E" }}>
            {activeSection === "all" ? "No content blocks yet." : `No blocks in "${activeSection}".`}
          </p>
          <p className="text-xs mt-1" style={{ color: "#8B949E66" }}>
            Create a new block to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <BlockCard key={b.key} block={b} onSave={saveBlock} onDelete={deleteBlock} />
          ))}
        </div>
      )}
    </div>
  );
}
