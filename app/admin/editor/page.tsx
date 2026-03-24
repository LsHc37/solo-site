"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getDefaultLayout, type BuilderPageKey, type SiteBuilderSection } from "@/lib/site-builder";
import { BlockSelector, Inspector, Toolbar, EditableSection } from "@/components/site-builder";

type DeviceMode = "desktop" | "tablet" | "mobile";

interface BuilderPayload {
  settings: Record<string, string>;
  blocks: Record<string, string>;
  layouts: Record<BuilderPageKey, SiteBuilderSection[]>;
}

interface FieldConfig {
  key: string;
  label: string;
  multiline?: boolean;
}

const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "Retro Gigz",
  tagline: "Digital Independence.",
  primary_color: "#00F0FF",
  bg_color: "#0D1117",
  surface_color: "#161B22",
  text_color: "#E6EDF3",
  muted_color: "#8B949E",
  nav_account_label: "Account",
};

const PAGE_LABELS: Record<BuilderPageKey, string> = {
  home: "Home Page",
  solo: "Solo Landing Page",
};

const SECTION_FIELDS: Record<BuilderPageKey, Record<string, FieldConfig[]>> = {
  home: {
    hero: [
      { key: "home_hero_badge", label: "Badge" },
      { key: "home_hero_title_top", label: "Title line 1" },
      { key: "home_hero_title_accent", label: "Accent title line" },
      { key: "home_hero_subheadline", label: "Subheadline", multiline: true },
      { key: "home_hero_cta_label", label: "CTA label" },
      { key: "home_hero_cta_url", label: "CTA link" },
    ],
    privacy: [
      { key: "home_privacy_heading", label: "Section heading" },
      { key: "home_privacy_subheadline", label: "Section subheadline", multiline: true },
      { key: "home_privacy_pillar_1_title", label: "Pillar 1 title" },
      { key: "home_privacy_pillar_1_body", label: "Pillar 1 body", multiline: true },
      { key: "home_privacy_pillar_2_title", label: "Pillar 2 title" },
      { key: "home_privacy_pillar_2_body", label: "Pillar 2 body", multiline: true },
      { key: "home_privacy_pillar_3_title", label: "Pillar 3 title" },
      { key: "home_privacy_pillar_3_body", label: "Pillar 3 body", multiline: true },
    ],
    divisions: [
      { key: "home_divisions_heading", label: "Section heading" },
      { key: "home_division_1_title", label: "Card 1 title" },
      { key: "home_division_1_body", label: "Card 1 body", multiline: true },
      { key: "home_division_1_badge", label: "Card 1 badge" },
      { key: "home_division_1_url", label: "Card 1 link" },
      { key: "home_division_2_title", label: "Card 2 title" },
      { key: "home_division_2_body", label: "Card 2 body", multiline: true },
      { key: "home_division_2_badge", label: "Card 2 badge" },
      { key: "home_division_2_url", label: "Card 2 link" },
      { key: "home_division_3_title", label: "Card 3 title" },
      { key: "home_division_3_body", label: "Card 3 body", multiline: true },
      { key: "home_division_3_badge", label: "Card 3 badge" },
      { key: "home_division_3_url", label: "Card 3 link" },
    ],
  },
  solo: {
    hero: [
      { key: "solo_hero_title", label: "Hero title", multiline: true },
      { key: "solo_hero_subheadline", label: "Subheadline", multiline: true },
      { key: "solo_hero_cta_ios_label", label: "Primary CTA label" },
      { key: "solo_hero_cta_ios_url", label: "Primary CTA link" },
      { key: "solo_hero_cta_android_label", label: "Secondary CTA label" },
      { key: "solo_hero_cta_android_url", label: "Secondary CTA link" },
    ],
    features: [
      { key: "solo_features_heading", label: "Section heading" },
      { key: "solo_features_accent", label: "Accent heading line" },
      { key: "solo_feature_1_title", label: "Feature 1 title" },
      { key: "solo_feature_1_body", label: "Feature 1 body", multiline: true },
      { key: "solo_feature_2_title", label: "Feature 2 title" },
      { key: "solo_feature_2_body", label: "Feature 2 body", multiline: true },
      { key: "solo_feature_3_title", label: "Feature 3 title" },
      { key: "solo_feature_3_body", label: "Feature 3 body", multiline: true },
      { key: "solo_feature_4_title", label: "Feature 4 title" },
      { key: "solo_feature_4_body", label: "Feature 4 body", multiline: true },
      { key: "solo_feature_5_title", label: "Feature 5 title" },
      { key: "solo_feature_5_body", label: "Feature 5 body", multiline: true },
    ],
    privacy: [
      { key: "solo_privacy_badge", label: "Section badge" },
      { key: "solo_privacy_heading_top", label: "Heading line 1" },
      { key: "solo_privacy_heading_accent", label: "Heading accent line" },
      { key: "solo_privacy_card_1_title", label: "Privacy card 1 title" },
      { key: "solo_privacy_card_1_body", label: "Privacy card 1 body", multiline: true },
      { key: "solo_privacy_card_1_status", label: "Privacy card 1 status" },
      { key: "solo_privacy_card_2_title", label: "Privacy card 2 title" },
      { key: "solo_privacy_card_2_body", label: "Privacy card 2 body", multiline: true },
      { key: "solo_privacy_card_2_status", label: "Privacy card 2 status" },
      { key: "solo_privacy_card_3_title", label: "Privacy card 3 title" },
      { key: "solo_privacy_card_3_body", label: "Privacy card 3 body", multiline: true },
      { key: "solo_privacy_card_3_status", label: "Privacy card 3 status" },
    ],
  },
};

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
    className: "w-full rounded-xl border px-3 py-2.5 text-sm outline-none",
    style: { backgroundColor: "#0D1117", borderColor: "#21262D", color: "#E6EDF3" },
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold" style={{ color: "#8B949E" }}>
        {label}
      </span>
      {multiline ? (
        <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} {...sharedProps} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} {...sharedProps} />
      )}
    </label>
  );
}

