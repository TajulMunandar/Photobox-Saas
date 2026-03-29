'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useBoothStore, usePaymentStore, type Photo, type Template } from '@/lib/stores/booth-store'
import {
  CameraView,
  Countdown,
  ShutterButton,
  PaymentSelector,
  QrisDisplay,
  PhotoPreview,
  OfflineBanner,
  SessionTimer,
  TemplateSelector,
  BoothLayout,
  PrintUpsellModal,
  CompletedScreen,
  ProcessingScreen,
} from '@/components/booth/BoothComponents'
import { sendGalleryNotification } from '@/lib/whatsapp-service'
import { compositeToRamadanFrame } from '@/lib/photo-compositor'
import { useRouter } from 'next/navigation'

// ============================================
// Demo Templates (Ramadhan Theme)
// ============================================

const demoTemplates: Template[] = [
  {
    id: 'ramadhan-1',
    name: 'Ramadhan Kareem',
    theme: 'Ramadhan',
    imageUrl: '/photos/FRAME 5.png',
    thumbnailUrl: '/photos/FRAME 5.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'ramadhan-2',
    name: 'Eid Mubarak',
    theme: 'Ramadhan',
    imageUrl: '/photos/FRAME 4.png',
    thumbnailUrl: '/photos/FRAME 4.png',
    slots: 6,
    layout: 'grid-2x3',
  },
  {
    id: 'ramadhan-3',
    name: 'Lantern Night',
    theme: 'Ramadhan',
    imageUrl: '/photos/FRAME 5.png',
    thumbnailUrl: '/photos/FRAME 5.png',
    slots: 6,
    layout: 'grid-2x3',
  },
]

// ============================================
// Demo Config
// ============================================

const demoConfig = {
  outletId: 'demo-outlet',
  outletName: 'SnapNext Demo',
  machineId: 'MACHINE-001',
  printEnabled: true,
  galleryEnabled: true,
  gifEnabled: false,
  newspaperEnabled: false,
  defaultPrice: 50000,
  paymentMethods: {
    qris: true,
    voucher: true,
    event: true,
  },
  countdownDuration: 8,
  burstCount: 3,
  gifFrames: 0,
  sessionTimeout: 540, // 9 minutes
}

// ============================================
// Main Booth Page
// ============================================

