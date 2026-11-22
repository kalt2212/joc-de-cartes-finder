// Service worker nativo y ligero para Joc de Cartes Finder (sin dependencias).
const VERSION = 'v1';
const SHELL_CACHE = `joc-shell-${VERSION}`;
const DATA_CACHE = `joc-data-${VERSION}`;
const ASSET_CACHE = `joc-assets-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, DATA_CACHE, ASSET_CACHE];

const BASE = '/joc-de-cartes-finder/';
const DATA_URL = `${BASE}data/restaurants.json`;
const SHELL_URLS = [BASE, `${BASE}index.html`, `${BASE}manifest.json`, `${BASE}icons/icon.svg`, DATA_URL];
const ASSET_PREFIX = `${BASE}assets/`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !CURRENT_CACHES.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put(`${BASE}index.html`, response.clone());
    return response;
  } catch {
    const cached = await caches.match(`${BASE}index.html`);
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
      .catch(() => cached);
  return cached || network;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (url.pathname === DATA_URL) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }
  if (url.pathname.startsWith(ASSET_PREFIX)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
  }
});
