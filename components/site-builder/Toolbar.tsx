"use client";

interface ToolbarProps {
  pages: Array<{ id: string; label: string }>;
  currentPage: string;
  onPageChange: (page: string) => void;
  device: "desktop" | "tablet" | "mobile";
  onDeviceChange: (device: "desktop" | "tablet" | "mobile") => void;
  onSave: () => void;
  isSaving?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isDirty?: boolean;
  autoSaveStatus?: "saved" | "saving" | "unsaved" | "error";
  lastSaved?: string;
  onToggleVersionHistory?: () => void;
  showVersionHistory?: boolean;
  collaborators?: string[];
}

export function Toolbar({
  pages,
  currentPage,
  onPageChange,
  device,
  onDeviceChange,
  onSave,
  isSaving = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isDirty = false,
  autoSaveStatus = "saved",
  lastSaved,
  onToggleVersionHistory,
  showVersionHistory = false,
  collaborators = [],
}: ToolbarProps) {
  const autoSaveText = {
    saved: "✓ All changes saved",
    saving: "Saving...",
    unsaved: "Unsaved changes",
    error: "⚠ Save failed",
  }[autoSaveStatus];

  const autoSaveColor = {
    saved: "#00F0FF",
    saving: "#8B949E",
    unsaved: "#FFA500",
    error: "#FF6B6B",
  }[autoSaveStatus];
  return (
    <div className="sticky top-0 z-40 flex flex-col gap-3 rounded-2xl border p-4" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
      {/* Header */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black" style={{ color: "#E6EDF3" }}>
              Page Builder
            </h1>
            {collaborators.length > 0 && (
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((collab, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: "#00F0FF22", borderColor: "#161B22", color: "#00F0FF" }}
                    title={collab}
                  >
                    {collab.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs" style={{ color: "#8B949E" }}>
              Enterprise visual editor
            </p>
            {lastSaved && (
              <p className="text-xs" style={{ color: autoSaveColor }}>
                {autoSaveText} {autoSaveStatus === "saved" && `• ${lastSaved}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {onToggleVersionHistory && (
            <button
              onClick={onToggleVersionHistory}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all"
              style={
                showVersionHistory
                  ? { borderColor: "#00F0FF44", backgroundColor: "#00F0FF12", color: "#00F0FF" }
                  : { borderColor: "#21262D", backgroundColor: "#161B22", color: "#8B949E" }
              }
            >
              <span className="mr-1">📋</span> Versions
            </button>
          )}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="relative rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:shadow-lg disabled:opacity-50"
            style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
          >
            {isDirty && !isSaving && (
              <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full border-2 border-[#161B22] bg-orange-400" />
            )}
            {isSaving ? "Publishing..." : "Publish to Production"}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Page selector */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "#8B949E" }}>
            Page
          </label>
          <div className="flex gap-2 flex-wrap">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
                style={
                  currentPage === page.id
                    ? { borderColor: "#00F0FF44", backgroundColor: "#00F0FF12", color: "#00F0FF" }
                    : { borderColor: "#21262D", backgroundColor: "#0D1117", color: "#8B949E" }
                }
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>

        {/* Device selector */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "#8B949E" }}>
            Device
          </label>
          <div className="flex gap-2">
            {(["desktop", "tablet", "mobile"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onDeviceChange(mode)}
                className="rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all flex-1 capitalize"
                style={
                  device === mode
                    ? { borderColor: "#00F0FF44", backgroundColor: "#00F0FF12", color: "#00F0FF" }
                    : { borderColor: "#21262D", backgroundColor: "#0D1117", color: "#8B949E" }
                }
                title={`View on ${mode}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Undo/Redo */}
        {(onUndo || onRedo) && (
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "#8B949E" }}>
              Edit
            </label>
            <div className="flex gap-2">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
                style={{
                  borderColor: "#21262D",
                  backgroundColor: "#0D1117",
                  color: canUndo ? "#00F0FF" : "#8B949E",
                }}
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
                style={{
                  borderColor: "#21262D",
                  backgroundColor: "#0D1117",
                  color: canRedo ? "#00F0FF" : "#8B949E",
                }}
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
