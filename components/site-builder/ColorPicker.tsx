"use client";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPreview?: boolean;
}

const PRESET_COLORS = [
  "#00F0FF", // Cyan
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#FFFFFF", // White
  "#000000", // Black
];

export function ColorPicker({ label, value, onChange, showPreview = true }: ColorPickerProps) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#8B949E" }}>
          {label}
        </span>
        {showPreview && (
          <div
            className="h-6 w-6 rounded border"
            style={{ backgroundColor: value, borderColor: "#21262D" }}
            title={value}
          />
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="relative h-8 rounded-lg border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: value === color ? "#00F0FF" : "transparent",
            }}
            title={color}
          >
            {value === color && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="rounded-lg border px-3 py-2 text-xs font-mono"
        style={{ backgroundColor: "#0D1117", borderColor: "#21262D", color: "#E6EDF3" }}
      />
    </label>
  );
}