export default function BoothPage() {
  const router = useRouter()
  const {
    session,
    config,
    startSession,
    setCountdown,
    addPhoto,
    setProcessing,
    setPreview,
    setPayment,
    setPaymentStatus,
    setCompleted,
    resetSession,
    setFrame,
    setOffline,
    setCustomerPhone,
    startSessionTimer,
    stopSessionTimer,
    decrementSessionTimer,
    setTemplate,
    setTemplateSelection,
    setPrinting,
    setPrintCopies,
    setTransactionRef,
    setSelectedFilter,
  } = useBoothStore()

  const { qrisString, setQrisString, clearQris, setQrisPolling, applyVoucher, clearVoucher } = usePaymentStore()

  const [showQrisModal, setShowQrisModal] = useState(false)
  const [showPrintUpsell, setShowPrintUpsell] = useState(false)
  const [showAdditionalPayment, setShowAdditionalPayment] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureCountdown, setCaptureCountdown] = useState(8)
  const [capturedPhotos, setCapturedPhotos] = useState<Photo[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize session on mount
  useEffect(() => {
    if (!session.code) {
      startSession(demoConfig.outletId)
    }
  }, [])

  // Handle network status
  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOffline])

  // Global Session Timer (9 minutes) - returns to payment when expired
  useEffect(() => {
    if (session.sessionTimerActive && session.sessionTimer > 0) {
      timerRef.current = setInterval(() => {
        decrementSessionTimer()
      }, 1000)
    } else if (session.sessionTimerActive && session.sessionTimer <= 0) {
      // Timer expired - return to payment page
      handleSessionTimeout()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [session.sessionTimerActive, session.sessionTimer, decrementSessionTimer])

  // Handle session timeout - go back to payment
  const handleSessionTimeout = useCallback(() => {
    stopSessionTimer()
    setCapturedPhotos([])
    setIsCapturing(false)
    setCaptureCountdown(8)
    // Reset to payment status (keep the session code)
    useBoothStore.setState((state) => ({
      session: {
        ...state.session,
        status: 'payment',
        sessionTimerActive: false,
        sessionTimer: 540,
        photos: [],
        currentPhotoIndex: 0,
        paymentStatus: 'pending',
      },
    }))
  }, [stopSessionTimer])

  // Burst Capture Logic with 8-second countdown
  useEffect(() => {
    if (isCapturing && session.status === 'capturing') {
      if (captureCountdown > 0) {
        captureTimerRef.current = setTimeout(() => {
          setCaptureCountdown(captureCountdown - 1)
        }, 1000)
      } else {
        // Take photo when countdown reaches 0
        // The actual capture is done by the camera component, we just track countdown
        console.log('Photo capture triggered at countdown 0')
      }
    }

    return () => {
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current)
      }
    }
  }, [isCapturing, captureCountdown, session.status])

  // Handle photo capture from camera
  const handlePhotoCapture = useCallback((photo: Photo) => {
    // Find first null slot and replace it, or append if no nulls
    const newPhotos = [...capturedPhotos]
    const nullIndex = newPhotos.findIndex(p => p === null)
    
    if (nullIndex !== -1) {
      // Replace the null slot - update store's photo as well
      newPhotos[nullIndex] = photo
      // Update the photo in store at that index
      const storePhotos = [...(useBoothStore.getState().session.photos || [])]
      if (storePhotos[nullIndex]) {
        storePhotos[nullIndex] = photo
      }
    } else {
      // Append new photo
      newPhotos.push(photo)
    }
    
    setCapturedPhotos(newPhotos)

    // Check if all 3 photos are taken (non-null)
    const validPhotoCount = newPhotos.filter(p => p).length
    if (validPhotoCount >= 3) {
      setIsCapturing(false)
      // Don't auto-proceed - stay on capture screen
    } else {
      // Reset countdown for next photo
      setCaptureCountdown(8)
    }
  }, [capturedPhotos])

  // Handle payment selection
  const handlePaymentSelect = async (method: 'qris' | 'voucher' | 'event') => {
    setPayment(method)

    if (method === 'event') {
      // Event/Test mode - bypass payment, go directly to template selection
      setPaymentStatus('paid')
      startSessionTimer()
      setTemplateSelection()
    } else if (method === 'qris') {
      // Generate QRIS via Doku API
      try {
        const response = await fetch('/api/payment/qris', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: demoConfig.defaultPrice,
            orderId: session.code,
            customerPhone: session.customerPhone,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setQrisString(data.qrString, new Date(data.expiresAt), data.transactionRef)
          setTransactionRef(data.transactionRef)
          setShowQrisModal(true)
          setQrisPolling(true)

          // Start polling for payment status
          startPaymentPolling(data.transactionRef)
        }
      } catch (error) {
        console.error('QRIS generation failed:', error)
        // Fallback to demo mode
        const demoQris = `demo://qris?amount=${demoConfig.defaultPrice}&order=${session.code}`
        setQrisString(demoQris, new Date(Date.now() + 30 * 60 * 1000), `DEMO-${session.code}`)
        setTransactionRef(`DEMO-${session.code}`)
        setShowQrisModal(true)
      }
    } else if (method === 'voucher') {
      // Voucher - go directly to template selection (voucher already applied)
      setPaymentStatus('paid')
      startSessionTimer()
      setTemplateSelection()
    }
  }

  // Payment polling for QRIS
  const startPaymentPolling = (transactionRef: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status?ref=${transactionRef}`)
        const data = await response.json()

        if (data.status === 'success') {
          clearInterval(pollInterval)
          setPaymentStatus('paid')
          setQrisPolling(false)
          setShowQrisModal(false)
          clearQris()
          startSessionTimer()
          setTemplateSelection()
        } else if (data.status === 'failed') {
          clearInterval(pollInterval)
          setPaymentStatus('failed')
          setQrisPolling(false)
        }
      } catch (error) {
        console.error('Payment polling error:', error)
      }
    }, 3000) // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      setQrisPolling(false)
    }, 5 * 60 * 1000)
  }

  // Handle QRIS payment confirmation (demo mode)
  const handleQrisConfirm = () => {
    setPaymentStatus('paid')
    setQrisPolling(false)
    setShowQrisModal(false)
    clearQris()
    startSessionTimer()
    setTemplateSelection()
  }

  // Handle QRIS cancel
  const handleQrisCancel = () => {
    setShowQrisModal(false)
    setQrisPolling(false)
    clearQris()
    setPaymentStatus('pending')
  }

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setTemplate(template)
    // Start the global session timer when template is selected
    startSessionTimer()
    // Move to capturing status
    useBoothStore.getState().setCapturing()
  }

  // Handle start capture (burst sequence)
  const handleStartCapture = () => {
    setIsCapturing(true)
    setCaptureCountdown(8)
  }

  // Handle retake - reset all photos
  const handleRetake = () => {
    setCapturedPhotos([])
    setIsCapturing(false)
    setCaptureCountdown(8)
    useBoothStore.setState((state) => ({
      session: {
        ...state.session,
        photos: [],
        currentPhotoIndex: 0,
        status: 'capturing',
      },
    }))
  }

  // Handle retake specific photo (index) - preserves other photos' positions
  const handleRetakePhoto = (index: number) => {
    const newPhotos = [...capturedPhotos]
    // Set the specific photo to null (will show placeholder)
    newPhotos[index] = null as unknown as Photo
    setCapturedPhotos(newPhotos)
    
    // Update store
    useBoothStore.setState((state) => ({
      session: {
        ...state.session,
        photos: newPhotos,
        // Keep currentPhotoIndex at the original count (don't reduce)
        // This allows user to continue from where they are
      },
    }))
  }

  // Handle finish capture - proceed to processing and preview
  const handleFinishCapture = () => {
    // Filter out null photos
    const validPhotos = capturedPhotos.filter(p => p)
    
    // Copy captured photos to store
    useBoothStore.setState((state) => ({
      session: {
        ...state.session,
        photos: validPhotos,
        currentPhotoIndex: validPhotos.length,
      },
    }))
    
    // Go to processing then preview
    setProcessing()
    setTimeout(() => setPreview(), 2000)
  }

  // Handle print - sends directly to thermal printer without dialog
  const handlePrint = async () => {
    // Generate composite and print directly
    if (session.photos.length >= 3 && session.template) {
      setPrinting()
      setShowPrintUpsell(false)
      
      try {
        // Generate composite image
        const photoUrls = session.photos.map(p => p.url || p.base64 || '').filter(Boolean)
        // Pass the selected filter to compositor (applied to photos only, not frame)
        const compositeUrl = await compositeToRamadanFrame(
          session.template.imageUrl, 
          photoUrls,
          1080, 
          1920,
          session.selectedFilter && session.selectedFilter !== 'none' ? session.selectedFilter : undefined
        )
        
        // Send to thermal printer API
        const response = await fetch('/api/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: compositeUrl,
            copies: session.printCopies || 1
          })
        })

        const result = await response.json()
        
        if (result.success) {
          console.log('Print sent successfully:', result.message)
        } else {
          console.error('Print failed:', result.error)
        }
        
        // Complete session after printing
        setTimeout(() => {
          const galleryCode = generateGalleryCode()
          setCompleted(galleryCode)

          // Send WhatsApp notification if phone number provided
          if (session.customerPhone) {
            sendGalleryNotification({
              phoneNumber: session.customerPhone,
              outletName: demoConfig.outletName,
              galleryCode,
              galleryUrl: `https://snapnext.com/gallery/${galleryCode}`,
              photoCount: 3,
            })
          }
        }, 1500)
        
      } catch (error) {
        console.error('Print error:', error)
        setTimeout(() => {
          const galleryCode = generateGalleryCode()
          setCompleted(galleryCode)
        }, 2000)
      }
    }
  }

  // Handle print copies update
  const handleUpdateCopies = (copies: number) => {
    setPrintCopies(copies)
  }

  // Handle print confirm - for additional copies payment
  const handlePrintConfirm = () => {
    if (session.printCopies > 1) {
      // Show additional payment for extra copies
      setShowAdditionalPayment(true)
    } else {
      // Proceed with printing 1 copy and complete
      handlePrintAndComplete()
    }
  }

  // Print and complete session (no extra copies)
  const handlePrintAndComplete = () => {
    setShowPrintUpsell(false)
    handlePrint()
  }

  // Handle additional payment complete
  const handleAdditionalPaymentComplete = () => {
    setShowAdditionalPayment(false)
    setShowPrintUpsell(false)
    // Print and complete
    handlePrint()
  }

  // Proceed with printing - direct print
  const proceedWithPrinting = () => {
    handlePrint()
  }

  // Handle print cancel - could be finish or proceed with 1 copy
  const handlePrintCancel = () => {
    setShowPrintUpsell(false)
    setShowAdditionalPayment(false)
    // Complete the session without additional prints
    const galleryCode = generateGalleryCode()
    setCompleted(galleryCode)

    // Send WhatsApp notification if phone number provided
    if (session.customerPhone) {
      sendGalleryNotification({
        phoneNumber: session.customerPhone,
        outletName: demoConfig.outletName,
        galleryCode,
        galleryUrl: `https://snapnext.com/gallery/${galleryCode}`,
        photoCount: 3,
      })
    }
  }

  // Handle done - go back to payment screen for next customer
  const handleDone = () => {
    resetSession()
    stopSessionTimer()
    setCapturedPhotos([])
    // Go directly to payment status (without navigating)
    // Keep the current timer value for next customer to continue
    useBoothStore.setState((state) => ({
      session: {
        ...state.session,
        status: 'payment',
        paymentMethod: null,
        paymentStatus: 'pending',
        photos: [],
        currentPhotoIndex: 0,
        galleryCode: undefined,
        // Don't reset timer - it will continue when next customer starts
      },
    }))
  }

  // Generate gallery code
  const generateGalleryCode = () => {
    return `${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  }

  return (
    <div className="min-h-screen bg-black">
      <OfflineBanner />

      {/* Session Timer */}
      <SessionTimer
        seconds={session.sessionTimer}
        active={session.sessionTimerActive}
      />

      {/* Payment Selection */}
      {session.status === 'payment' && (
        <PaymentSelector
          totalPrice={demoConfig.defaultPrice}
          onSelect={handlePaymentSelect}
          config={demoConfig.paymentMethods}
          customerPhone={session.customerPhone || ''}
          onPhoneChange={setCustomerPhone}
        />
      )}

      {/* QRIS Display */}
      {showQrisModal && qrisString && (
        <QrisDisplay
          qrString={qrisString}
          amount={demoConfig.defaultPrice}
          onComplete={handleQrisConfirm}
          onCancel={handleQrisCancel}
        />
      )}

      {/* Template Selection */}
      {session.status === 'template-selection' && (
        <TemplateSelector
          templates={demoTemplates}
          onSelect={handleTemplateSelect}
          sessionTimerActive={session.sessionTimerActive}
          sessionTimerSeconds={session.sessionTimer}
        />
      )}

      {/* Capturing - Booth Layout */}
      {(session.status === 'capturing' || session.status === 'countdown') && (
        <BoothLayout
          onCapture={handlePhotoCapture}
          onRetakePhoto={handleRetakePhoto}
          template={session.template}
          photos={capturedPhotos}
          currentPhotoIndex={capturedPhotos.filter(p => p).length}
          totalPhotos={3}
          countdownValue={captureCountdown}
          isCountdown={isCapturing && captureCountdown > 0}
          onStartCapture={handleStartCapture}
          onFinishCapture={handleFinishCapture}
        />
      )}

      {/* Processing */}
      {session.status === 'processing' && <ProcessingScreen />}

      {/* Preview */}
      {session.status === 'preview' && session.photos.length > 0 && (
        <PhotoPreview
          photos={session.photos}
          template={session.template}
          onRetake={handleRetake}
          onPrint={() => {
            // When clicking "Cetak Sekarang", show extra copies option
            setShowPrintUpsell(true)
          }}
          onContinue={() => {
            // After photos are ready, user can choose to print or skip
            // Show extra print option
            setShowPrintUpsell(true)
          }}
        />
      )}

      {/* Print Upsell Modal - For extra copies after initial print or skipping */}
      {showPrintUpsell && (
        <PrintUpsellModal
          currentCopies={session.printCopies}
          pricePerCopy={10000}
          onUpdateCopies={handleUpdateCopies}
          onConfirm={handlePrintConfirm}
          onCancel={handlePrintCancel}
          showPayment={showAdditionalPayment}
          onPaymentComplete={handleAdditionalPaymentComplete}
        />
      )}

      {/* Printing */}
      {session.status === 'printing' && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Mencetak foto...</p>
            <p className="text-gray-400 text-sm mt-2">{session.printCopies} copy</p>
          </div>
        </div>
      )}

      {/* Completed */}
      {session.status === 'completed' && (
        <CompletedScreen
          galleryCode={session.galleryCode || ''}
          customerPhone={session.customerPhone}
          onDone={handleDone}
        />
      )}
    </div>
  )
}
