const CACHE_NAME = 'acrylic-app-v68';
const ASSETS = [
    './',
    './index.html',
    './css/style.css?v=68',
    './js/app.js?v=68',
    './js/auth.js?v=68',
    './js/tour.js?v=68',
    './js/monetization.js?v=68',
    './js/diagnostics.js?v=68',
    './manifest.json',
    './vendor/tailwindcss.js',
    './vendor/alpine.min.js',
    './vendor/jspdf.umd.min.js',
    './vendor/driver.js',
    './vendor/driver.css'
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
// This ensures users always get the latest version if they are online.
self.addEventListener('fetch', event => {
    // 1. Skip non-http requests
    if (!event.request.url.startsWith('http')) return;

    // 2. EXCLUDE Admin Dashboard from Service Worker entirely
    // This is crucial because admin uses its own cache strategy and structure
    if (event.request.url.includes('/admin')) {
        return; // Let the network handle it directly without SW interference
    }

    // 3. Skip POST requests (SW cannot cache POST)
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Update cache with new version
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // If offline, try to get from cache
                return caches.match(event.request);
            })
    );
});
