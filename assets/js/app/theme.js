/**
 * Runs in <head> before the page paints, so there is no white flash and no layout jump.
 *  - Applies the saved theme (or the device's light/dark setting if the user never chose).
 *  - Marks the page as script-enabled (.js) so scroll animations only hide things when they can reveal them.
 * The toggle button itself is wired up in core/theme-toggle.js.
 */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  try {
    var saved = localStorage.getItem("theme");
    var dark = saved
      ? saved === "dark"
      : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) root.classList.add("dark-mode");
  } catch (e) {
    /* storage blocked: stay on the light theme */
  }
})();