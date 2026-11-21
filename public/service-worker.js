const CACHE_NAME = "network-tycoon-shell-v2";
const CORE_FILES = ["/","/offline.html","/manifest.webmanifest","/favicon.svg","/icons/network-tycoon-192.png","/icons/network-tycoon-512.png","/icons/network-tycoon-maskable-512.png","/icons/apple-touch-icon.png","/images/dog-dark.webp","/images/dog-tan.webp"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("network-tycoon-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/__/")) return;
  const isPage = request.mode === "navigate", isLocalAsset = /\.(?:html|css|js|mjs|json|svg|png|webp|woff2?)$/i.test(url.pathname);
  if (!isPage && !isLocalAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") await cache.put(request, response.clone()).catch(() => {});
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (isPage) return (await cache.match("/offline.html")) || Response.error();
      return Response.error();
    }
  })());
});
