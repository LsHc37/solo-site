"use client";

import { useEffect, useState, useCallback } from "react";

interface Settings {
  site_name: string;
  tagline: string;
  primary_color: string;
  bg_color: string;
  maintenance_mode: string;
  announcement_active: string;
  announcement_text: string;
  announcement_color: string;
  meta_description: string;
  contact_email: string;
  [key: string]: string;
}

const DEFAULT: Settings = {
  site_name: "",
  tagline: "",
  primary_color: "#00F0FF",
  bg_color: "#0D1117",
  maintenance_mode: "false",
  announcement_active: "false",
  announcement_text: "",
  announcement_color: "#00F0FF",
  meta_description: "",
  contact_email: "",
};

function FieldRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 py-4" style={{ borderBottom: "1px solid #21262D" }}>
      <div className="sm:w-52 flex-shrink-0">
        <p className="text-sm font-semibold" style={{ color: "#E6EDF3" }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: "#8B949E" }}>{description}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: { settings: Settings }) => {
        setSettings({ ...DEFAULT, ...d.settings });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function set(key: keyof Settings, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      showToast("Settings saved successfully");
    } else {
      showToast("Failed to save settings", false);
    }
    setSaving(false);
  }

  const inputStyle = {
    backgroundColor: "#0D1117",
    borderColor: "#21262D",
    color: "#E6EDF3",
  } as React.CSSProperties;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>Settings</h1>
        <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: "#161B22" }} />
      </div>
    );
  }

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

      <div>
        <h1 className="text-3xl font-black" style={{ color: "#E6EDF3" }}>Site Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#8B949E" }}>
          Configure global site behavior, appearance, and metadata.
        </p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-6">

        {/* ── General ─── */}
        <section className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #21262D" }}>
            <h2 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>General</h2>
          </div>
          <div className="px-6">
            <FieldRow label="Site Name" description="Displayed in the browser tab and nav.">
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => set("site_name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputStyle}
              />
            </FieldRow>
            <FieldRow label="Tagline" description="Hero headline / main slogan.">
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputStyle}
              />
            </FieldRow>
            <FieldRow label="Meta Description" description="Used for SEO and social sharing previews.">
              <textarea
                value={settings.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-y"
                style={inputStyle}
              />
            </FieldRow>
            <FieldRow label="Contact Email" description="Support & contact address.">
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => set("contact_email", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputStyle}
                placeholder="hello@example.com"
              />
            </FieldRow>
          </div>
        </section>

        {/* ── Appearance ─── */}
        <section className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #21262D" }}>
            <h2 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Appearance</h2>
          </div>
          <div className="px-6">
            <FieldRow label="Accent Color" description="Primary brand color used throughout the site.">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                  style={{ borderColor: "#21262D", padding: "2px", backgroundColor: "#0D1117" }}
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="px-3 py-2.5 rounded-lg border text-sm outline-none font-mono w-32"
                  style={inputStyle}
                  maxLength={7}
                />
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ backgroundColor: settings.primary_color, border: "1px solid #21262D" }}
                />
              </div>
            </FieldRow>
            <FieldRow label="Background Color" description="Main site background color.">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.bg_color}
                  onChange={(e) => set("bg_color", e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                  style={{ borderColor: "#21262D", padding: "2px", backgroundColor: "#0D1117" }}
                />
                <input
                  type="text"
                  value={settings.bg_color}
                  onChange={(e) => set("bg_color", e.target.value)}
                  className="px-3 py-2.5 rounded-lg border text-sm outline-none font-mono w-32"
                  style={inputStyle}
                  maxLength={7}
                />
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ backgroundColor: settings.bg_color, border: "1px solid #21262D" }}
                />
              </div>
            </FieldRow>
          </div>
        </section>

        {/* ── Announcement Banner ─── */}
        <section className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #21262D" }}>
            <h2 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Announcement Banner</h2>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                className="relative w-10 h-5 rounded-full transition-all duration-200"
                style={{ backgroundColor: settings.announcement_active === "true" ? "#00F0FF" : "#21262D" }}
                onClick={() =>
                  set("announcement_active", settings.announcement_active === "true" ? "false" : "true")
                }
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: "#E6EDF3",
                    left: settings.announcement_active === "true" ? "calc(100% - 1.25rem)" : "2px",
                  }}
                />
              </div>
              <span className="text-xs font-semibold" style={{ color: "#8B949E" }}>
                {settings.announcement_active === "true" ? "Active" : "Inactive"}
              </span>
            </label>
          </div>

          {/* Preview */}
          {settings.announcement_active === "true" && settings.announcement_text && (
            <div
              className="mx-6 mt-4 rounded-xl px-4 py-3 text-sm font-semibold text-center"
              style={{ backgroundColor: settings.announcement_color + "22", color: settings.announcement_color, border: `1px solid ${settings.announcement_color}44` }}
            >
              {settings.announcement_text}
            </div>
          )}

          <div className="px-6">
            <FieldRow label="Message" description="Text shown in the announcement banner.">
              <input
                type="text"
                value={settings.announcement_text}
                onChange={(e) => set("announcement_text", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputStyle}
                placeholder="New product launch — check it out!"
              />
            </FieldRow>
            <FieldRow label="Banner Color" description="Color of the announcement banner.">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.announcement_color}
                  onChange={(e) => set("announcement_color", e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                  style={{ borderColor: "#21262D", padding: "2px", backgroundColor: "#0D1117" }}
                />
                <input
                  type="text"
                  value={settings.announcement_color}
                  onChange={(e) => set("announcement_color", e.target.value)}
                  className="px-3 py-2.5 rounded-lg border text-sm outline-none font-mono w-32"
                  style={inputStyle}
                  maxLength={7}
                />
              </div>
            </FieldRow>
          </div>
        </section>

        {/* ── Maintenance Mode ─── */}
        <section className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Maintenance Mode</h2>
              <p className="text-xs mt-0.5" style={{ color: "#8B949E" }}>
                When active, visitors see a maintenance page. Admin routes remain accessible.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                className="relative w-10 h-5 rounded-full transition-all duration-200"
                style={{ backgroundColor: settings.maintenance_mode === "true" ? "#FF6B35" : "#21262D" }}
                onClick={() =>
                  set("maintenance_mode", settings.maintenance_mode === "true" ? "false" : "true")
                }
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: "#E6EDF3",
                    left: settings.maintenance_mode === "true" ? "calc(100% - 1.25rem)" : "2px",
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: settings.maintenance_mode === "true" ? "#FF6B35" : "#8B949E" }}
              >
                {settings.maintenance_mode === "true" ? "Maintenance ON" : "Off"}
              </span>
            </label>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150"
            style={{ backgroundColor: "#00F0FF", color: "#0D1117" }}
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
          <button
            type="button"
            onClick={load}
            className="px-6 py-3 rounded-xl text-sm font-medium border transition-all duration-150"
            style={{ borderColor: "#21262D", color: "#8B949E" }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
