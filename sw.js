const CACHE_NAME = 'acrylic-app-v71';
const ASSETS = [
    './',
    './index.html',
    './src/css/style.css?v=71',
    './src/js/app.js?v=71',
    './src/js/auth.js?v=71',
    './src/js/tour.js?v=71',
    './src/js/monetization.js?v=71',
    './src/js/diagnostics.js?v=71',
    './src/manifest.json',
    './src/vendor/tailwindcss.js',
    './src/vendor/alpine.min.js',
    './src/vendor/jspdf.umd.min.js',
    './src/vendor/driver.js',
    './src/vendor/driver.css',
    './src/js/utils/calculator.js?v=71'
];

// Install Event: Cache assets
self.addEventListener('install', event => {
    // Skip waiting to ensure the new service worker activates immediately
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(ASSETS);
            })
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    // Claim clients immediately so the user doesn't need to reload twice
    event.waitUntil(clients.claim());
    
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    // console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Fetch Event: Network First strategy (for fresh content), falling back to Cache
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    // Skip API requests (always network)
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request).then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(event.request, responseToCache);
                });

            return response;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});
