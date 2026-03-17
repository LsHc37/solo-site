"use client";

import { ReactNode } from "react";

interface BlockItem {
  id: string;
  label: string;
  type: string;
  visible: boolean;
  canDelete?: boolean;
}

interface BlockSelectorProps {
  blocks: BlockItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (type: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onDelete?: (type: string) => void;
}

export function BlockSelector({
  blocks,
  selectedId,
  onSelect,
  onToggleVisibility,
  onReorder,
  onDelete,
}: BlockSelectorProps) {
  const stats = {
    visible: blocks.filter((b) => b.visible).length,
    hidden: blocks.filter((b) => !b.visible).length,
  };

  return (
    <div className="rounded-3xl border p-5 overflow-y-auto max-h-[calc(100vh-220px)]" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "#E6EDF3" }}>
            Page Blocks
          </h2>
          <p className="mt-1 text-xs" style={{ color: "#8B949E" }}>
            Drag to reorder. Hide blocks without losing content.
          </p>
        </div>
        <div className="rounded-xl border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#21262D", color: "#8B949E" }}>
          {stats.visible} / {blocks.length}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {blocks.map((block, index) => (
          <BlockItem
            key={block.id}
            block={block}
            selected={selectedId === block.id}
            onSelect={onSelect}
            onToggleVisibility={onToggleVisibility}
            onMoveUp={() => { if (index > 0) onReorder(block.id, blocks[index - 1].id); }}
            onMoveDown={() => { if (index < blocks.length - 1) onReorder(block.id, blocks[index + 1].id); }}
            onDelete={onDelete}
            index={index}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function BlockItem({
  block,
  selected,
  onSelect,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDelete,
  index,
  isFirst,
  isLast,
}: {
  block: BlockItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleVisibility: (type: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete?: (type: string) => void;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className="group rounded-2xl border p-4 transition-all"
      style={selected ? { backgroundColor: "#0D1117", borderColor: "#00F0FF44" } : { backgroundColor: "#0D1117", borderColor: "#21262D" }}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(block.id)}
          className="flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
              style={{ backgroundColor: "#00F0FF15", color: "#00F0FF" }}
            >
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: selected ? "#00F0FF" : "#E6EDF3" }}>
                {block.label}
              </p>
              <p className="text-xs" style={{ color: "#8B949E" }}>
                {block.type}
              </p>
            </div>
          </div>
        </button>

        <div className={`flex items-center gap-1 transition-opacity ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="rounded-lg border px-2 py-1 text-xs font-semibold disabled:opacity-30"
            style={{ borderColor: "#21262D", backgroundColor: "#0D1117", color: "#8B949E" }}
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="rounded-lg border px-2 py-1 text-xs font-semibold disabled:opacity-30"
            style={{ borderColor: "#21262D", backgroundColor: "#0D1117", color: "#8B949E" }}
            title="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onToggleVisibility(block.type)}
            className="rounded-lg border px-2 py-1 text-xs font-semibold"
            style={{
              borderColor: "#21262D",
              color: block.visible ? "#00F0FF" : "#8B949E",
              backgroundColor: block.visible ? "#00F0FF12" : "#00000012",
            }}
            title={block.visible ? "Hide block" : "Show block"}
          >
            {block.visible ? "Hide" : "Show"}
          </button>

          {onDelete && block.canDelete && (
            <button
              type="button"
              onClick={() => onDelete(block.type)}
              className="rounded-lg border px-2 py-1 text-xs font-semibold"
              style={{ borderColor: "#FF6B6B44", color: "#FF6B6B" }}
              title="Delete block"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
