/* Keeps the games on the device so they also start without internet.
   The page itself is fetched fresh when there is a connection (so updates arrive), everything else comes from the store. */
const STORE = 'spielekiste-v2';
const FILES = ['./', 'index.html', 'three.min.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(STORE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== STORE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(STORE).then(c => c.put('index.html', copy)); return r; }).catch(() => caches.match('index.html'))); return; }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(STORE).then(c => c.put(req, copy)); return r; })));
});
