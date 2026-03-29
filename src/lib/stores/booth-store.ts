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

export interface Template {
  id: string
  name: string
  theme: string
  imageUrl: string
  thumbnailUrl: string
  slots: number
  layout: 'grid-2x3' | 'grid-3x2' | 'custom'
}

export interface BoothSession {
  id: string
  code: string
  outletId: string
  frameId?: string
  frame?: Frame
  templateId?: string
  template?: Template
  photos: Photo[]
  status: 'payment' | 'template-selection' | 'capturing' | 'countdown' | 'processing' | 'preview' | 'printing' | 'completed'
  countdownValue: number
  currentPhotoIndex: number
  totalPhotos: number
  mode: 'single' | 'burst' | 'gif'
  totalPrice: number
  paymentMethod: 'qris' | 'voucher' | 'event' | null
  paymentStatus: 'pending' | 'paid' | 'failed'
  galleryCode?: string
  isOffline: boolean
  customerPhone?: string
  sessionTimer: number // Global session timer in seconds (9 minutes = 540)
  sessionTimerActive: boolean
  printCopies: number
  selectedFilter?: string // Filter selected for photos (not frame)
  transactionRef?: string
}

export interface BoothConfig {
  outletId: string
  outletName: string
  machineId: string
  printEnabled: boolean
  galleryEnabled: boolean
  gifEnabled: boolean
  newspaperEnabled: boolean
  defaultPrice: number
  paymentMethods: {
    qris: boolean
    voucher: boolean
    event: boolean
  }
  countdownDuration: number
  burstCount: number
  gifFrames: number
  sessionTimeout: number // in seconds
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
  setPayment: (method: 'qris' | 'voucher' | 'event') => void
  setPaymentStatus: (status: 'pending' | 'paid' | 'failed') => void
  setCompleted: (galleryCode: string) => void
  resetSession: () => void
  setTemplateSelection: () => void
  setPrinting: () => void
  
  // Actions - Config
  setConfig: (config: BoothConfig) => void
  setFrame: (frame: Frame) => void
  setTemplate: (template: Template) => void
  
  // Actions - Offline
  setOffline: (isOffline: boolean) => void
  queuePhotoUpload: (photo: Photo) => void
  setCustomerPhone: (phone: string) => void
  
  // Actions - Timer
  startSessionTimer: () => void
  stopSessionTimer: () => void
  decrementSessionTimer: () => void
  
  // Actions - Print
  setPrintCopies: (copies: number) => void
  setTransactionRef: (ref: string) => void
  setSelectedFilter: (filter: string) => void
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
  templateId: undefined,
  template: undefined,
  photos: [],
  status: 'payment',
  countdownValue: 8,
  currentPhotoIndex: 0,
  totalPhotos: 3,
  mode: 'burst',
  totalPrice: 0,
  paymentMethod: null,
  paymentStatus: 'pending',
  galleryCode: undefined,
  isOffline: false,
  customerPhone: undefined,
  sessionTimer: 540, // 9 minutes
  sessionTimerActive: false,
  printCopies: 1,
  selectedFilter: undefined,
  transactionRef: undefined,
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
            status: 'payment',
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

      setPayment: (method: 'qris' | 'voucher' | 'event') => {
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
            sessionTimerActive: false,
          },
        }))
      },

      resetSession: () => {
        set({ session: initialSession })
      },

      setTemplateSelection: () => {
        set((state) => ({
          session: {
            ...state.session,
            status: 'template-selection',
          },
        }))
      },

      setPrinting: () => {
        set((state) => ({
          session: {
            ...state.session,
            status: 'printing',
          },
        }))
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

      setTemplate: (template: Template) => {
        set((state) => ({
          session: {
            ...state.session,
            templateId: template.id,
            template,
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

      // Timer Actions
      startSessionTimer: () => {
        set((state) => ({
          session: {
            ...state.session,
            sessionTimerActive: true,
            // Don't reset timer - continue from where it left off
          },
        }))
      },

      stopSessionTimer: () => {
        set((state) => ({
          session: {
            ...state.session,
            sessionTimerActive: false,
          },
        }))
      },

      decrementSessionTimer: () => {
        set((state) => {
          const newTimer = state.session.sessionTimer - 1
          if (newTimer <= 0) {
            // Timer expired - reset to payment
            return {
              session: {
                ...initialSession,
                outletId: state.session.outletId,
                id: state.session.id,
                code: state.session.code,
              },
            }
          }
          return {
            session: {
              ...state.session,
              sessionTimer: newTimer,
            },
          }
        })
      },

      // Print Actions
      setPrintCopies: (copies: number) => {
        set((state) => ({
          session: {
            ...state.session,
            printCopies: copies,
          },
        }))
      },

      setTransactionRef: (ref: string) => {
        set((state) => ({
          session: {
            ...state.session,
            transactionRef: ref,
          },
        }))
      },

      setSelectedFilter: (filter: string) => {
        set((state) => ({
          session: {
            ...state.session,
            selectedFilter: filter,
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
          sessionTimer: state.session.sessionTimer,
          sessionTimerActive: state.session.sessionTimerActive,
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
  transactionRef: string | null
  
  // Voucher State
  voucherApplied: boolean
  voucherDiscount: number
  voucherCode: string | null
  
  // Actions
  setQrisString: (qr: string, expiry: Date, transactionRef: string) => void
  clearQris: () => void
  setQrisPolling: (polling: boolean) => void
  applyVoucher: (code: string, discount: number) => void
  clearVoucher: () => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  qrisString: null,
  qrisExpiry: null,
  qrisPolling: false,
  transactionRef: null,
  voucherApplied: false,
  voucherDiscount: 0,
  voucherCode: null,

  setQrisString: (qr: string, expiry: Date, transactionRef: string) => {
    set({ qrisString: qr, qrisExpiry: expiry, transactionRef })
  },

  clearQris: () => {
    set({ qrisString: null, qrisExpiry: null, qrisPolling: false, transactionRef: null })
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
