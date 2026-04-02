export type Theme = "dark" | "light";

export const STORAGE_KEY = "retro-gigz-theme";

export function getInitialTheme(): Theme {
  return "dark";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", "dark");
  localStorage.setItem(STORAGE_KEY, "dark");
}

export function getTheme(): Theme {
  return "dark";
}
