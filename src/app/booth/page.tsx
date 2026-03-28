'use client'

import { useEffect, useState } from 'react'
import { useBoothStore, usePaymentStore, type Photo, type Frame } from '@/lib/stores/booth-store'
import { CameraView, Countdown, ShutterButton, PaymentSelector, QrisDisplay, PhotoPreview, OfflineBanner } from '@/components/booth/BoothComponents'

// ============================================
// Main Booth Page
// ============================================

export default function BoothPage() {
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
  } = useBoothStore()

  const { qrisString } = usePaymentStore()

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

  // Countdown timer
  useEffect(() => {
    if (session.status === 'countdown' && session.countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdown(session.countdownValue - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (session.status === 'countdown' && session.countdownValue === 0) {
      // Take photo automatically when countdown finishes
      setCapturing()
    }
  }, [session.status, session.countdownValue, setCountdown])

  const setCapturing = () => {
    // Capture photo logic
    const photo: Photo = {
      id: crypto.randomUUID(),
      url: '', // Would be actual captured image
      timestamp: Date.now(),
    }
    addPhoto(photo)
    
    // Check if burst complete
    if (session.currentPhotoIndex + 1 >= session.totalPhotos) {
      setProcessing()
      // Simulate processing
      setTimeout(() => setPreview(), 2000)
    }
  }

  const handleShutter = () => {
    if (session.status === 'idle') {
      startSession('demo-outlet')
      setCountdown(3)
    } else if (session.status === 'capturing') {
      setCountdown(3)
    }
  }

  const handlePaymentSelect = (method: 'cash' | 'qris' | 'voucher') => {
    setPayment(method)
    if (method === 'cash') {
      // Simulate cash payment
      setPaymentStatus('paid')
      setCompleted('ABC123')
    }
  }

  const handleRetake = () => {
    resetSession()
  }

  const handleProceed = () => {
    // Move to payment
  }

  // Demo config
  const demoConfig = {
    outletId: 'demo-outlet',
    machineId: 'MACHINE-001',
    printEnabled: true,
    galleryEnabled: true,
    gifEnabled: true,
    newspaperEnabled: false,
    burstEnabled: true,
    burstCount: 4,
    countdownDuration: 3,
    sessionTimeout: 300,
    paymentConfig: {
      cash: true,
      qris: true,
      voucher: true,
    },
    pricing: {
      single: 15000,
      burst: 50000,
      gif: 25000,
      newspaper: 35000,
    },
  }

  return (
    <div className="min-h-screen bg-black">
      <OfflineBanner />
      
      {/* Camera View */}
      {(session.status === 'idle' || session.status === 'capturing' || session.status === 'countdown') ? (
        <div className="relative h-screen">
          <CameraView
            onCapture={(photo) => addPhoto(photo)}
            frame={session.frame}
            mode={session.mode}
            burstCount={demoConfig.burstCount}
          />
          
          {/* Shutter Button */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ShutterButton
              onClick={handleShutter}
              disabled={session.status === 'countdown'}
              mode={session.mode}
            />
          </div>
          
          {/* Countdown Overlay */}
          {session.status === 'countdown' && (
            <Countdown
              value={session.countdownValue}
              onComplete={() => {}}
            />
          )}
        </div>
      ) : null}

      {/* Processing */}
      {session.status === 'processing' && (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Processing your photos...</p>
          </div>
        </div>
      )}

      {/* Preview */}
      {session.status === 'preview' && session.photos.length > 0 && (
        <PhotoPreview
          photos={session.photos}
          frame={session.frame}
          onRetake={handleRetake}
          onProceed={handleProceed}
        />
      )}

      {/* Payment */}
      {session.status === 'payment' && (
        <PaymentSelector
          totalPrice={demoConfig.pricing[session.mode]}
          onSelect={handlePaymentSelect}
          config={demoConfig.paymentConfig}
        />
      )}

      {/* QRIS Display */}
      {session.status === 'payment' && session.paymentMethod === 'qris' && qrisString && (
        <QrisDisplay
          qrString={qrisString}
          amount={demoConfig.pricing[session.mode]}
          onComplete={() => {}}
        />
      )}

      {/* Completed */}
      {session.status === 'completed' && (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-4">Your photos are ready</p>
            <p className="text-sm text-gray-500">Code: {session.galleryCode}</p>
          </div>
        </div>
      )}
    </div>
  )
}
