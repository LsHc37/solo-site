export interface KeyboardShortcut {
  keys: string[];
  description: string;
  handler?: () => void | Promise<void>;
  global?: boolean; // If true, works on all pages
  page?: string;    // If specified, only works on specific page
}

export const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ["?"],
    description: "Show keyboard shortcuts",
    global: true,
  },
  {
    keys: ["Escape"],
    description: "Close modals and dialogs",
    global: true,
  },
  {
    keys: ["Ctrl", "K"],
    description: "Quick search (coming soon)",
    global: true,
  },
  {
    keys: ["Ctrl", "L"],
    description: "Focus navigation",
    global: true,
  },
  {
    keys: ["Ctrl", "/"],
    description: "Toggle theme",
    global: true,
  },
];

export const ADMIN_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ["Ctrl", "S"],
    description: "Save current form",
    page: "admin",
  },
  {
    keys: ["Ctrl", "N"],
    description: "Create new item",
    page: "admin",
  },
  {
    keys: ["Delete"],
    description: "Delete selected item",
    page: "admin",
  },
  {
    keys: ["Ctrl", "H"],
    description: "Go to admin home",
    page: "admin",
  },
  {
    keys: ["G", "E"],
    description: "Go to employees",
    page: "admin",
  },
  {
    keys: ["G", "F"],
    description: "Go to files",
    page: "admin",
  },
  {
    keys: ["G", "S"],
    description: "Go to settings",
    page: "admin",
  },
];

export function formatShortcut(keys: string[]): string {
  return keys
    .map((key) => {
      const simplified = key
        .replace("Control", "Ctrl")
        .replace("Meta", "⌘")
        .replace("Shift", "⇧")
        .replace("Alt", "⌥");
      return simplified;
    })
    .join(" + ");
}

export function shortcutMatches(event: KeyboardEvent, shortcut: string[]): boolean {
  const keysPressed = new Set<string>();

  if (event.ctrlKey) keysPressed.add("Ctrl");
  if (event.metaKey) keysPressed.add("Meta");
  if (event.shiftKey) keysPressed.add("Shift");
  if (event.altKey) keysPressed.add("Alt");

  const key = event.key.toUpperCase();
  if (!["CONTROL", "META", "SHIFT", "ALT"].includes(key)) {
    keysPressed.add(key);
  }

  // For single key combinations
  if (shortcut.length === 1) {
    return event.key.toLowerCase() === shortcut[0].toLowerCase() &&
      !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
  }

  // For multi-key combinations
  if (keysPressed.size !== shortcut.length) return false;

  for (const expectedKey of shortcut) {
    if (!keysPressed.has(expectedKey) && !keysPressed.has(expectedKey.toUpperCase())) {
      return false;
    }
  }

  return true;
}
