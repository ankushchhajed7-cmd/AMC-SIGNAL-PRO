/* AMC SIGNAL PRO — service worker
   v1.05
   Strategy: network-first for app shell, cache as offline fallback.
   Firebase API calls are never cached (stale signals are dangerous). */

const CACHE = 'amc-signal-pro-v1.05';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache signal data — an old BUY shown as live is worse than no signal.
  if (url.hostname.endsWith('firebaseio.com') ||
      url.hostname.endsWith('firebasedatabase.app') ||
      url.hostname === 'api.twelvedata.com') {
    return;
  }

  // Network first, fall back to cache.
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
