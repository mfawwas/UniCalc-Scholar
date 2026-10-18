/**
 * Landing page behaviour: navbar shadow on scroll, reveal-on-scroll, theme toggle, offline support.
 * Loaded as an ES module: <script type="module" src="assets/js/pages/index.js">
 */

import { registerServiceWorker } from "../core/pwa.js";
import { bindThemeToggle } from "../core/theme-toggle.js";

const nav = document.querySelector(".navbar");
const onScroll = () => nav.classList.toggle("navbar-scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Each element fades in once, the first time it scrolls into view.
const revealables = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealables.forEach((el) => el.classList.add("active"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealables.forEach((el) => observer.observe(el));
}

bindThemeToggle(document.getElementById("theme-toggle"));
registerServiceWorker();