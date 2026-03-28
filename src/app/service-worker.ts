// ============================================
// Service Worker for Offline First Strategy
// Handles caching and queue management
// ============================================

const CACHE_NAME = 'snapnext-v1';
const STATIC_CACHE = 'snapnext-static-v1';
const DYNAMIC_CACHE = 'snapnext-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ============================================
// Install Event - Cache Static Assets
// ============================================

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  self.skipWaiting();
});

// ============================================
// Activate Event - Cleanup Old Caches
// ============================================

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  self.clients.claim();
});

// ============================================
// Fetch Event - Network First with Cache Fallback
// ============================================

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests - use network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(networkFirst(request));
});

// ============================================
// Cache Strategies
// ============================================

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// ============================================
// Background Sync for Photo Upload Queue
// ============================================

self.addEventListener('sync', (event: SyncEvent) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-photos') {
    event.waitUntil(syncPhotos());
  }
});

async function syncPhotos(): Promise<void> {
  console.log('[ServiceWorker] Syncing photos...');
  
  // Get pending items from IndexedDB
  const db = await openDB();
  const pendingItems = await getAllFromStore(db, 'upload-queue', 'pending');
  
  for (const item of pendingItems) {
    try {
      // Attempt to upload
      const formData = new FormData();
      formData.append('photo', item.blob);
      formData.append('sessionId', item.sessionId);
      
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Update status to completed
        await updateItemStatus(db, 'upload-queue', item.id, 'completed');
        console.log('[ServiceWorker] Uploaded:', item.id);
      } else {
        // Increment retry count
        await incrementRetry(db, 'upload-queue', item.id);
      }
    } catch (error) {
      console.error('[ServiceWorker] Upload failed:', error);
      await incrementRetry(db, 'upload-queue', item.id);
    }
  }
}

// ============================================
// Push Notifications for Payment Status
// ============================================

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() || {};
  
  const options: NotificationOptions = {
    body: data.body || 'Payment received!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/admin/payments',
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'SnapNext', options)
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
  }
});

// ============================================
// IndexedDB Helpers
// ============================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('snapnext-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create upload queue store
      if (!db.objectStoreNames.contains('upload-queue')) {
        db.createObjectStore('upload-queue', { keyPath: 'id' });
      }
      
      // Create photos store
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' });
      }
    };
  });
}

function getAllFromStore(
  db: IDBDatabase,
  storeName: string,
  status: string
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const items = request.result.filter((item: any) => item.status === status);
      resolve(items);
    };
  });
}

function updateItemStatus(
  db: IDBDatabase,
  storeName: string,
  id: string,
  status: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      item.status = status;
      store.put(item);
    };
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

function incrementRetry(
  db: IDBDatabase,
  storeName: string,
  id: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      item.retryCount = (item.retryCount || 0) + 1;
      if (item.retryCount >= 3) {
        item.status = 'failed';
      }
      store.put(item);
    };
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// ============================================
// TypeScript Types for Service Worker
// ============================================

declare const self: ServiceWorkerGlobalScope;

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

interface PushEvent extends ExtendableEvent {
  data: { json(): any } | null;
}

interface NotificationEvent extends ExtendableEvent {
  action: string;
  notification: {
    close(): void;
    data: { url?: string };
  };
}

interface ServiceWorkerGlobalScope {
  skipWaiting(): Promise<void>;
  clients: {
    claim(): Promise<void>;
    openWindow(url: string): Promise<WindowClient | null>;
  };
  registration: {
    showNotification(title: string, options: NotificationOptions): Promise<Notification>;
  };
  addEventListener(type: string, listener: any): void;
}