"use client";

import { ReactNode } from "react";

interface VisualBlockProps {
  id: string;
  label: string;
  selected: boolean;
  onSelect: (id: string) => void;
  children: ReactNode;
  editing?: boolean;
}

export function VisualBlock({ id, label, selected, onSelect, children, editing }: VisualBlockProps) {
  return (
    <div
      className="group relative transition-all"
      onMouseEnter={() => undefined}
    >
      {/* Highlight overlay when selected */}
      {selected && (
        <div
          className="pointer-events-none absolute -inset-1 rounded-xl border-2 transition-all"
          style={{ borderColor: "#00F0FF", backgroundColor: "#00F0FF08" }}
        />
      )}

      {/* Block label/toolbar */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between rounded-t-xl border-b px-3 py-2 opacity-0 transition-opacity ${
          selected ? "opacity-100" : "group-hover:opacity-100"
        }`}
        style={{
          backgroundColor: "#00F0FF",
          color: "#0D1117",
          borderColor: "#00F0FF",
        }}
      >
        <span className="text-xs font-bold uppercase tracking-[0.18em]">{label}</span>
        <button
          type="button"
          onClick={() => onSelect(id)}
          className="text-xs font-semibold opacity-70 hover:opacity-100"
        >
          Edit
        </button>
      </div>

      {/* Block content with padding for toolbar */}
      <div className={selected ? "rounded-xl" : ""}>
        {children}
      </div>
    </div>
  );
}

interface EditableSectionProps {
  sectionId: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export function EditableSection({
  sectionId,
  label,
  selected,
  onSelect,
  children,
}: EditableSectionProps) {
  return (
    <div
      className={`group relative rounded-2xl border p-6 transition-all cursor-pointer ${
        selected ? "ring-2" : "hover:border-opacity-75"
      }`}
      onClick={onSelect}
      style={
        selected
          ? {
              backgroundColor: "#00F0FF08",
              borderColor: "#00F0FF",
              boxShadow: "0 0 0 3px rgba(0, 240, 255, 0.1)",
            }
          : {
              backgroundColor: "#161B2244",
              borderColor: "#21262D",
            }
      }
    >
      {/* Hover indicator */}
      <div
        className={`absolute -inset-1 rounded-2xl border-2 transition-all pointer-events-none ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
        }`}
        style={{ borderColor: "#00F0FF" }}
      />

      {/* Label/Badge */}
      <div className="absolute top-3 right-3">
        <span
          className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{
            backgroundColor: selected ? "#00F0FF" : "#00F0FF44",
            color: selected ? "#0D1117" : "#00F0FF",
          }}
        >
          {label}
        </span>
      </div>

      {/* Content */}
      <div className={selected ? "rounded-lg p-1" : ""} style={selected ? { outlineOffset: "-4px", outline: "2px solid #00F0FF44" } : {}}>
        {children}
      </div>
    </div>
  );
}

export { VisualBlock as SelectableBlock };
