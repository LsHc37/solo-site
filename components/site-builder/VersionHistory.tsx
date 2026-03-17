"use client";

import { useState, useEffect } from "react";

interface Version {
  id: number;
  label: string;
  content: string;
  created_by: string;
  created_at: string;
  is_published: boolean;
  metadata?: string;
}

interface VersionHistoryProps {
  onRestore: (content: Record<string, unknown>) => void;
  onPublish: (id: number) => void;
  onCreateVersion: (label: string) => void;
}

export function VersionHistory({ onRestore, onPublish, onCreateVersion }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    loadVersions();
  }, []);

  async function loadVersions() {
    try {
      const response = await fetch("/api/admin/versions?action=list");
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      console.error("Failed to load versions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(version: Version) {
    if (!confirm(`Restore "${version.label}"? This will replace your current work.`)) return;

    try {
      const content = JSON.parse(version.content);
      onRestore(content);
      
      const toast = document.createElement("div");
      toast.textContent = `✓ Restored: ${version.label}`;
      toast.className = "fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl";
      toast.style.cssText = "background-color: #00F0FF15; border: 1px solid #00F0FF44; color: #00F0FF;";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (err) {
      alert("Failed to restore version");
    }
  }

  async function handlePublish(id: number) {
    if (!confirm("Publish this version to production? This will update the live site.")) return;

    try {
      const response = await fetch("/api/admin/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", id }),
      });

      if (response.ok) {
        onPublish(id);
        loadVersions();
      } else {
        alert("Failed to publish version");
      }
    } catch (err) {
      alert("Failed to publish version");
    }
  }

  async function handleDelete(id: number, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;

    try {
      const response = await fetch("/api/admin/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });

      if (response.ok) {
        loadVersions();
      } else {
        alert("Failed to delete version");
      }
    } catch (err) {
      alert("Failed to delete version");
    }
  }

  async function handleCreateVersion() {
    if (!newLabel.trim()) {
      alert("Please enter a version label");
      return;
    }

    onCreateVersion(newLabel.trim());
    setNewLabel("");
    loadVersions();
  }

  if (loading) {
    return (
      <div className="rounded-3xl border p-5" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
        <div className="h-64 animate-pulse rounded-2xl" style={{ backgroundColor: "#0D1117" }} />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border p-5 overflow-y-auto max-h-[calc(100vh-220px)]" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "#E6EDF3" }}>
            Version History
          </h2>
          <p className="mt-1 text-xs" style={{ color: "#8B949E" }}>
            Restore previous versions or create new ones
          </p>
        </div>
        <div className="rounded-xl border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#21262D", color: "#8B949E" }}>
          {versions.length} versions
        </div>
      </div>

      {/* Create new version */}
      <div className="rounded-2xl border p-4 mb-4" style={{ backgroundColor: "#0D1117", borderColor: "#21262D" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: "#8B949E" }}>
          Create Checkpoint
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateVersion()}
            placeholder="e.g., Homepage redesign v1"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "#0D1117", borderColor: "#21262D", color: "#E6EDF3" }}
          />
          <button
            onClick={handleCreateVersion}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Version list */}
      <div className="space-y-2">
        {versions.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center" style={{ backgroundColor: "#0D1117", borderColor: "#21262D" }}>
            <p className="text-sm" style={{ color: "#8B949E" }}>
              No saved versions yet. Create your first checkpoint above.
            </p>
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className="rounded-2xl border p-4 transition-all hover:border-[#00F0FF44]"
              style={{ backgroundColor: "#0D1117", borderColor: version.is_published ? "#00F0FF44" : "#21262D" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate" style={{ color: "#E6EDF3" }}>
                      {version.label}
                    </p>
                    {version.is_published && (
                      <span className="rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: "#00F0FF22", color: "#00F0FF" }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#8B949E" }}>
                    {new Date(version.created_at).toLocaleString()} • {version.created_by}
                  </p>
                </div>

                <button
                  onClick={() => setExpandedId(expandedId === version.id ? null : version.id)}
                  className="rounded-lg border px-2 py-1 text-xs"
                  style={{ borderColor: "#21262D", color: "#8B949E" }}
                >
                  {expandedId === version.id ? "▼" : "▶"}
                </button>
              </div>

              {expandedId === version.id && (
                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: "#21262D" }}>
                  <button
                    onClick={() => handleRestore(version)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:bg-[#00F0FF12]"
                    style={{ borderColor: "#00F0FF44", color: "#00F0FF" }}
                  >
                    ↶ Restore
                  </button>
                  
                  {!version.is_published && (
                    <>
                      <button
                        onClick={() => handlePublish(version.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                        style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
                      >
                        ↑ Publish
                      </button>
                      <button
                        onClick={() => handleDelete(version.id, version.label)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:bg-[#FF6B6B12]"
                        style={{ borderColor: "#FF6B6B44", color: "#FF6B6B" }}
                      >
                        ✕ Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
