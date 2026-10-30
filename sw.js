// FormFit service worker: caches the app so it opens without internet.
// When you change index.html, bump the version number below.
const CACHE = 'formfit-v8';
const FILES = ['./', 'index.html', 'style.css', 'common.js', 'zoom.js', 'image-resizer.html', 'image-to-pdf.html', 'pdf-compressor.html', 'photo-name-date.html', 'photo-signature-join.html', 'image-converter.html', 'size-converter.html', 'file-checker.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
