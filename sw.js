// PWA Service Worker for 智耗材 APP
const CACHE_NAME = 'zhicaohao-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/app.js',
  './js/lib/vue.esm-browser.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './qrcode.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      )
    )
  );
});
