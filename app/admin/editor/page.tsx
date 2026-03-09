"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface TreeNode {
  path: string;
  name: string;
  isDir: boolean;
  ext?: string;
}

const EXT_COLORS: Record<string, string> = {
  tsx: "#60A5FA", ts: "#60A5FA",
  jsx: "#F6C90E", js: "#F6C90E",
  css: "#34D399", scss: "#34D399",
  json: "#FB923C",
  md: "#A78BFA",
  html: "#F87171",
};

function extColor(ext?: string) {
  return ext ? (EXT_COLORS[ext] ?? "#8B949E") : "#8B949E";
}

function LineNumbers({ content }: { content: string }) {
  const lines = content.split("\n").length;
  return (
    <div
      className="select-none text-right pr-4 pt-4 pb-4 text-xs leading-6 font-mono flex-shrink-0"
      style={{ color: "#8B949E44", minWidth: "3.5rem", userSelect: "none" }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}

export default function EditorPage() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    setTreeLoading(true);
    fetch("/api/admin/editor")
      .then((r) => r.json())
      .then((d: { tree: TreeNode[] }) => {
        setTree(d.tree ?? []);
        setTreeLoading(false);
      })
      .catch(() => setTreeLoading(false));
  }, []);

  const openFileInEditor = useCallback((filePath: string) => {
    if (content !== originalContent) {
      if (!confirm("You have unsaved changes. Discard and open new file?")) return;
    }
    setFileLoading(true);
    setOpenFile(filePath);
    fetch(`/api/admin/editor?file=${encodeURIComponent(filePath)}`)
      .then((r) => r.json())
      .then((d: { content?: string; error?: string }) => {
        if (d.error) {
          showToast(d.error, false);
          setOpenFile(null);
        } else {
          setContent(d.content ?? "");
          setOriginalContent(d.content ?? "");
        }
        setFileLoading(false);
      })
      .catch(() => {
        showToast("Failed to load file", false);
        setFileLoading(false);
      });
  }, [content, originalContent]);

  async function saveFile() {
    if (!openFile) return;
    setSaving(true);
    const res = await fetch("/api/admin/editor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: openFile, content }),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      setOriginalContent(content);
      showToast("File saved");
    } else {
      showToast(data.error ?? "Save failed", false);
    }
    setSaving(false);
  }

  // Ctrl+S / Cmd+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Tab key support in editor
  function handleKeyDownInEditor(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = content.substring(0, start) + "  " + content.substring(end);
      setContent(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  function toggleCollapse(path: string) {
    setCollapsed((c) => {
      const n = new Set(c);
      if (n.has(path)) n.delete(path);
      else n.add(path);
      return n;
    });
  }

  // Build indented tree
  function renderTree(nodes: TreeNode[], parentPath = "") {
    return nodes
      .filter((n) => {
        const parent = n.path.split("/").slice(0, -1).join("/");
        return parent === parentPath;
      })
      .map((node) => {
        const depth = node.path.split("/").length - 1;
        const isCollapsed = collapsed.has(node.path);
        const isOpen = openFile === node.path;
        const isDirWithChildren = node.isDir && tree.some((n) => n.path.startsWith(node.path + "/"));

        return (
          <div key={node.path}>
            <button
              onClick={() => {
                if (node.isDir) toggleCollapse(node.path);
                else openFileInEditor(node.path);
              }}
              className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-all duration-100 text-left"
              style={{
                paddingLeft: `${0.5 + depth * 0.875}rem`,
                backgroundColor: isOpen ? "#1C2128" : "transparent",
                color: isOpen ? "#00F0FF" : node.isDir ? "#E6EDF3" : "#C9D1D9",
              }}
              onMouseEnter={(e) => { if (!isOpen) (e.currentTarget as HTMLElement).style.backgroundColor = "#1C212860"; }}
              onMouseLeave={(e) => { if (!isOpen) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              {node.isDir ? (
                <span style={{ color: "#8B949E", fontSize: "10px" }}>
                  {isDirWithChildren ? (isCollapsed ? "▶" : "▼") : "·"}
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded leading-none" style={{ backgroundColor: extColor(node.ext) + "22", color: extColor(node.ext) }}>
                  {node.ext?.toUpperCase() ?? "FILE"}
                </span>
              )}
              <span className={node.isDir ? "font-semibold" : ""}>{node.name}</span>
            </button>
            {node.isDir && !isCollapsed && renderTree(nodes, node.path)}
          </div>
        );
      });
  }

  const isDirty = content !== originalContent;
  const currentExt = openFile ? openFile.split(".").pop()?.toLowerCase() : undefined;

  return (
    <div className="flex flex-col gap-4">
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>Code Editor</h1>
          <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
            Browse and edit source files. Changes take effect immediately.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: "#FF6B3510", borderColor: "#FF6B3533", color: "#FF6B35" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Dev Mode — Edits are immediate
        </div>
      </div>

      {/* Editor layout */}
      <div
        className="flex rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: "#161B22",
          borderColor: "#21262D",
          height: "calc(100vh - 220px)",
          minHeight: "500px",
        }}
      >
        {/* File tree */}
        <div
          className="flex flex-col overflow-hidden flex-shrink-0"
          style={{ width: "220px", borderRight: "1px solid #21262D" }}
        >
          <div
            className="px-3 py-3 text-xs font-semibold uppercase tracking-wider flex-shrink-0"
            style={{ borderBottom: "1px solid #21262D", color: "#8B949E" }}
          >
            Explorer
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-1">
            {treeLoading ? (
              <div className="px-3 py-8 text-center text-xs" style={{ color: "#8B949E" }}>
                Loading…
              </div>
            ) : (
              renderTree(tree)
            )}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div
            className="flex items-center gap-0 flex-shrink-0 overflow-x-auto"
            style={{ borderBottom: "1px solid #21262D", backgroundColor: "#0D1117" }}
          >
            {openFile ? (
              <div
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-mono flex-shrink-0"
                style={{ borderRight: "1px solid #21262D", color: isDirty ? "#E6EDF3" : "#8B949E" }}
              >
                {isDirty && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#00F0FF" }} />
                )}
                {openFile.split("/").pop()}
                {currentExt && (
                  <span
                    className="text-[9px] font-bold px-1 py-0.5 rounded leading-none"
                    style={{ backgroundColor: extColor(currentExt) + "22", color: extColor(currentExt) }}
                  >
                    {currentExt.toUpperCase()}
                  </span>
                )}
              </div>
            ) : (
              <span className="px-4 py-2.5 text-xs" style={{ color: "#8B949E44" }}>
                No file open
              </span>
            )}
            <div className="ml-auto flex items-center gap-2 px-3">
              {openFile && (
                <>
                  <button
                    onClick={() => {
                      if (isDirty && !confirm("Discard changes?")) return;
                      setContent(originalContent);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-150"
                    style={{ borderColor: "#21262D", color: "#8B949E" }}
                    disabled={!isDirty}
                  >
                    Revert
                  </button>
                  <button
                    onClick={saveFile}
                    disabled={saving || !isDirty}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5"
                    style={{
                      backgroundColor: isDirty ? "#00F0FF" : "#00F0FF40",
                      color: isDirty ? "#0D1117" : "#0D1117AA",
                    }}
                  >
                    {saving ? "Saving…" : "Save"}
                    <span className="opacity-60">⌘S</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Code editor */}
          {!openFile ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: "#8B949E" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 opacity-30">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
              <p className="text-sm">Select a file from the explorer to edit</p>
            </div>
          ) : fileLoading ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: "#8B949E" }}>
              <p className="text-sm">Loading file…</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto flex" style={{ backgroundColor: "#0D1117" }}>
              <LineNumbers content={content} />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDownInEditor}
                spellCheck={false}
                className="flex-1 outline-none resize-none text-xs leading-6 font-mono pt-4 pb-4 pr-4 bg-transparent"
                style={{ color: "#E6EDF3", caretColor: "#00F0FF" }}
              />
            </div>
          )}

          {/* Status bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5 text-[10px] font-mono flex-shrink-0"
            style={{ borderTop: "1px solid #21262D", backgroundColor: "#0D1117", color: "#8B949E" }}
          >
            <span>{openFile ?? "No file"}</span>
            <span>{content.split("\n").length} lines · {content.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
