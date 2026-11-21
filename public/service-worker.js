/* The deployment workflow replaces this token with the checked-out commit SHA. */
const DEPLOYMENT_VERSION = "__DEPLOYMENT_VERSION__";
const CACHE_PREFIX = "network-tycoon-shell-";
const CACHE_NAME = CACHE_PREFIX + DEPLOYMENT_VERSION;
const CORE_FILES = [
  "/",
  "/tycoon/",
  "/match/",
  "/rescue/",
  "/starlight/",
  "/tinker/",
  "/offline.html",
  "/version.json",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/network-tycoon-192.png",
  "/icons/network-tycoon-512.png",
  "/icons/network-tycoon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/images/dog-dark.webp",
  "/images/dog-tan.webp"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .catch(error => {
        // A temporary network failure should leave an older active worker intact.
        return caches.delete(CACHE_NAME).then(() => { throw error; });
      })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  const message = event.data || {};
  if (message.type === "PORTFOLIO_SKIP_WAITING") {
    self.skipWaiting();
  } else if (message.type === "PORTFOLIO_GET_VERSION" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: DEPLOYMENT_VERSION });
  }
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/__/")) return;

  const isVersion = url.pathname === "/version.json";
  const isPage = request.mode === "navigate";
  const isLocalAsset = /\.(?:html|css|js|mjs|json|svg|png|webp|woff2?)$/i.test(url.pathname);
  if (isVersion) {
    // The version endpoint must reflect the current deployment while online.
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }
  if (!isPage && !isLocalAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request, { cache: "no-cache" });
      if (response.ok && response.type === "basic") {
        await cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_) {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (isPage) return (await cache.match("/offline.html")) || Response.error();
      return Response.error();
    }
  })());
});
