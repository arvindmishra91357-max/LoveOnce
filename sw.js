/**
 * LoveOnce Romantic Progressive Web App (PWA) Service Worker
 * Provides offline caching for love stories, memories, art, and book pages
 */

const CACHE_NAME = 'loveonce-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/style.css',
  '/assets/js/music.js',
  '/assets/js/animations.js',
  '/assets/js/main.js',
  '/assets/images/icon-heart.svg',
  '/assets/images/starlit_walk_art.jpg',
  '/assets/images/sunset_hill_art.jpg'
];

// Install: Cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[LoveOnce SW] Non-fatal precache error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network first with cache fallback for dynamic content; Cache first for images & assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip SSE stream, non-GET, and non-http(s)
  if (req.method !== 'GET' || url.pathname.includes('/api/chat/events')) {
    return;
  }

  // Audio range requests: let browser handle natively
  if (req.headers.has('range') || url.pathname.endsWith('.mp3')) {
    return;
  }

  // API calls: Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.ok && (url.pathname.startsWith('/api/story') || url.pathname.startsWith('/api/chat/messages'))) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(req);
        })
    );
    return;
  }

  // Static assets: Cache first, fallback to network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      }).catch(() => {
        if (req.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
