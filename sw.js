/**
 * UniCalc service worker: makes the app open offline after a first visit.
 *
 *  - Our own files: network first (you always get the latest when online), falling back to the
 *    saved copy when offline. Pages that were never saved fall back to the home page.
 *  - Icon and PDF libraries from the CDNs: saved the first time they load, then served from the
 *    saved copy (their URLs are version-pinned, so they never go stale).
 *  - Only GET requests are handled. User data lives in localStorage and is never touched here.
 *
 * Bump CACHE_VERSION when files are added or removed, so old copies are cleaned up.
 */

const CACHE_VERSION = "v4";
const CACHE = `unicalc-${CACHE_VERSION}`;
const CDN_HOSTS = ["unpkg.com", "cdnjs.cloudflare.com"];

const PRECACHE = [
  "/",
  "/index.html",
  "/contact.html",
  "/privacy.html",
  "/terms.html",
  "/404.html",
  "/manifest.webmanifest",
  "/pages/academic-records.html",
  "/pages/cgpa-calculator.html",
  "/pages/dashboard.html",
  "/pages/transcripts.html",
  "/assets/css/landing.css",
  "/assets/css/app.css",
  "/assets/css/simple.css",
  "/assets/js/app/shell.js",
  "/assets/js/app/theme.js",
  "/assets/js/pages/index.js",
  "/assets/js/pages/cgpa-calculator.js",
  "/assets/js/pages/dashboard.js",
  "/assets/js/pages/academic-records.js",
  "/assets/js/pages/transcripts.js",
  "/assets/js/pages/simple.js",
  "/assets/js/core/calc.js",
  "/assets/js/core/charts.js",
  "/assets/js/core/feedback-nudge.js",
  "/assets/js/core/feedback.js",
  "/assets/js/core/html.js",
  "/assets/js/core/pwa.js",
  "/assets/js/core/storage.js",
  "/assets/js/core/theme-toggle.js",
  "/assets/js/core/transcript-pdf.js",
  "/assets/js/core/transcript.js",
  "/assets/js/core/ui.js",
  "/assets/icons/favicon.svg",
  "/assets/icons/favicon-32.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // One missing file must not stop the whole install, so add them individually.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" }))));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith("unicalc-") && n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

async function networkFirst(event, request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) event.waitUntil(cache.put(request, response.clone()));
    return response;
  } catch {
    const saved = await cache.match(request, { ignoreSearch: true });
    if (saved) return saved;
    if (request.mode === "navigate") {
      const home = await cache.match("/index.html");
      if (home) return home;
    }
    return Response.error();
  }
}

async function cacheFirst(event, request) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request);
  if (saved) return saved;
  const response = await fetch(request);
  if (response && (response.ok || response.type === "opaque")) event.waitUntil(cache.put(request, response.clone()));
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(event, request));
  } else if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(event, request));
  }
});
