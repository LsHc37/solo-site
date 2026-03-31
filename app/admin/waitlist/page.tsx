"use client";

import { useEffect, useMemo, useState } from "react";

interface WaitlistEntry {
  id: number;
  platform: "ios";
  name: string;
  email: string | null;
  phone: string | null;
  added_to_google_form: number;
  google_form_added_at: string | null;
  created_at: string;
}

interface WaitlistResponse {
  entries: WaitlistEntry[];
  googleFormUrlTemplate: string;
}

function buildGoogleFormUrl(template: string, entry: WaitlistEntry): string {
  if (!template.trim()) return "";
  const replacements: Record<string, string> = {
    "{name}": encodeURIComponent(entry.name ?? ""),
    "{email}": encodeURIComponent(entry.email ?? ""),
    "{phone}": encodeURIComponent(entry.phone ?? ""),
    "{platform}": encodeURIComponent(entry.platform ?? "ios"),
  };

  let finalUrl = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    finalUrl = finalUrl.split(placeholder).join(value);
  }
  return finalUrl;
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [googleFormUrlTemplate, setGoogleFormUrlTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState<number[]>([]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/waitlist", { cache: "no-store" });
      const data = (await res.json()) as WaitlistResponse;

      if (!res.ok) {
        setError("Failed to load waitlist entries.");
        return;
      }

      setEntries(data.entries ?? []);
      setGoogleFormUrlTemplate(data.googleFormUrlTemplate ?? "");
    } catch {
      setError("Failed to load waitlist entries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pendingCount = useMemo(
    () => entries.filter((item) => item.added_to_google_form !== 1).length,
    [entries],
  );

  async function toggleGoogleFormStatus(entry: WaitlistEntry, nextValue: boolean) {
    setBusyIds((prev) => [...prev, entry.id]);

    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, addedToGoogleForm: nextValue }),
      });

      if (!res.ok) {
        return;
      }

      setEntries((prev) =>
        prev.map((item) =>
          item.id === entry.id
            ? {
                ...item,
                added_to_google_form: nextValue ? 1 : 0,
                google_form_added_at: nextValue ? new Date().toISOString() : null,
              }
            : item,
        ),
      );
    } finally {
      setBusyIds((prev) => prev.filter((id) => id !== entry.id));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>Waitlist</h1>
        <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
          iOS waitlist responses. Admins can review submissions and track which leads were added to Google Form.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8B949E" }}>Total</p>
          <p className="text-2xl font-black mt-1" style={{ color: "#E6EDF3" }}>{entries.length}</p>
        </div>
        <div className="rounded-xl border p-4" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8B949E" }}>Pending</p>
          <p className="text-2xl font-black mt-1" style={{ color: "#E6EDF3" }}>{pendingCount}</p>
        </div>
        <div className="rounded-xl border p-4" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8B949E" }}>Google Form Template</p>
          <p className="text-xs mt-2 break-all" style={{ color: googleFormUrlTemplate ? "#00F0FF" : "#8B949E" }}>
            {googleFormUrlTemplate || "Set in Admin Settings to enable prefill links."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #21262D" }}>
          <h2 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Submissions</h2>
          <button
            type="button"
            onClick={load}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ borderColor: "#30363D", color: "#8B949E" }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm" style={{ color: "#8B949E" }}>Loading waitlist entries...</div>
        ) : error ? (
          <div className="px-6 py-8 text-sm" style={{ color: "#FF6B6B" }}>{error}</div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-8 text-sm" style={{ color: "#8B949E" }}>No waitlist responses yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #21262D" }}>
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Submitted",
                    "Google Form",
                    "Actions",
                  ].map((header) => (
                    <th key={header} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#8B949E" }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const busy = busyIds.includes(entry.id);
                  const prefillUrl = buildGoogleFormUrl(googleFormUrlTemplate, entry);

                  return (
                    <tr
                      key={entry.id}
                      style={{ borderBottom: index < entries.length - 1 ? "1px solid #21262D" : "none" }}
                    >
                      <td className="px-6 py-3" style={{ color: "#E6EDF3" }}>{entry.name}</td>
                      <td className="px-6 py-3" style={{ color: "#8B949E" }}>{entry.email || "-"}</td>
                      <td className="px-6 py-3" style={{ color: "#8B949E" }}>{entry.phone || "-"}</td>
                      <td className="px-6 py-3" style={{ color: "#8B949E" }}>
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        {entry.added_to_google_form === 1 ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "#00F0FF1A", color: "#00F0FF" }}>
                            Added
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: "#FFB3471A", color: "#FFB347" }}>
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {prefillUrl ? (
                            <a
                              href={prefillUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                              style={{ borderColor: "#00F0FF55", color: "#00F0FF" }}
                            >
                              Open Google Form
                            </a>
                          ) : (
                            <span className="text-xs" style={{ color: "#8B949E" }}>
                              No template URL
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => toggleGoogleFormStatus(entry, entry.added_to_google_form !== 1)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-60"
                            style={{ borderColor: "#30363D", color: "#8B949E" }}
                          >
                            {entry.added_to_google_form === 1 ? "Mark Pending" : "Mark Added"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
