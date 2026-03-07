/**
 * ManMulyankan Service Worker v2.0
 * Enables offline access to all cognitive assessments
 * Strategy: Network-first for API, Cache-first for static assets
 */

const CACHE_NAME = 'manmulyankan-v2.0';
const STATIC_CACHE = 'manmulyankan-static-v2.0';
const DYNAMIC_CACHE = 'manmulyankan-dynamic-v2.0';

// Core app shell - always cache
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/game-fx.js',
  '/offline.html'
];

// All test pages to pre-cache for offline use
const TEST_PAGES = [
  '/test/depression_screening',
  '/test/trail_making',
  '/test/stroop_test',
  '/test/digit_span',
  '/test/quality_of_life',
  '/test/wisc_v',
  '/test/wais_v_young',
  '/test/wais_v_adult',
  '/test/moca'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap'
];

// ═══ INSTALL ═══
self.addEventListener('install', event => {
  console.log('[SW] Installing ManMulyankan PWA v2.0');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Pre-caching app shell and tests');
      // Cache app shell first
      return cache.addAll(APP_SHELL)
        .then(() => {
          // Cache test pages (don't fail install if some fail)
          return Promise.allSettled(
            TEST_PAGES.map(url => 
              cache.add(url).catch(err => console.log('[SW] Could not cache:', url))
            )
          );
        })
        .then(() => {
          // Try to cache external resources
          return Promise.allSettled(
            EXTERNAL_RESOURCES.map(url =>
              cache.add(url).catch(err => console.log('[SW] External cache skip:', url))
            )
          );
        });
    }).then(() => self.skipWaiting())
  );
});

// ═══ ACTIVATE ═══
self.addEventListener('activate', event => {
  console.log('[SW] Activating new service worker');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ═══ FETCH STRATEGY ═══
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API calls: Network-first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Admin pages: Network-only (requires auth)
  if (url.pathname.startsWith('/admin')) {
    event.respondWith(fetch(request));
    return;
  }

  // Test pages & static assets: Cache-first, fall back to network
  if (url.pathname.startsWith('/test/') || url.pathname === '/') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // External resources (fonts, images): Stale-while-revalidate
  if (url.origin !== location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Everything else: Cache-first
  event.respondWith(cacheFirst(request));
});

// ═══ STRATEGIES ═══

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// ═══ BACKGROUND SYNC ═══
// Queue test results when offline, sync when back online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-results') {
    event.waitUntil(syncResults());
  }
});

async function syncResults() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const pendingResults = await cache.match('/pending-results');
    if (!pendingResults) return;

    const results = await pendingResults.json();
    for (const result of results) {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
    }
    // Clear pending results
    await cache.delete('/pending-results');
    console.log('[SW] Synced pending results');
  } catch (error) {
    console.log('[SW] Sync failed, will retry');
  }
}

// ═══ PUSH NOTIFICATIONS ═══
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ManMulyankan';
  const options = {
    body: data.body || 'Time for your cognitive check-up!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

console.log('[SW] ManMulyankan Service Worker loaded');
