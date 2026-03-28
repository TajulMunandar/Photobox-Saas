'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, CreditCard, Download, Share2, Printer, RefreshCw, Clock, Wifi, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { useBoothStore, usePaymentStore, type Photo, type Frame } from '@/lib/stores/booth-store'

// ============================================
// Booth Camera Component
// ============================================

interface CameraViewProps {
  onCapture: (photo: Photo) => void
  frame?: Frame
  mode: 'single' | 'burst' | 'gif'
  burstCount: number
}

export function CameraView({ onCapture, frame, mode, burstCount }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<string[]>(['none'])

  useEffect(() => {
    async function initCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user',
          },
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        setError('Camera access denied or not available')
        console.error('Camera error:', err)
      }
    }

    initCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Apply filter
    ctx.filter = filters[0] === 'none' ? 'none' : filters[0]
    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

    onCapture({
      id: crypto.randomUUID(),
      url: dataUrl,
      base64: dataUrl,
      timestamp: Date.now(),
    })
  }, [filters, onCapture])

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ filter: filters[0] === 'none' ? 'none' : filters[0] }}
      />

      {/* Frame Overlay */}
      {frame && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={frame.imageUrl}
            alt="Frame"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Canvas for capture (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          onClick={() => setFilters(['none'])}
          className={`px-4 py-2 rounded-full ${filters[0] === 'none' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          Normal
        </button>
        <button
          onClick={() => setFilters(['grayscale(100%)'])}
          className={`px-4 py-2 rounded-full ${filters[0] === 'grayscale(100%)' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          B&W
        </button>
        <button
          onClick={() => setFilters(['sepia(100%)'])}
          className={`px-4 py-2 rounded-full ${filters[0] === 'sepia(100%)' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          Vintage
        </button>
      </div>
    </div>
  )
}

// ============================================
// Countdown Component
// ============================================

interface CountdownProps {
  value: number
  onComplete: () => void
}

export function Countdown({ value, onComplete }: CountdownProps) {
  useEffect(() => {
    if (value > 0) {
      const timer = setTimeout(onComplete, 1000)
      return () => clearTimeout(timer)
    }
  }, [value, onComplete])

  return (
    <motion.div
      key={value}
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/60"
    >
      <span className="countdown-number text-white">{value}</span>
    </motion.div>
  )
}

// ============================================
// Shutter Button Component
// ============================================

interface ShutterButtonProps {
  onClick: () => void
  disabled?: boolean
  mode: 'single' | 'burst' | 'gif'
}

export function ShutterButton({ onClick, disabled, mode }: ShutterButtonProps) {
  const labels = {
    single: 'Take Photo',
    burst: 'Burst Mode',
    gif: 'GIF Mode',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        booth-button w-32 h-32 rounded-full flex items-center justify-center
        ${disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500'}
        shadow-lg shadow-purple-500/30
      `}
    >
      <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
        <Camera className="w-10 h-10 text-white" />
      </div>
    </motion.button>
  )
}

// ============================================
// Payment Selection Component
// ============================================

interface PaymentSelectorProps {
  totalPrice: number
  onSelect: (method: 'cash' | 'qris' | 'voucher') => void
  config: {
    cash: boolean
    qris: boolean
    voucher: boolean
  }
}

export function PaymentSelector({ totalPrice, onSelect, config }: PaymentSelectorProps) {
  const [voucherCode, setVoucherCode] = useState('')
  const { applyVoucher, voucherDiscount } = usePaymentStore()

  const handleVoucherApply = () => {
    // In real implementation, validate voucher via API
    if (voucherCode) {
      applyVoucher(voucherCode, 5000) // Example discount
    }
  }

  const finalPrice = totalPrice - voucherDiscount

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Select Payment</h2>
        
        {/* Total */}
        <div className="text-center mb-8">
          <p className="text-gray-500">Total Amount</p>
          <p className="text-4xl font-bold">Rp {finalPrice.toLocaleString('id-ID')}</p>
          {voucherDiscount > 0 && (
            <p className="text-green-600 text-sm">Voucher applied: -Rp {voucherDiscount.toLocaleString('id-ID')}</p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          {config.cash && (
            <button
              onClick={() => onSelect('cash')}
              className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 flex items-center gap-4 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Cash</p>
                <p className="text-sm text-gray-500">Pay at counter</p>
              </div>
            </button>
          )}

          {config.qris && (
            <button
              onClick={() => onSelect('qris')}
              className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 flex items-center gap-4 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">QRIS</p>
                <p className="text-sm text-gray-500">Scan to pay</p>
              </div>
            </button>
          )}

          {config.voucher && (
            <div className="p-4 rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Voucher</p>
                  <p className="text-sm text-gray-500">Use voucher code</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleVoucherApply}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// QRIS Display Component
// ============================================

interface QrisDisplayProps {
  qrString: string
  amount: number
  onComplete: () => void
}

export function QrisDisplay({ qrString, amount, onComplete }: QrisDisplayProps) {
  const { qrisExpiry, qrisPolling, setQrisPolling } = usePaymentStore()

  // Simulate QR display (in production use a proper QR generator)
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center"
      >
        <h2 className="text-2xl font-bold mb-2">Scan to Pay</h2>
        <p className="text-gray-500 mb-6">Scan this QR code with your banking app</p>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-xl inline-block mb-6">
          <img src={qrDataUrl} alt="QRIS" className="w-64 h-64" />
        </div>

        {/* Amount */}
        <p className="text-3xl font-bold mb-4">Rp {amount.toLocaleString('id-ID')}</p>

        {/* Timer */}
        {qrisExpiry && (
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <Clock className="w-4 h-4" />
            <span>Expires in: {Math.max(0, Math.floor((qrisExpiry.getTime() - Date.now()) / 1000))}s</span>
          </div>
        )}

        {/* Status */}
        {qrisPolling && (
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Waiting for payment...</span>
          </div>
        )}

        {/* Cancel */}
        <button
          onClick={onComplete}
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  )
}

// ============================================
// Photo Preview Component
// ============================================

interface PhotoPreviewProps {
  photos: Photo[]
  frame?: Frame
  onRetake: () => void
  onProceed: () => void
}

export function PhotoPreview({ photos, frame, onRetake, onProceed }: PhotoPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Main Preview */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={photos[currentIndex].url}
            alt={`Photo ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>

        {/* Frame Overlay */}
        {frame && (
          <img
            src={frame.imageUrl}
            alt="Frame"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="bg-black/80 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-white/20 disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="text-white">
            {currentIndex + 1} / {photos.length}
          </span>

          <button
            onClick={() => setCurrentIndex(Math.min(photos.length - 1, currentIndex + 1))}
            disabled={currentIndex === photos.length - 1}
            className="p-2 rounded-full bg-white/20 disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                index === currentIndex ? 'border-purple-500' : 'border-transparent'
              }`}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={onRetake}
            className="flex-1 py-3 rounded-xl bg-white/20 text-white font-semibold"
          >
            Retake
          </button>
          <button
            onClick={onProceed}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Offline Banner Component
// ============================================

export function OfflineBanner() {
  const { session } = useBoothStore()
  
  if (!session.isOffline) return null

  return (
    <div className="offline-banner flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span>You are offline - Photos will be queued</span>
    </div>
  )
}
