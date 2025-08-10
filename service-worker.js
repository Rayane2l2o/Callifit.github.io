const CACHE = 'calisfit-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k!==CACHE ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  // Network-first for HTML, cache-first for others
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(fetch(request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(request, copy));
      return resp;
    }).catch(() => caches.match(request)));
  } else {
    e.respondWith(caches.match(request).then(cached => cached || fetch(request).then(resp => {
      // Optionally cache new assets
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(request, copy));
      return resp;
    }).catch(() => caches.match('./index.html'))));
  }
});