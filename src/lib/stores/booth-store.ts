// ============================================
// SnapNext SaaS - Zustand Store for Booth State
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Photo {
  id: string
  url: string
  base64?: string
  timestamp: number
}

export interface Frame {
  id: string
  name: string
  type: 'FOUR_R' | 'A4_NEWSPAPER' | 'CUSTOM'
  imageUrl: string
  thumbnailUrl?: string
  width: number
  height: number
  price: number
}

export interface BoothSession {
  id: string
  code: string
  outletId: string
  frameId?: string
  frame?: Frame
  photos: Photo[]
  status: 'idle' | 'capturing' | 'countdown' | 'processing' | 'preview' | 'payment' | 'completed'
  countdownValue: number
  currentPhotoIndex: number
  totalPhotos: number
  mode: 'single' | 'burst' | 'gif'
  totalPrice: number
  paymentMethod: 'cash' | 'qris' | 'voucher' | null
  paymentStatus: 'pending' | 'paid' | 'failed'
  galleryCode?: string
  isOffline: boolean
  customerPhone?: string  // Customer WhatsApp number for notification
}

export interface BoothConfig {
  outletId: string
  machineId: string
  printEnabled: boolean
  galleryEnabled: boolean
  gifEnabled: boolean
  newspaperEnabled: boolean
  defaultPrice: number
  paymentMethods: {
    cash: boolean
    qris: boolean
    voucher: boolean
  }
  countdownDuration: number
  burstCount: number
  gifFrames: number
}

interface BoothState {
  // Session
  session: BoothSession
  config: BoothConfig | null
  
  // Actions - Session
  startSession: (outletId: string) => void
  setCountdown: (value: number) => void
  setCapturing: () => void
  addPhoto: (photo: Photo) => void
  setProcessing: () => void
  setPreview: () => void
  setPayment: (method: 'cash' | 'qris' | 'voucher') => void
  setPaymentStatus: (status: 'pending' | 'paid' | 'failed') => void
  setCompleted: (galleryCode: string) => void
  resetSession: () => void
  
  // Actions - Config
  setConfig: (config: BoothConfig) => void
  setFrame: (frame: Frame) => void
  
  // Actions - Offline
  setOffline: (isOffline: boolean) => void
  queuePhotoUpload: (photo: Photo) => void
  setCustomerPhone: (phone: string) => void
}

