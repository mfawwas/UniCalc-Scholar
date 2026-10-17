/**
 * Registers the service worker (sw.js at the site root) so the app works offline after a first visit.
 * Browsers only allow service workers on https:// pages and on localhost; elsewhere this does nothing.
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
