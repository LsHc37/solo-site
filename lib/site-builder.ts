export type BuilderPageKey = "home" | "solo";

export interface SiteBuilderSection {
  id: string;
  type: string;
  label: string;
  visible: boolean;
}

const DEFAULT_LAYOUTS: Record<BuilderPageKey, SiteBuilderSection[]> = {
  home: [
    { id: "home-hero", type: "hero", label: "Hero", visible: true },
    { id: "home-privacy", type: "privacy", label: "Privacy Promise", visible: true },
    { id: "home-divisions", type: "divisions", label: "Divisions", visible: true },
  ],
  solo: [
    { id: "solo-hero", type: "hero", label: "Hero", visible: true },
    { id: "solo-features", type: "features", label: "Feature Matrix", visible: true },
    { id: "solo-privacy", type: "privacy", label: "Privacy Promise", visible: true },
  ],
};

function isBuilderPageKey(value: string): value is BuilderPageKey {
  return value === "home" || value === "solo";
}

export function getLayoutSettingKey(page: BuilderPageKey) {
  return `page_layout_${page}`;
}

export function getDefaultLayout(page: BuilderPageKey) {
  return DEFAULT_LAYOUTS[page].map((section) => ({ ...section }));
}

export function normalizeLayout(page: BuilderPageKey, raw: unknown) {
  const defaults = getDefaultLayout(page);
  const allowedTypes = new Set(defaults.map((section) => section.type));

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  if (!Array.isArray(parsed)) {
    return defaults;
  }

  const normalized: SiteBuilderSection[] = [];
  const seenTypes = new Set<string>();

  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;

    const candidate = item as Partial<SiteBuilderSection>;
    if (typeof candidate.type !== "string" || !allowedTypes.has(candidate.type) || seenTypes.has(candidate.type)) {
      continue;
    }

    const fallback = defaults.find((section) => section.type === candidate.type)!;
    normalized.push({
      id: typeof candidate.id === "string" && candidate.id ? candidate.id : fallback.id,
      type: candidate.type,
      label: typeof candidate.label === "string" && candidate.label ? candidate.label : fallback.label,
      visible: candidate.visible !== false,
    });
    seenTypes.add(candidate.type);
  }

  for (const section of defaults) {
    if (!seenTypes.has(section.type)) {
      normalized.push(section);
    }
  }

  return normalized;
}

export function parsePageLayouts(settings: Record<string, string>) {
  return {
    home: normalizeLayout("home", settings[getLayoutSettingKey("home")]),
    solo: normalizeLayout("solo", settings[getLayoutSettingKey("solo")]),
  } satisfies Record<BuilderPageKey, SiteBuilderSection[]>;
}

export function serializePageLayouts(layouts: Partial<Record<BuilderPageKey, SiteBuilderSection[]>>) {
  const entries: Array<[string, string]> = [];

  for (const [page, layout] of Object.entries(layouts)) {
    if (!isBuilderPageKey(page)) continue;
    entries.push([getLayoutSettingKey(page), JSON.stringify(normalizeLayout(page, layout))]);
  }

  return Object.fromEntries(entries);
}