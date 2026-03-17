"use client";

import { useState } from "react";

interface FieldConfig {
  key: string;
  label: string;
  multiline?: boolean;
}

interface InspectorProps {
  title: string;
  selectedLabel?: string;
  fields: FieldConfig[];
  values: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  themeColors?: {
    primary: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
  };
  onThemeColorChange?: (key: string, value: string) => void;
}

export function Inspector({
  title,
  selectedLabel,
  fields,
  values,
  onFieldChange,
  themeColors,
  onThemeColorChange,
}: InspectorProps) {
  return (
    <div className="rounded-3xl border p-5 overflow-y-auto max-h-[calc(100vh-220px)]" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
      <div className="flex items-center justify-between gap-3 sticky top-0 bg-[#161B22] pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "#E6EDF3" }}>
            {title}
          </h2>
          <p className="mt-1 text-xs" style={{ color: "#8B949E" }}>
            Edit selected content
          </p>
        </div>
        {selectedLabel && (
          <span className="rounded-xl border px-3 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ borderColor: "#21262D", color: "#00F0FF" }}>
            {selectedLabel}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-6">
        {/* Content Fields */}
        {fields.length > 0 && (
          <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0D1117", borderColor: "#21262D" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#8B949E" }}>
              Content
            </p>
            <div className="mt-4 grid gap-3">
              {fields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  value={values[field.key] ?? ""}
                  multiline={field.multiline}
                  onChange={(value) => onFieldChange(field.key, value)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Theme Colors */}
        {themeColors && onThemeColorChange && (
          <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0D1117", borderColor: "#21262D" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: "#8B949E" }}>
              Theme
            </p>
            <div className="grid gap-3">
              {Object.entries(themeColors).map(([key, value]) => (
                <ColorField
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value}
                  onChange={(newValue) => onThemeColorChange(key, newValue)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const sharedProps = {
    className: "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-1 focus:ring-[#00F0FF44]",
    style: { backgroundColor: "#0D1117", borderColor: "#21262D", color: "#E6EDF3" },
  };

  // AI Auto-Write button for Text Block
  const [aiLoading, setAiLoading] = useState(false);
  const isTextField = label === "Text" || label === "text";

  async function handleAutoWrite() {
    setAiLoading(true);
    try {
      const { askLocalAI } = await import("../../lib/askLocalAI");
      const aiResult = await askLocalAI(`Make this sound more professional and exciting: ${value}`);
      // If AI returns an object with 'text', use it, else use the whole result
      const newText = typeof aiResult === "string" ? aiResult : aiResult.text || JSON.stringify(aiResult);
      onChange(newText);
    } catch (err: any) {
      alert("AI error: " + (err?.message || "Unknown error"));
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold flex items-center gap-2" style={{ color: "#8B949E" }}>
        {label}
        {isTextField && (
          <button
            type="button"
            className="ml-2 px-2 py-1 rounded bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-50"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            onClick={handleAutoWrite}
            disabled={aiLoading}
          >
            <span role="img" aria-label="magic">✨</span> Auto-Write
            {aiLoading && (
              <svg className="animate-spin h-4 w-4 ml-1 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
          </button>
        )}
      </span>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} {...sharedProps} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} {...sharedProps} />
      )}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "#8B949E" }}>
          {label}
        </span>
        <div
          className="h-6 w-6 rounded border"
          style={{ backgroundColor: value, borderColor: "#21262D" }}
        />
      </div>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 cursor-pointer rounded border"
          style={{ borderColor: "#21262D" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border px-2 py-1 text-xs font-mono"
          style={{ backgroundColor: "#161B22", borderColor: "#21262D", color: "#E6EDF3" }}
          placeholder="#000000"
        />
      </div>
    </label>
  );
}