const generateSessionCode = () => {
  return `SN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

const generateGalleryCode = () => {
  return `${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

const initialSession: BoothSession = {
  id: '',
  code: '',
  outletId: '',
  frameId: undefined,
  frame: undefined,
  photos: [],
  status: 'idle',
  countdownValue: 3,
  currentPhotoIndex: 0,
  totalPhotos: 4,
  mode: 'burst',
  totalPrice: 0,
  paymentMethod: null,
  paymentStatus: 'pending',
  galleryCode: undefined,
  isOffline: false,
}

export const useBoothStore = create<BoothState>()(
  persist(
    (set, get) => ({
      session: initialSession,
      config: null,

      // Session Actions
      startSession: (outletId: string) => {
        set({
          session: {
            ...initialSession,
            id: crypto.randomUUID(),
            code: generateSessionCode(),
            outletId,
            status: 'capturing',
          },
        })
      },

      setCountdown: (value: number) => {
        set((state) => ({
          session: {
            ...state.session,
            countdownValue: value,
            status: value > 0 ? 'countdown' : 'capturing',
          },
        }))
      },

      setCapturing: () => {
        set((state) => ({
          session: {
            ...state.session,
            status: 'capturing',
          },
        }))
      },

      addPhoto: (photo: Photo) => {
        set((state) => ({
          session: {
            ...state.session,
            photos: [...state.session.photos, photo],
            currentPhotoIndex: state.session.currentPhotoIndex + 1,
          },
        }))
      },

      setProcessing: () => {
        set((state) => ({
          session: {
            ...state.session,
            status: 'processing',
          },
        }))
      },

      setPreview: () => {
        set((state) => ({
          session: {
            ...state.session,
            status: 'preview',
          },
        }))
      },

      setPayment: (method: 'cash' | 'qris' | 'voucher') => {
        set((state) => ({
          session: {
            ...state.session,
            paymentMethod: method,
            status: 'payment',
          },
        }))
      },

      setPaymentStatus: (status: 'pending' | 'paid' | 'failed') => {
        set((state) => ({
          session: {
            ...state.session,
            paymentStatus: status,
          },
        }))
      },

      setCompleted: (galleryCode: string) => {
        set((state) => ({
          session: {
            ...state.session,
            status: 'completed',
            galleryCode,
          },
        }))
      },

      resetSession: () => {
        set({ session: initialSession })
      },

      // Config Actions
      setConfig: (config: BoothConfig) => {
        set({ config })
      },

      setFrame: (frame: Frame) => {
        set((state) => ({
          session: {
            ...state.session,
            frameId: frame.id,
            frame,
            totalPrice: frame.price,
          },
        }))
      },

      // Offline Actions
      setOffline: (isOffline: boolean) => {
        set((state) => ({
          session: {
            ...state.session,
            isOffline,
          },
        }))
      },

      queuePhotoUpload: (_photo: Photo) => {
        // Queue logic will be handled by the upload service
        console.log('Queuing photo upload for later')
      },

      setCustomerPhone: (phone: string) => {
        set((state) => ({
          session: {
            ...state.session,
            customerPhone: phone,
          },
        }))
      },
    }),
    {
      name: 'snapnext-booth-storage',
      partialize: (state) => ({
        session: {
          status: state.session.status,
          isOffline: state.session.isOffline,
          photos: state.session.photos,
        },
      }),
    }
  )
)

// ============================================
// Payment Store
// ============================================

interface PaymentState {
  // QRIS State
  qrisString: string | null
  qrisExpiry: Date | null
  qrisPolling: boolean
  
  // Voucher State
  voucherApplied: boolean
  voucherDiscount: number
  voucherCode: string | null
  
  // Actions
  setQrisString: (qr: string, expiry: Date) => void
  clearQris: () => void
  setQrisPolling: (polling: boolean) => void
  applyVoucher: (code: string, discount: number) => void
  clearVoucher: () => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  qrisString: null,
  qrisExpiry: null,
  qrisPolling: false,
  voucherApplied: false,
  voucherDiscount: 0,
  voucherCode: null,

  setQrisString: (qr: string, expiry: Date) => {
    set({ qrisString: qr, qrisExpiry: expiry })
  },

  clearQris: () => {
    set({ qrisString: null, qrisExpiry: null, qrisPolling: false })
  },

  setQrisPolling: (polling: boolean) => {
    set({ qrisPolling: polling })
  },

  applyVoucher: (code: string, discount: number) => {
    set({ voucherApplied: true, voucherCode: code, voucherDiscount: discount })
  },

  clearVoucher: () => {
    set({ voucherApplied: false, voucherCode: null, voucherDiscount: 0 })
  },
}))

// ============================================
// Gallery Queue Store (Offline Upload)
// ============================================

export interface QueueItem {
  id: string
  sessionId: string
  type: 'photo' | 'gif' | 'newspaper'
  localPath: string
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  retryCount: number
  error?: string
}

interface QueueState {
  items: QueueItem[]
  addItem: (item: Omit<QueueItem, 'id' | 'status' | 'retryCount'>) => void
  updateStatus: (id: string, status: QueueItem['status'], error?: string) => void
  incrementRetry: (id: string) => void
  removeItem: (id: string) => void
  clearCompleted: () => void
}

export const useQueueStore = create<QueueState>((set) => ({
  items: [],

  addItem: (item) => {
    set((state) => ({
      items: [
        ...state.items,
        {
          ...item,
          id: crypto.randomUUID(),
          status: 'pending' as const,
          retryCount: 0,
        },
      ],
    }))
  },

  updateStatus: (id: string, status: QueueItem['status'], error?: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status, error } : item
      ),
    }))
  },

  incrementRetry: (id: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
      ),
    }))
  },

  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }))
  },

  clearCompleted: () => {
    set((state) => ({
      items: state.items.filter((item) => item.status !== 'completed'),
    }))
  },
}))