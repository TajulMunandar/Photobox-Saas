// @ts-nocheck
// ============================================
// IndexedDB Utility for Offline WhatsApp Queue
// Stores pending WhatsApp messages when offline
// and sends them when connection is restored
// ============================================

const DB_NAME = 'snapnext-wa-queue'
const DB_VERSION = 1
const STORE_NAME = 'pending-messages'

// ============================================
// Types
// ============================================

export interface QueuedWhatsAppMessage {
  id?: string
  phoneNumber: string
  outletName: string
  galleryCode?: string
  galleryUrl?: string
  photoCount?: number
  type: 'gallery' | 'payment'
  amount?: number
  sessionCode?: string
  timestamp: number
  retryCount: number
  status: 'pending' | 'sending' | 'failed'
}

// ============================================
// Open IndexedDB
// ============================================

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        
        // Create index for status
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// ============================================
// Add Message to Queue
// ============================================

export async function addToQueue(message: Omit<QueuedWhatsAppMessage, 'id' | 'retryCount' | 'status'>): Promise<void> {
  const db = await openDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const queuedMessage: QueuedWhatsAppMessage = {
      ...message,
      retryCount: 0,
      status: 'pending',
    }
    
    const request = store.add(queuedMessage)
    
    request.onsuccess = () => {
      console.log('[IndexedDB] Message added to queue')
      resolve()
    }
    
    request.onerror = () => reject(request.error)
  })
}

// ============================================
// Get All Pending Messages
// ============================================

export async function getPendingMessages(): Promise<QueuedWhatsAppMessage[]> {
  const db = await openDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('status')
    
    const request = index.getAll('pending')
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ============================================
// Update Message Status
// ============================================

export async function updateMessageStatus(
  id: number, 
  status: QueuedWhatsAppMessage['status']
): Promise<void> {
  const db = await openDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const getRequest = store.get(id)
    
    getRequest.onsuccess = () => {
      const message = getRequest.result
      if (message) {
        message.status = status
        if (status === 'failed') {
          message.retryCount += 1
        }
        store.put(message)
      }
    }
    
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// ============================================
// Remove Message from Queue
// ============================================

export async function removeFromQueue(id: number): Promise<void> {
  const db = await openDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.delete(id)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// ============================================
// Clear All Processed Messages
// ============================================

export async function clearProcessed(): Promise<void> {
  const db = await openDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('status')
    
    // Get all completed/failed messages
    const request = index.getAllKeys('failed')
    
    request.onsuccess = () => {
      const keys = request.result
      keys.forEach(key => store.delete(key))
    }
    
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// ============================================
// Process Queue - Send all pending messages
// ============================================

export async function processQueue(): Promise<{ success: number; failed: number }> {
  const messages = await getPendingMessages()
  
  if (messages.length === 0) {
    return { success: 0, failed: 0 }
  }
  
  let successCount = 0
  let failedCount = 0
  
  for (const message of messages) {
    try {
      // Mark as sending
      if (message.id) {
        await updateMessageStatus(message.id, 'sending')
      }
      
      // Try to send via API
      const response = await fetch('/api/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: message.phoneNumber,
          outletName: message.outletName,
          galleryCode: message.galleryCode,
          galleryUrl: message.galleryUrl,
          photoCount: message.photoCount,
          type: message.type,
          amount: message.amount,
          sessionCode: message.sessionCode,
        }),
      })
      
      const result = await response.json()
      
      if (result.success && message.id) {
        await removeFromQueue(message.id)
        successCount++
        console.log('[IndexedDB] Message sent:', message.id)
      } else if (message.id) {
        await updateMessageStatus(message.id, 'failed')
        failedCount++
      }
    } catch (error) {
      console.error('[IndexedDB] Failed to send message:', error)
      if (message.id) {
        await updateMessageStatus(message.id, 'failed')
      }
      failedCount++
    }
  }
  
  return { success: successCount, failed: failedCount }
}

// ============================================
// Online/Offline Event Handlers
// ============================================

export function setupNetworkListeners() {
  if (typeof window === 'undefined') return
  
  // When back online, process the queue
  window.addEventListener('online', async () => {
    console.log('[Network] Back online - processing WhatsApp queue...')
    
    const result = await processQueue()
    
    if (result.success > 0) {
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SnapNext', {
          body: `Sent ${result.success} pending WhatsApp message(s)!`,
          icon: '/icons/icon-192.png',
        })
      }
    }
    
    console.log('[Network] Queue processing complete:', result)
  })
  
  // Log offline status
  window.addEventListener('offline', () => {
    console.log('[Network] Gone offline - WhatsApp messages will be queued')
  })
}

// ============================================
// Check if message should be queued (offline)
// ============================================

export async function sendWithFallback(message: {
  phoneNumber: string
  outletName: string
  galleryCode?: string
  galleryUrl?: string
  photoCount?: number
  type?: 'gallery' | 'payment'
}): Promise<{ success: boolean; queued?: boolean }> {
  // Check if online
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  
  if (!isOnline) {
    // Queue the message for later
    await addToQueue({
      phoneNumber: message.phoneNumber,
      outletName: message.outletName,
      galleryCode: message.galleryCode,
      galleryUrl: message.galleryUrl,
      photoCount: message.photoCount,
      type: message.type || 'gallery',
      timestamp: Date.now(),
    })
    
    return { success: true, queued: true }
  }
  
  // Try to send immediately
  try {
    const response = await fetch('/api/send-wa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    
    const result = await response.json()
    return { success: result.success }
  } catch (error) {
    // If request fails, queue the message
    await addToQueue({
      phoneNumber: message.phoneNumber,
      outletName: message.outletName,
      galleryCode: message.galleryCode,
      galleryUrl: message.galleryUrl,
      photoCount: message.photoCount,
      type: message.type || 'gallery',
      timestamp: Date.now(),
    })
    
    return { success: true, queued: true }
  }
}