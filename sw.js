const CACHE_NAME = 'ot-calc-v1';

// We dynamically cache files as they are loaded so external scripts (Tailwind/Lucide) work offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached version if found
            if (cachedResponse) return cachedResponse;

            // Otherwise fetch from network, then cache it for future offline use
            return fetch(event.request).then((networkResponse) => {
                // Only cache valid responses
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fails gracefully if offline and not in cache
                console.log('Offline: Asset not in cache');
            });
        })
    );
});

// Clear old caches when a new version is installed
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
});