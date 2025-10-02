// One app, two pages cached offline
const VERSION = 'v15';
const ROOT = '/Spending-tracker/';   // include trailing slash, capital S

const ASSETS = [
  ROOT,
  ROOT + 'index.html',
  ROOT + 'manifest.webmanifest',
  ROOT + 'food/',
  ROOT + 'food/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
