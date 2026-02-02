/**
 * Service Worker for Offline Support
 * Caches assets and API responses for offline access
 */

const CACHE_NAME = 'helpdesk-cache-v1';
const API_CACHE_NAME = 'helpdesk-api-cache-v1';
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

const CACHE_STRATEGIES = {
  networkFirst: ['/api/'],
  cacheFirst: [
    '/assets/',
    '/images/',
    '/fonts/',
  ],
  staleWhileRevalidate: [
    '/api/dashboard',
    '/api/stats',
  ],
};

function getCacheName(url) {
  if (url.includes('/api/')) {
    return API_CACHE_NAME;
  }
  return CACHE_NAME;
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  const cacheName = getCacheName(request.url);
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

async function handleRequest(request) {
  const url = new URL(request.url);
  
  for (const pattern of CACHE_STRATEGIES.cacheFirst) {
    if (url.pathname.startsWith(pattern)) {
      return cacheFirst(request);
    }
  }
  
  for (const pattern of CACHE_STRATEGIES.networkFirst) {
    if (url.pathname.startsWith(pattern)) {
      return networkFirst(request);
    }
  }
  
  for (const pattern of CACHE_STRATEGIES.staleWhileRevalidate) {
    if (url.pathname.startsWith(pattern)) {
      return staleWhileRevalidate(request);
    }
  }
  
  if (request.mode === 'navigate') {
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  return networkFirst(request);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(handleRequest(event.request));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});
