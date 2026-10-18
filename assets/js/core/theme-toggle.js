/**
 * Light/dark toggle shared by every page (landing, content pages and the app).
 * The choice is saved under "theme" and applied before paint by assets/js/app/theme.js.
 */

const root = document.documentElement;

export const isDark = () => root.classList.contains("dark-mode");

/** Flip the theme, remember it, and return true if dark mode is now on. */
export function toggleTheme() {
  const dark = root.classList.toggle("dark-mode");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    /* storage blocked: the theme still changes for this visit */
  }
  return dark;
}

/** Wire up a toggle button; keeps aria-pressed in step so screen readers announce the state. */
export function bindThemeToggle(button) {
  if (!button) return;
  const sync = () => button.setAttribute("aria-pressed", String(isDark()));
  sync();
  button.addEventListener("click", () => {
    toggleTheme();
    sync();
  });
}
