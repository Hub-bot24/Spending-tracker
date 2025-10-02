// One app, caches both pages
const VERSION = 'v1';
const PREFIX  = '/Spending-tracker';
const ASSETS  = [
  `${PREFIX}/`,
  `${PREFIX}/index.html`,
  `${PREFIX}/manifest.webmanifest`,
  `${PREFIX}/food/`,
  `${PREFIX}/food/index.html`
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin === location.origin && u.pathname.startsWith(PREFIX + '/')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