function BuilderPreview({
  page,
  layouts,
  blocks,
  settings,
  device,
  selectedSectionType,
  onSelectSection,
}: {
  page: BuilderPageKey;
  layouts: Record<BuilderPageKey, SiteBuilderSection[]>;
  blocks: Record<string, string>;
  settings: Record<string, string>;
  device: DeviceMode;
  selectedSectionType?: string;
  onSelectSection?: (type: string) => void;
}) {
  const accent = settings.primary_color || "#00F0FF";
  const bg = settings.bg_color || "#0D1117";
  const surface = settings.surface_color || "#161B22";
  const text = settings.text_color || "#E6EDF3";
  const muted = settings.muted_color || "#8B949E";
  const siteName = settings.site_name || "Retro Gigz";
  const navLabel = settings.nav_account_label || "Account";

  function getBlock(key: string, fallback: string) {
    const value = blocks[key];
    return value && value.trim() ? value : fallback;
  }

  const widthClass = device === "desktop" ? "max-w-full" : device === "tablet" ? "max-w-3xl" : "max-w-sm";

  const homeSections: Record<string, React.ReactNode> = {
    hero: (
      <section className="px-5 py-8 text-center">
        <div className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ borderColor: `${accent}44`, color: accent }}>
          {getBlock("home_hero_badge", "Master Technology & Software Publisher")}
        </div>
        <h2 className="mt-5 text-4xl font-black leading-none" style={{ color: text }}>
          {getBlock("home_hero_title_top", "Digital")}
          <br />
          <span style={{ color: accent }}>{getBlock("home_hero_title_accent", settings.tagline || "Independence.")}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: muted }}>
          {getBlock("home_hero_subheadline", "A master publisher building privacy-first applications, independent games, and tactical apparel.")}
        </p>
        <div className="mt-5 inline-flex rounded-xl px-4 py-2 text-sm font-semibold" style={{ backgroundColor: accent, color: bg }}>
          {getBlock("home_hero_cta_label", "Explore Our Divisions")}
        </div>
      </section>
    ),
    privacy: (
      <section className="px-5 pb-8">
        <div className="rounded-3xl border p-6" style={{ backgroundColor: surface, borderColor: `${accent}22` }}>
          <h3 className="text-2xl font-black" style={{ color: text }}>
            {getBlock("home_privacy_heading", "Your Data. Your Device. Always.")}
          </h3>
          <p className="mt-3 text-sm" style={{ color: muted }}>
            {getBlock("home_privacy_subheadline", "Retro Gigz is committed to the absolute protection of user data.")}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="rounded-2xl border p-4" style={{ backgroundColor: bg, borderColor: "#21262D" }}>
                <p className="text-sm font-bold" style={{ color: text }}>
                  {getBlock(`home_privacy_pillar_${index}_title`, `Pillar ${index}`)}
                </p>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: muted }}>
                  {getBlock(`home_privacy_pillar_${index}_body`, "Update this privacy pillar in the builder.")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    divisions: (
      <section className="px-5 pb-8">
        <h3 className="text-center text-2xl font-black" style={{ color: text }}>
          {getBlock("home_divisions_heading", "Three divisions. One mission.")}
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="rounded-2xl border p-5" style={{ backgroundColor: surface, borderColor: "#21262D" }}>
              <p className="text-lg font-bold" style={{ color: text }}>
                {getBlock(`home_division_${index}_title`, `Division ${index}`)}
              </p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: muted }}>
                {getBlock(`home_division_${index}_body`, "Division description.")}
              </p>
              <div className="mt-4 inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: `${accent}33`, color: accent }}>
                {getBlock(`home_division_${index}_badge`, "Badge")}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
  };

  const soloSections: Record<string, React.ReactNode> = {
    hero: (
      <section className="grid gap-6 px-5 py-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-4xl font-black leading-tight" style={{ color: text }}>
            {getBlock("solo_hero_title", "100% Offline\n& Private").split("\n").map((part, index, all) => (
              <span key={index}>
                {part}
                {index < all.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: muted }}>
            {getBlock("solo_hero_subheadline", "The ultimate all-in-one life operating system.")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ backgroundColor: accent, color: bg }}>
              {getBlock("solo_hero_cta_ios_label", "Join iOS Waitlist")}
            </div>
            <div className="rounded-xl border px-4 py-2 text-sm font-semibold" style={{ borderColor: accent, color: accent }}>
              {getBlock("solo_hero_cta_android_label", "Join Android Waitlist")}
            </div>
          </div>
        </div>
        <div className="mx-auto h-72 w-44 rounded-[2.5rem] border" style={{ backgroundColor: surface, borderColor: "#30363D" }} />
      </section>
    ),
    features: (
      <section className="px-5 pb-8">
        <h3 className="text-center text-2xl font-black" style={{ color: text }}>
          {getBlock("solo_features_heading", "Everything you need to upgrade your life.")}
          <br />
          <span style={{ color: accent }}>{getBlock("solo_features_accent", "Zero internet required.")}</span>
        </h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="rounded-2xl border p-4" style={{ backgroundColor: surface, borderColor: "#21262D" }}>
              <p className="text-sm font-bold" style={{ color: text }}>
                {getBlock(`solo_feature_${index}_title`, `Feature ${index}`)}
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: muted }}>
                {getBlock(`solo_feature_${index}_body`, "Feature description.")}
              </p>
            </div>
          ))}
        </div>
      </section>
    ),
    privacy: (
      <section className="px-5 pb-8">
        <div className="rounded-3xl border p-6" style={{ backgroundColor: bg, borderColor: "#21262D" }}>
          <div className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ borderColor: `${accent}44`, color: accent }}>
            {getBlock("solo_privacy_badge", "End-to-End Private")}
          </div>
          <h3 className="mt-4 text-2xl font-black" style={{ color: text }}>
            {getBlock("solo_privacy_heading_top", "Your Data. Your Device.")}
            <br />
            <span style={{ color: accent }}>{getBlock("solo_privacy_heading_accent", "Your Business.")}</span>
          </h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="rounded-2xl border p-4" style={{ backgroundColor: surface, borderColor: "#21262D" }}>
                <p className="text-sm font-bold" style={{ color: text }}>
                  {getBlock(`solo_privacy_card_${index}_title`, `Privacy card ${index}`)}
                </p>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: muted }}>
                  {getBlock(`solo_privacy_card_${index}_body`, "Privacy description.")}
                </p>
                <p className="mt-3 text-[11px] font-mono" style={{ color: accent }}>
                  {getBlock(`solo_privacy_card_${index}_status`, `STATUS_${index}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  };

  const sectionMap = page === "home" ? homeSections : soloSections;

  return (
    <div className={`mx-auto w-full ${widthClass} transition-all duration-200`}>
      <div className="overflow-hidden rounded-[28px] border shadow-2xl" style={{ backgroundColor: bg, borderColor: "#21262D" }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "#21262D", color: text }}>
          <span className="text-sm font-black tracking-[0.2em]">{siteName.toUpperCase()}</span>
          <span className="rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: accent, color: accent }}>
            {navLabel}
          </span>
        </div>
        {(layouts[page] ?? []).filter((section) => section.visible).map((section) => (
          <EditableSection
            key={section.id}
            label={section.label}
            selected={selectedSectionType === section.type}
            onSelect={() => onSelectSection?.(section.type)}
          >
            {sectionMap[section.type]}
          </EditableSection>
        ))}
      </div>
    </div>
  );
}

// Undo/Redo History management
interface HistoryState {
  settings: Record<string, string>;
  blocks: Record<string, string>;
  layouts: Record<BuilderPageKey, SiteBuilderSection[]>;
}

export default function EditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [activePage, setActivePage] = useState<BuilderPageKey>("home");
  const [selectedSectionType, setSelectedSectionType] = useState<string>("hero");
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [layouts, setLayouts] = useState<Record<BuilderPageKey, SiteBuilderSection[]>>({
    home: getDefaultLayout("home"),
    solo: getDefaultLayout("solo"),
  });

  // Undo/Redo stack
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs for stable history access — avoids stale closures in debounced/event callbacks
  const currentSettingsRef = useRef(settings);
  const currentBlocksRef = useRef(blocks);
  const currentLayoutsRef = useRef(layouts);
  const historyIndexRef = useRef(-1);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { currentSettingsRef.current = settings; }, [settings]);
  useEffect(() => { currentBlocksRef.current = blocks; }, [blocks]);
  useEffect(() => { currentLayoutsRef.current = layouts; }, [layouts]);
  useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);

  // Debounced snapshot: groups rapid edits into a single undo step
  function scheduleHistorySnapshot() {
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => {
      const idx = historyIndexRef.current;
      const snapshot: HistoryState = {
        settings: { ...currentSettingsRef.current },
        blocks: { ...currentBlocksRef.current },
        layouts: { ...currentLayoutsRef.current },
      };
      setHistory((prev) => [...prev.slice(0, idx + 1), snapshot]);
      const nextIdx = idx + 1;
      setHistoryIndex(nextIdx);
      historyIndexRef.current = nextIdx;
    }, 500);
  }

  function undo() {
    if (historyIndex > 0) {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setSettings(state.settings);
      setBlocks(state.blocks);
      setLayouts(state.layouts);
      setHistoryIndex(newIndex);
      historyIndexRef.current = newIndex;
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setSettings(state.settings);
      setBlocks(state.blocks);
      setLayouts(state.layouts);
      setHistoryIndex(newIndex);
      historyIndexRef.current = newIndex;
    }
  }

  // Keyboard shortcuts — registered once, always call latest undo/redo via refs
  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  useEffect(() => { undoRef.current = undo; });
  useEffect(() => { redoRef.current = redo; });
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undoRef.current();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redoRef.current();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetch("/api/admin/site-builder")
      .then((response) => response.json())
      .then((data: BuilderPayload) => {
        const newSettings = { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) };
        const newBlocks = data.blocks ?? {};
        const newLayouts: Record<BuilderPageKey, SiteBuilderSection[]> = {
          home: data.layouts?.home ?? getDefaultLayout("home"),
          solo: data.layouts?.solo ?? getDefaultLayout("solo"),
        };
        setSettings(newSettings);
        setBlocks(newBlocks);
        setLayouts(newLayouts);
        
        // Initialize history
        const initialState: HistoryState = { settings: newSettings, blocks: newBlocks, layouts: newLayouts };
        setHistory([initialState]);
        setHistoryIndex(0);
      })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const activeLayout = layouts[activePage] ?? getDefaultLayout(activePage);
  const selectedSection = activeLayout.find((section) => section.type === selectedSectionType) ?? activeLayout[0];
  const selectedFields = selectedSection ? SECTION_FIELDS[activePage][selectedSection.type] ?? [] : [];

  useEffect(() => {
    if (!selectedSection && activeLayout[0]) {
      setSelectedSectionType(activeLayout[0].type);
    }
  }, [activeLayout, selectedSection]);

  function updateSetting(key: string, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
    setIsDirty(true);
    scheduleHistorySnapshot();
  }

  function updateBlock(key: string, value: string) {
    setBlocks((current) => ({ ...current, [key]: value }));
    setIsDirty(true);
    scheduleHistorySnapshot();
  }

  function toggleSectionVisibility(type: string) {
    setLayouts((current) => ({
      ...current,
      [activePage]: current[activePage].map((section) =>
        section.type === type ? { ...section, visible: !section.visible } : section,
      ),
    }));
    setIsDirty(true);
    scheduleHistorySnapshot();
  }

  function reorderSection(fromId: string, toId: string) {
    setLayouts((current) => {
      const sections = [...(current[activePage] ?? [])];
      const fromIndex = sections.findIndex((s) => s.id === fromId);
      const toIndex = sections.findIndex((s) => s.id === toId);
      if (fromIndex === -1 || toIndex === -1) return current;
      [sections[fromIndex], sections[toIndex]] = [sections[toIndex], sections[fromIndex]];
      return { ...current, [activePage]: sections };
    });
    setIsDirty(true);
    scheduleHistorySnapshot();
  }

  async function saveBuilder() {
    setSaving(true);
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    const response = await fetch("/api/admin/site-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, blocks, layouts }),
    });

    setSaving(false);
    if (response.ok) setIsDirty(false);
    showToast(response.ok ? "✓ Changes published to production" : "Failed to save builder changes.", response.ok);
  }

  if (loading) {
    return <div className="h-[70vh] rounded-3xl animate-pulse" style={{ backgroundColor: "#161B22" }} />;
  }

  return (
    <div className="min-h-screen flex flex-col gap-4 p-4" style={{ backgroundColor: "#0D1117" }}>
      {/* Toast notifications */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-4"
          style={{
            backgroundColor: toast.ok ? "#00F0FF15" : "#FF000015",
            border: `1px solid ${toast.ok ? "#00F0FF44" : "#FF000044"}`,
            color: toast.ok ? "#00F0FF" : "#FF6B6B",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Toolbar with controls */}
      <Toolbar
        pages={[
          { id: "home", label: "Home Page" },
          { id: "solo", label: "Solo Landing" },
        ]}
        currentPage={activePage}
        onPageChange={(page) => {
          setActivePage(page as BuilderPageKey);
          setSelectedSectionType((layouts[page as BuilderPageKey] ?? getDefaultLayout(page as BuilderPageKey))[0]?.type ?? "hero");
        }}
        device={device}
        onDeviceChange={setDevice}
        onSave={saveBuilder}
        isSaving={saving}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        isDirty={isDirty}
      />

      {/* Main editor area */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[250px_1fr_320px]">
        {/* Block list panel */}
        <BlockSelector
          blocks={activeLayout.map((section, index) => ({
            id: section.id,
            label: section.label,
            type: section.type,
            visible: section.visible,
          }))}
          selectedId={selectedSection?.id ?? null}
          onSelect={(id) => {
            const section = activeLayout.find((s) => s.id === id);
            if (section) setSelectedSectionType(section.type);
          }}
          onToggleVisibility={toggleSectionVisibility}
          onReorder={reorderSection}
        />

        {/* Canvas/Preview - center column */}
        <div className="rounded-3xl border p-6 overflow-y-auto max-h-[calc(100vh-200px)]" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#E6EDF3" }}>
                Live Preview
              </h2>
              <p className="text-xs mt-1" style={{ color: "#8B949E" }}>
                Click any block to edit it
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#00F0FF12", color: "#00F0FF" }}>
              {device}
            </div>
          </div>

          <div
            className="mx-auto transition-all duration-200 rounded-2xl border shadow-lg overflow-hidden"
            style={{
              maxWidth:
                device === "mobile"
                  ? "375px"
                  : device === "tablet"
                    ? "768px"
                    : "100%",
              backgroundColor: settings.bg_color || "#0D1117",
              borderColor: "#21262D",
            }}
          >
            <BuilderPreview 
              page={activePage}
              layouts={layouts}
              blocks={blocks}
              settings={settings}
              device={device}
              selectedSectionType={selectedSectionType}
              onSelectSection={(type) => setSelectedSectionType(type)}
            />
          </div>
        </div>

        {/* Inspector panel - right side */}
        <Inspector
          title="Block Inspector"
          selectedLabel={selectedSection?.label}
          fields={selectedFields}
          values={blocks}
          onFieldChange={updateBlock}
          themeColors={{
            primary: settings.primary_color || "#00F0FF",
            bg: settings.bg_color || "#0D1117",
            surface: settings.surface_color || "#161B22",
            text: settings.text_color || "#E6EDF3",
            muted: settings.muted_color || "#8B949E",
          }}
          onThemeColorChange={updateSetting}
        />
      </div>
    </div>
  );
}
