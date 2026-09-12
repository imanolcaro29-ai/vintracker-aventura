const CACHE = "vintracker-aventura-v2.0.0";
const ROOT = new URL("./", self.location.href).pathname;
const FILES = [
  "",
  "index.html",
  "styles.css?v=200",
  "learning.js?v=200",
  "app.js?v=200",
  "manifest.json",
  "favicon-32.png",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "assets/comunidad.webp",
  "assets/casa-antes.webp",
  "assets/casa-despues.webp",
  "assets/ciclo-vinchuca-oficial.jpg",
];
self.addEventListener("install", (e) =>
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(
        FILES.map((p) => new Request(ROOT + p, { cache: "reload" })),
      );
      await self.skipWaiting();
    })(),
  ),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith("vintracker-aventura-") && key !== CACHE)
          await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (e) => {
  const r = e.request,
    u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const stored = await cache.match(r, { ignoreSearch: true });
      if (stored) return stored;
      try {
        const response = await fetch(r);
        return response;
      } catch {
        if (r.mode === "navigate")
          return (await cache.match(ROOT + "index.html")) || Response.error();
        return Response.error();
      }
    })(),
  );
});
