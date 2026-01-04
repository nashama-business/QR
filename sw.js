const CACHE_NAME = 'qrabd-v7-cache';
const urlsToCache = [
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
