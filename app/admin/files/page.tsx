"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface FileEntry {
  name: string;
  isDir: boolean;
  size: number;
  modified: string;
}

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "avif"]);

function ext(name: string) {
  return name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
}

function formatSize(bytes: number) {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ name, isDir }: { name: string; isDir: boolean }) {
  if (isDir) {
    return (
      <svg viewBox="0 0 24 24" fill="#00F0FF22" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  const e = ext(name);
  const color = IMAGE_EXTS.has(e) ? "#A78BFA" : ["ts", "tsx", "js", "jsx"].includes(e) ? "#60A5FA" : ["css", "scss"].includes(e) ? "#34D399" : "#8B949E";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export default function FilesPage() {
  const [dir, setDir] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [showFolderForm, setShowFolderForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback((targetDir: string) => {
    setLoading(true);
    setSelected(null);
    fetch(`/api/admin/files?dir=${encodeURIComponent(targetDir)}`)
      .then((r) => r.json())
      .then((d: { files: FileEntry[]; dir: string }) => {
        setFiles(d.files ?? []);
        setDir(d.dir ?? targetDir);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(""); }, [load]);

  function navigate(entry: FileEntry) {
    if (!entry.isDir) {
      setSelected(selected === entry.name ? null : entry.name);
      return;
    }
    const newDir = dir ? `${dir}/${entry.name}` : entry.name;
    load(newDir);
  }

  function navigateUp() {
    const parts = dir.split("/").filter(Boolean);
    parts.pop();
    load(parts.join("/"));
  }

  async function deleteEntry(name: string) {
    const fullPath = dir ? `${dir}/${name}` : name;
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/files?path=${encodeURIComponent(fullPath)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setFiles((f) => f.filter((x) => x.name !== name));
      showToast(`"${name}" deleted`);
      if (selected === name) setSelected(null);
    } else {
      const data = await res.json() as { error?: string };
      showToast(data.error ?? "Delete failed", false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const filesToUpload = e.target.files;
    if (!filesToUpload || filesToUpload.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("dir", dir);
    for (const f of Array.from(filesToUpload)) {
      formData.append("files", f);
    }

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json() as { error?: string; uploaded?: string[] };
    if (res.ok) {
      showToast(`Uploaded ${data.uploaded?.length ?? 0} file(s)`);
      load(dir);
    } else {
      showToast(data.error ?? "Upload failed", false);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolder.trim()) return;
    const fullPath = dir ? `${dir}/${newFolder.trim()}` : newFolder.trim();
    const res = await fetch("/api/admin/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dirPath: fullPath }),
    });
    if (res.ok) {
      showToast(`Folder "${newFolder}" created`);
      setNewFolder("");
      setShowFolderForm(false);
      load(dir);
    } else {
      const data = await res.json() as { error?: string };
      showToast(data.error ?? "Failed", false);
    }
  }

  const breadcrumbs = dir ? dir.split("/").filter(Boolean) : [];
  const selectedFile = files.find((f) => f.name === selected && !f.isDir);
  const publicPath = (dir ? `/${dir}/${selected}` : `/${selected}`).replace(/\/+/g, "/");
  const isImage = selected ? IMAGE_EXTS.has(ext(selected)) : false;

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
          <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>File Manager</h1>
          <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
            Browse and manage files in the{" "}
            <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: "#21262D", color: "#00F0FF" }}>
              /public
            </code>{" "}
            directory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => setShowFolderForm((f) => !f)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150"
            style={{ borderColor: "#21262D", color: "#8B949E" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            New Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            {uploading ? "Uploading…" : "Upload Files"}
          </button>
        </div>
      </div>

      {/* New folder form */}
      {showFolderForm && (
        <form
          onSubmit={createFolder}
          className="flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{ backgroundColor: "#161B22", borderColor: "#00F0FF33" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="Folder name…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#E6EDF3" }}
          />
          <button type="submit" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}>
            Create
          </button>
          <button type="button" onClick={() => setShowFolderForm(false)} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: "#21262D", color: "#8B949E" }}>
            Cancel
          </button>
        </form>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm flex-wrap">
        <button
          onClick={() => load("")}
          className="font-semibold transition-colors"
          style={{ color: dir ? "#8B949E" : "#00F0FF" }}
        >
          public/
        </button>
        {breadcrumbs.map((crumb, i) => {
          const targetDir = breadcrumbs.slice(0, i + 1).join("/");
          return (
            <span key={i} className="flex items-center gap-1.5">
              <span style={{ color: "#21262D" }}>/</span>
              <button
                onClick={() => load(targetDir)}
                className="font-semibold transition-colors"
                style={{ color: i === breadcrumbs.length - 1 ? "#00F0FF" : "#8B949E" }}
              >
                {crumb}
              </button>
            </span>
          );
        })}
      </div>

      <div className="flex gap-6">
        {/* File list */}
        <div
          className="flex-1 rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
        >
          {/* Back row */}
          {dir && (
            <button
              onClick={navigateUp}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-sm transition-all duration-150"
              style={{ borderBottom: "1px solid #21262D", color: "#8B949E" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#1C2128"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              ../ (go up)
            </button>
          )}

          {loading ? (
            <div className="py-16 text-center text-sm" style={{ color: "#8B949E" }}>Loading…</div>
          ) : !files.length ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: "#8B949E" }}>Empty folder</p>
              <p className="text-xs mt-1" style={{ color: "#8B949E66" }}>Upload files to get started</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #21262D" }}>
                  {["Name", "Size", "Modified", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-left" style={{ color: "#8B949E" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files.map((f, i) => (
                  <tr
                    key={f.name}
                    onClick={() => navigate(f)}
                    className="cursor-pointer transition-all duration-100"
                    style={{
                      borderBottom: i < files.length - 1 ? "1px solid #21262D" : "none",
                      backgroundColor: selected === f.name ? "#1C2128" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (selected !== f.name) (e.currentTarget as HTMLElement).style.backgroundColor = "#1C212860"; }}
                    onMouseLeave={(e) => { if (selected !== f.name) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileIcon name={f.name} isDir={f.isDir} />
                        <span style={{ color: f.isDir ? "#00F0FF" : "#E6EDF3" }}>
                          {f.name}
                          {f.isDir && "/"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: "#8B949E" }}>
                      {formatSize(f.size)}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#8B949E" }}>
                      {new Date(f.modified).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => deleteEntry(f.name)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border ml-auto transition-all duration-150"
                        style={{ borderColor: "#21262D", color: "#8B949E" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "#FF000044";
                          (e.currentTarget as HTMLElement).style.color = "#FF6B6B";
                          (e.currentTarget as HTMLElement).style.backgroundColor = "#FF000010";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "#21262D";
                          (e.currentTarget as HTMLElement).style.color = "#8B949E";
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Preview panel */}
        {selectedFile && (
          <div
            className="w-72 flex-shrink-0 rounded-2xl border p-5 flex flex-col gap-4"
            style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}
          >
            <div
              className="w-full rounded-xl overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: "#0D1117", minHeight: "160px", border: "1px solid #21262D" }}
            >
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicPath}
                  alt={selected!}
                  className="max-w-full max-h-48 object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <FileIcon name={selected!} isDir={false} />
                  <span className="text-xs font-mono uppercase" style={{ color: "#8B949E" }}>
                    .{ext(selected!)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold break-all" style={{ color: "#E6EDF3" }}>
                {selected}
              </p>
              <div className="flex flex-col gap-1 text-xs" style={{ color: "#8B949E" }}>
                <span>Size: {formatSize(selectedFile.size)}</span>
                <span>Modified: {new Date(selectedFile.modified).toLocaleString()}</span>
                <span className="break-all">
                  Path:{" "}
                  <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: "#21262D", color: "#00F0FF" }}>
                    {publicPath}
                  </code>
                </span>
              </div>
              <a
                href={publicPath}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-xs font-semibold px-3 py-2 rounded-lg border text-center transition-all duration-150"
                style={{ borderColor: "#21262D", color: "#8B949E" }}
              >
                Open in new tab →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
