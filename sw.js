// sw.js
// Cache-first PWA that ignores ?query so /index.html?v=41 still matches the cache.
const VERSION = 'v43';
const ROOT = '/Spending-tracker';

const ASSETS = [
  ROOT + '/',
  ROOT + '/index.html',
  ROOT + '/manifest.webmanifest',
  ROOT + '/sw.js',
  ROOT + '/icons/icon-192.png',
  ROOT + '/icons/icon-512.png',
  ROOT + '/food/',
  ROOT + '/food/index.html',
  ROOT + '/savings/',
  ROOT + '/savings/index.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Only handle same-origin GET
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // Ignore query strings when matching cache
  const clean = new Request(url.origin + url.pathname, { method: 'GET' });

  e.respondWith(
    caches.match(clean).then(r => r || fetch(e.request).then(res => {
      // put a clean copy in cache
      const resClone = res.clone();
      caches.open(VERSION).then(c => c.put(clean, resClone)).catch(()=>{});
      return res;
    }).catch(() => r))
  );
});

