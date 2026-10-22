/* ModDeck service worker — offline-capable shell for the installed desktop app */
const VERSION = "moddeck-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) => cache.add("/").catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  /* never cache the referral API — always live */
  if (url.pathname.startsWith("/api/")) return;

  /* immutable build assets + game art: cache-first */
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/games/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  /* navigations: network-first, fall back to cached shell when offline */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(PAGE_CACHE).then((cache) => cache.put("/", res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || Response.error())
    );
  }
});
