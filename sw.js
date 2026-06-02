
// Cache simples para PWA offline
const CACHE = 'dodge-blocks-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  // Network-first para HTML, cache-first para estáticos
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put('./', copy));
        return resp;
      }).catch(() => caches.match('./'))
    );
  } else {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
