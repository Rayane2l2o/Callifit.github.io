
// Cache simple et fiable pour GitHub Pages
const CACHE = "calisfit-v1";

// Liste les assets critiques de l'app
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          const sameOrigin = new URL(req.url).origin === self.location.origin;
          if (sameOrigin) {
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // Optionnel : renvoyer une page de secours si non en cache
          // return caches.match("/offline.html");
        });
    })
  );
});
