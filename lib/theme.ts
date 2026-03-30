export type Theme = "dark" | "light";

export const STORAGE_KEY = "retro-gigz-theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  // Check system preference
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
}
