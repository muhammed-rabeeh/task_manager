const CACHE_NAME = 'pwa-cache-v1';
const URLS_TO_CACHE = [
    '/', // Adjust if this is the subdirectory
    '/task_manager/index.html', // Adjust if this is the subdirectory
    '/task_manager/styles.css', // Adjust if this is the subdirectory
    '/task_manager/script.js', // Adjust if this is the subdirectory
    '/task_manager/manifest.json', // Adjust if this is the subdirectory
    '/task_manager/icons/icon-192x192.png',
    '/task_manager/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
