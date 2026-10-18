/**
 * Behaviour for the plain pages (privacy, terms, contact, 404): theme toggle and offline support.
 * Loaded as an ES module: <script type="module" src="assets/js/pages/simple.js">
 */

import { bindThemeToggle } from "../core/theme-toggle.js";
import { registerServiceWorker } from "../core/pwa.js";

bindThemeToggle(document.getElementById("theme-toggle"));
registerServiceWorker();
