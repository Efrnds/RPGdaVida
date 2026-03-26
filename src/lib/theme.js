export const THEME_STORAGE_KEY = "rpg-theme-pref";

export function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(themePreference) {
  if (themePreference === "auto") return getSystemTheme();
  return themePreference === "dark" ? "dark" : "light";
}

export function applyThemePreference(themePreference) {
  if (typeof document === "undefined") return;

  const resolved = resolveTheme(themePreference);
  const root = document.documentElement;

  root.dataset.theme = resolved;
  root.dataset.themePreference = themePreference;
  root.style.colorScheme = resolved;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }
}
