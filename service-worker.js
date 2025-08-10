
const CACHE_NAME = 'calisfit-v1-00';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only handle GET
  if (req.method !== 'GET') return;
  // For navigation, serve index.html (SPA style)
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // Cache-first for our precached assets
  if (PRECACHE_URLS.some(p => url.pathname.endsWith(p.replace('./','/')))) {
    event.respondWith(caches.match(req).then(res => res || fetch(req)));
    return;
  }
  // Stale-while-revalidate for others
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => 
      cache.match(req).then(res => {
        const fetchPromise = fetch(req).then(networkRes => {
          if (networkRes && networkRes.status === 200) cache.put(req, networkRes.clone());
          return networkRes;
        }).catch(() => res);
        return res || fetchPromise;
      })
    )
  );
});
