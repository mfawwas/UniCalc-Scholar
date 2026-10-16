/**
 * Applies the saved theme before the page paints, so dark-mode users don't see a white flash.
 * Load as a normal (blocking) script in <head>. The toggle itself lives in shell.js.
 * Uses the saved choice if there is one, otherwise the device's light/dark setting.
 */
(function () {
  try {
    var saved = localStorage.getItem("theme");
    var dark = saved
      ? saved === "dark"
      : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark-mode");
  } catch (e) {
    /* storage blocked: stay on the light theme */
  }
})();
