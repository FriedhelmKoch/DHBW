// Service Worker Cache
//
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open('pwa-cache')
            .then(cache => cache.match(event.request))
            .then(response => response || fetch(event.request))
    );
});

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('pwa-cache')
            .then(cache => cache.addAll([
                './',
                './index.html',
                './favicon.ico',
                './pwa.js',  
                './sw.js', 
                './pwa.css',
                './DHBW_Logo.png',
                './icon-57.png',
                './icon-76.png',
                './icon-120.png',
                './icon-152.png',
                './icon-167.png',
                './icon-180.png',
                './pwa.webmanifest',
                './Splash-iPhone.png'
            ]))
            .then(() => self.skipWaiting())
    );
});

// siehe auch: https://developer.mozilla.org/de/docs/Web/API/Service_Worker_API/Using_Service_Workers
