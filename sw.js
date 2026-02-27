const CACHE_NAME = ‘flashcards-v2’;
const ASSETS = [
‘/’,
‘/index.html’,
‘https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Noto+Sans+JP:wght@400;500;700&display=swap’
];

self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
);
self.skipWaiting();
});

self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
)
);
self.clients.claim();
});

self.addEventListener(‘fetch’, e => {
e.respondWith(
caches.match(e.request).then(cached => cached || fetch(e.request))
);
});