// Cache-first SW that ignores ?query so /index.html?v=38 still matches the cache
const VERSION = 'v40';
const ROOT    = '/Spending-tracker/';

const ASSETS = [
  ROOT,
  ROOT + 'index.html',
  ROOT + 'manifest.webmanifest',
  ROOT + 'food/',
  ROOT + 'food/index.html',
  ROOT + 'savings/',
  ROOT + 'savings/index.html',
  // (optional) icons if you have them
  ROOT + 'icons/icon-192.png',
  ROOT + 'icons/icon-512.png',
];

// Install: pre-cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: clean old versions and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin and ignore ?query so v=xx or fam=xx still hit the cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  event.respondWith((async () => {
    // Try cache first, but IGNORE SEARCH QUERY
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;

    // Otherwise go to network
    try {
      return await fetch(event.request);
    } catch (err) {
      // If it's a navigation request and we're offline, fall back to root index
      if (event.request.mode === 'navigate') {
        const fallback = await caches.match(ROOT + 'index.html');
        if (fallback) return fallback;
      }
      throw err;
    }
  })());
});
