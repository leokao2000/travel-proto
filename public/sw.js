const SHELL = 'leo-shell-v1';
const TRIPS = 'leo-trips-v1';
const APP_SHELL = [
  '/',
  '/app.js',
  '/styles.css',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/vendor/leaflet/leaflet.css',
  '/vendor/leaflet/leaflet.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function tripCacheKey(url) {
  return url.origin + url.pathname;
}

async function staleWhileRevalidateTrip(request) {
  const cache = await caches.open(TRIPS);
  const key = tripCacheKey(new URL(request.url));
  const cached = await cache.match(key);
  const network = fetch(request).then(async (response) => {
    if (response.ok) {
      const copy = response.clone();
      const data = await copy.json().catch(() => null);
      if (data && data.trip) await cache.put(key, response.clone());
    }
    return response;
  }).catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (/^\/api\/trips\/[^/]+$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidateTrip(event.request));
    return;
  }
  if (APP_SHELL.includes(url.pathname) || url.pathname.startsWith('/vendor/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.open(SHELL).then(async (cache) => {
      const cached = await cache.match(url.pathname);
      const network = fetch(event.request).then((response) => {
        if (response.ok) cache.put(url.pathname, response.clone());
        return response;
      }).catch(() => cached);
      return cached || network;
    }));
  }
});
