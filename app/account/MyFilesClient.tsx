"use client";

import { useEffect, useMemo, useState } from "react";

interface SoloFileItem {
  id: string;
  filename: string;
  status: "queued" | "processing" | "completed" | "failed";
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function MyFilesClient() {
  const [files, setFiles] = useState<SoloFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchFiles() {
    try {
      const res = await fetch("/api/solo-files", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load files");
      }
      const data = (await res.json()) as { files?: SoloFileItem[] };
      setFiles(data.files ?? []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load files";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchFiles();
  }, []);

  useEffect(() => {
    const hasPending = files.some((file) => file.status === "queued" || file.status === "processing");
    if (!hasPending) return;

    const interval = setInterval(() => {
      void fetchFiles();
    }, 4000);

    return () => clearInterval(interval);
  }, [files]);

  const pendingCount = useMemo(
    () => files.filter((f) => f.status === "queued" || f.status === "processing").length,
    [files],
  );

  return (
    <section className="rounded-3xl border p-6 sm:p-8 lift-card fade-up" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">My Files</h1>
          <p className="mt-2 text-sm" style={{ color: "#8B949E" }}>
            Your generated .solo files live here. You can close the generator tab and download when ready.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void fetchFiles();
          }}
          className="rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wide soft-btn"
          style={{ borderColor: "#00F0FF55", color: "#00F0FF" }}
        >
          Refresh
        </button>
      </div>

      {pendingCount > 0 ? (
        <p className="mt-4 text-sm font-semibold" style={{ color: "#9CCFD8" }}>
          {pendingCount} file{pendingCount === 1 ? " is" : "s are"} still processing.
        </p>
      ) : null}

      {loading ? <p className="mt-6 text-sm" style={{ color: "#8B949E" }}>Loading files...</p> : null}
      {error ? <p className="mt-6 text-sm" style={{ color: "#EF4444" }}>{error}</p> : null}

      {!loading && !error && files.length === 0 ? (
        <p className="mt-6 text-sm" style={{ color: "#8B949E" }}>
          No .solo files yet. Generate one from the kickstart page.
        </p>
      ) : null}

      {!loading && !error && files.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border fade-up" style={{ borderColor: "#21262D" }}>
          <table className="min-w-full text-sm">
            <thead style={{ backgroundColor: "#0D1117" }}>
              <tr>
                <th className="px-4 py-3 text-left font-bold" style={{ color: "#8B949E" }}>File</th>
                <th className="px-4 py-3 text-left font-bold" style={{ color: "#8B949E" }}>Status</th>
                <th className="px-4 py-3 text-left font-bold" style={{ color: "#8B949E" }}>Created</th>
                <th className="px-4 py-3 text-left font-bold" style={{ color: "#8B949E" }}>Updated</th>
                <th className="px-4 py-3 text-left font-bold" style={{ color: "#8B949E" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, idx) => (
                <tr key={file.id} style={{ borderTop: idx === 0 ? "none" : "1px solid #21262D" }}>
                  <td className="px-4 py-3" style={{ color: "#E6EDF3" }}>{file.filename}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
                      style={{
                        color:
                          file.status === "completed"
                            ? "#34D399"
                            : file.status === "failed"
                              ? "#EF4444"
                              : "#00F0FF",
                        backgroundColor:
                          file.status === "completed"
                            ? "#34D3991A"
                            : file.status === "failed"
                              ? "#EF44441A"
                              : "#00F0FF1A",
                      }}
                    >
                      {file.status}
                    </span>
                    {file.status === "failed" && file.errorMessage ? (
                      <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{file.errorMessage}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#8B949E" }}>{formatDate(file.createdAt)}</td>
                  <td className="px-4 py-3" style={{ color: "#8B949E" }}>{formatDate(file.updatedAt)}</td>
                  <td className="px-4 py-3">
                    {file.downloadUrl ? (
                      <a
                        href={file.downloadUrl}
                        className="rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide soft-btn"
                        style={{ borderColor: "#34D39966", color: "#34D399" }}
                      >
                        Download
                      </a>
                    ) : (
                      <span style={{ color: "#8B949E" }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
