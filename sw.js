/**
 * StudyHub Service Worker
 * © 2025 Yination & Excalibur. All rights reserved.
 */

const CACHE_NAME = 'studyhub-v2.1.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install — cache static shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache for navigation
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip API calls and non-GET
  if (request.method !== 'GET') return;
  if (request.url.includes('/api/')) return;
  if (request.url.includes('supabase.co')) return;
  if (request.url.includes('googleapis.com')) return;
  if (request.url.includes('fonts.g')) return;

  // For navigation requests — serve cached shell or network
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets — cache first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
