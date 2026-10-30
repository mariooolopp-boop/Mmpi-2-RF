// Service worker: guarda la app para abrirla sin conexión. No intercepta Firebase.
// Siempre pide primero la versión nueva al servidor (revalidando), así las actualizaciones llegan solas.
const CACHE = 'mmpi-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/style.css', 'js/app.js', 'js/model.js', 'js/scoring.js', 'js/pdf.js', 'js/interpretacion.js',
  'js/store.js', 'js/config.js', 'js/vendor/pdf-lib.min.js', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // Red primero (revalidando con el servidor); si no hay red, usa la copia guardada.
  e.respondWith(fetch(e.request, { cache: 'no-cache' })
    .then(r => { if (r.status === 200) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
