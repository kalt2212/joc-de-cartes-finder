// Vanilla service worker: precaches the app shell, stale-while-revalidate for restaurants.json, cache-first for hashed assets.
const VERSION = 'v2';
const SHELL_CACHE = `jdc-shell-${VERSION}`;
const RUNTIME_CACHE = `jdc-runtime-${VERSION}`;
const SHELL_PATHS = [
  '',
  'index.html',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'data/restaurants.json',
];

function basePath() {
  return new URL(self.registration.scope).pathname;
}

self.addEventListener('install', (event) => {
  const base = basePath();
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_PATHS.map((p) => base + p)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function staleWhileRevalidate(request) {
  return caches.open(RUNTIME_CACHE).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
}

function cacheFirst(request) {
  return caches.open(RUNTIME_CACHE).then((cache) =>
    cache.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      });
    }),
  );
}

function networkFirstNavigation(request) {
  const base = basePath();
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(SHELL_CACHE).then((cache) => cache.put(base, copy));
      }
      return response;
    })
    .catch(() => caches.match(base));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const base = basePath();
  if (url.pathname === base + 'data/restaurants.json') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if (url.pathname.startsWith(base + 'assets/')) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
  }
});
