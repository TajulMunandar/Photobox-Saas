'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, CreditCard, Download, Share2, Printer, RefreshCw, Clock, Wifi, WifiOff, ChevronLeft, ChevronRight, Phone, Timer, Check, X, Plus, Minus } from 'lucide-react'
import { useBoothStore, usePaymentStore, type Photo, type Template } from '@/lib/stores/booth-store'
import { compositeToRamadanFrame, generateCompositeThumbnail } from '@/lib/photo-compositor'

// ============================================
// Session Timer Component
// ============================================

interface SessionTimerProps {
  seconds: number
  active: boolean
}

export function SessionTimer({ seconds, active }: SessionTimerProps) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  if (!active) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2"
    >
      <Timer className="w-5 h-5 text-yellow-400" />
      <span className="text-white font-mono text-lg">
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </motion.div>
  )
}

// ============================================
// Booth Camera Component
// ============================================

interface CameraViewProps {
  onCapture: (photo: Photo) => void
  frame?: { imageUrl: string }
  mode: 'single' | 'burst' | 'gif'
  burstCount: number
  captureTrigger?: number // When this changes, trigger a capture
}

export function CameraView({ onCapture, frame, captureTrigger }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<string[]>(['none'])
  const [lastCaptureTime, setLastCaptureTime] = useState<number>(0)

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
        setError('Kamera tidak tersedia atau akses ditolak')
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

  // Handle capture trigger
  useEffect(() => {
    if (captureTrigger && captureTrigger > 0 && captureTrigger !== lastCaptureTime) {
      setLastCaptureTime(captureTrigger)
      capturePhoto()
    }
  }, [captureTrigger, lastCaptureTime])

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
    single: 'Ambil Foto',
    burst: 'Ambil Foto',
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
  onSelect: (method: 'qris' | 'voucher' | 'event') => void
  config: {
    qris: boolean
    voucher: boolean
    event: boolean
  }
  customerPhone: string
  onPhoneChange: (phone: string) => void
}

export function PaymentSelector({ totalPrice, onSelect, config, customerPhone, onPhoneChange }: PaymentSelectorProps) {
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherError, setVoucherError] = useState('')
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const { applyVoucher, voucherDiscount, voucherApplied } = usePaymentStore()

  const finalPrice = totalPrice - voucherDiscount

  const handleVoucherApply = () => {
    if (!voucherCode || voucherCode.length < 4) {
      setVoucherError('Kode voucher minimal 4 karakter')
      return
    }
    
    setIsApplyingVoucher(true)
    setVoucherError('')
    
    // Simulate voucher validation
    setTimeout(() => {
      // Demo: accept any code starting with 'FREE' or 'TEST'
      if (voucherCode.toUpperCase().startsWith('FREE') || voucherCode.toUpperCase().startsWith('TEST')) {
        applyVoucher(voucherCode, totalPrice) // Full discount for demo
        setIsApplyingVoucher(false)
      } else {
        setVoucherError('Kode voucher tidak valid')
        setIsApplyingVoucher(false)
      }
    }, 1000)
  }

  const handleVoucherContinue = () => {
    if (voucherApplied) {
      onSelect('voucher')
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Pilih Pembayaran</h2>
          <p className="text-gray-500">Selesaikan pembayaran untuk memulai sesi foto</p>
        </div>
        
        {/* WhatsApp Number Input - Optional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Nomor WhatsApp <span className="text-gray-400">(Opsional)</span>
          </label>
          <input
            type="tel"
            placeholder="Contoh: 08123456789"
            value={customerPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Untuk kirim link galeri via WhatsApp</p>
        </div>

        {/* Total */}
        <div className="text-center mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
          <p className="text-gray-500 text-sm">Total Pembayaran</p>
          <p className="text-3xl font-bold text-purple-600">
            {voucherApplied ? (
              <span className="line-through text-gray-400 mr-2">Rp {totalPrice.toLocaleString('id-ID')}</span>
            ) : null}
            Rp {finalPrice.toLocaleString('id-ID')}
          </p>
          {voucherApplied && (
            <p className="text-green-600 text-sm mt-1">✓ Voucher applied: {voucherCode.toUpperCase()}</p>
          )}
        </div>

        {/* Payment Methods - Horizontal Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {config.qris && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('qris')}
              className="relative p-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white hover:border-blue-500 hover:shadow-lg transition-all flex flex-col items-center justify-center gap-3 min-h-[140px]"
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" fill="#3B82F6"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" fill="#10B981"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" fill="#F59E0B"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" fill="#EF4444"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800">QRIS</p>
                <p className="text-xs text-gray-500">Scan QR</p>
              </div>
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-blue-500"></div>
            </motion.button>
          )}

          {config.voucher && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!voucherApplied) {
                  document.getElementById('voucher-input')?.focus()
                } else {
                  onSelect('voucher')
                }
              }}
              className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 min-h-[140px] ${
                voucherApplied 
                  ? 'border-green-500 bg-gradient-to-b from-green-50 to-white' 
                  : 'border-purple-200 bg-gradient-to-b from-purple-50 to-white hover:border-purple-400 hover:shadow-lg'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                voucherApplied ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <Sparkles className={`w-8 h-8 ${voucherApplied ? 'text-green-600' : 'text-purple-600'}`} />
              </div>
              <div className="text-center">
                <p className={`font-bold ${voucherApplied ? 'text-green-700' : 'text-gray-800'}`}>
                  {voucherApplied ? 'Voucher' : 'Gunakan'}
                </p>
                <p className="text-xs text-gray-500">
                  {voucherApplied ? '✓ Terpakai' : 'Kode Voucher'}
                </p>
              </div>
              {voucherApplied && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.button>
          )}

          {config.event && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('event')}
              className="relative p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-b from-green-50 to-white hover:border-green-500 hover:shadow-lg transition-all flex flex-col items-center justify-center gap-3 min-h-[140px]"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800">Event</p>
                <p className="text-xs text-gray-500">Tanpa Bayar</p>
              </div>
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            </motion.button>
          )}
        </div>

        {/* Voucher Input - Show if voucher selected and not applied */}
        {!voucherApplied && config.voucher && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className="flex gap-2">
              <input
                id="voucher-input"
                type="text"
                placeholder="Masukkan kode voucher"
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value.toUpperCase())
                  setVoucherError('')
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-center font-mono tracking-wider"
              />
              <button
                onClick={handleVoucherApply}
                disabled={isApplyingVoucher || !voucherCode}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplyingVoucher ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : 'Gunakan'}
              </button>
            </div>
            {voucherError && (
              <p className="text-red-500 text-sm mt-2 text-center">{voucherError}</p>
            )}
          </motion.div>
        )}

        {/* Voucher Applied - Show Continue Button */}
        {voucherApplied && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleVoucherContinue}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-colors shadow-lg shadow-green-500/30"
          >
            Lanjutkan dengan Voucher ✓
          </motion.button>
        )}
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
  onCancel: () => void
}

export function QrisDisplay({ qrString, amount, onComplete, onCancel }: QrisDisplayProps) {
  const { qrisExpiry, qrisPolling, setQrisPolling } = usePaymentStore()

  // Simulate QR display (in production use a proper QR generator)
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
      >
        <h2 className="text-2xl font-bold mb-2">Scan untuk Bayar</h2>
        <p className="text-gray-500 mb-6">Scan QR code ini dengan aplikasi banking Anda</p>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg">
          <img src={qrDataUrl} alt="QRIS" className="w-64 h-64" />
        </div>

        {/* Amount */}
        <p className="text-3xl font-bold mb-4 text-purple-600">Rp {amount.toLocaleString('id-ID')}</p>

        {/* Timer */}
        {qrisExpiry && (
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <Clock className="w-4 h-4" />
            <span>Kadaluarsa: {Math.max(0, Math.floor((qrisExpiry.getTime() - Date.now()) / 1000))}s</span>
          </div>
        )}

        {/* Status */}
        {qrisPolling && (
          <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Menunggu pembayaran...</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onComplete}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-400 hover:to-purple-500 transition-colors"
          >
            Sudah Bayar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// Template Selection Component
// ============================================

interface TemplateSelectorProps {
  templates: Template[]
  onSelect: (template: Template) => void
  sessionTimerActive?: boolean
  sessionTimerSeconds?: number
}

export function TemplateSelector({ templates, onSelect, sessionTimerActive, sessionTimerSeconds }: TemplateSelectorProps) {
  const minutes = sessionTimerSeconds ? Math.floor(sessionTimerSeconds / 60) : 9
  const secs = sessionTimerSeconds ? sessionTimerSeconds % 60 : 0

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
      {/* Timer - Always visible at top right */}
      <div className="fixed top-4 right-4 z-[60] bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
        <Timer className="w-5 h-5 text-yellow-400" />
        <span className="text-white font-mono text-lg">
          {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-4xl w-full"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Pilih Template</h2>
        <p className="text-gray-500 text-center mb-6">Pilih template Ramadhan untuk sesi foto Anda</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template)}
              className="relative group rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-all"
            >
              <img
                src={template.thumbnailUrl || template.imageUrl}
                alt={template.name}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="font-bold">{template.name}</p>
                  <p className="text-sm text-gray-300">{template.theme}</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3">
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// Booth Layout Component (Camera + Template Preview)
// ============================================

interface BoothLayoutProps {
  onCapture: (photo: Photo) => void
  onRetakePhoto: (index: number) => void
  template?: Template
  photos: Photo[]
  currentPhotoIndex: number
  totalPhotos: number
  countdownValue: number
  isCountdown: boolean
  onStartCapture: () => void
  onFinishCapture: () => void
}

export function BoothLayout({
  onCapture,
  onRetakePhoto,
  template,
  photos,
  currentPhotoIndex,
  totalPhotos,
  countdownValue,
  isCountdown,
  onStartCapture,
  onFinishCapture,
}: BoothLayoutProps) {
  const [captureTrigger, setCaptureTrigger] = useState(0)
  const [showCountdownOverlay, setShowCountdownOverlay] = useState(false)
  const [currentCountdown, setCurrentCountdown] = useState(8)
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle countdown for each photo
  useEffect(() => {
    if (isCountdown && countdownValue > 0) {
      setShowCountdownOverlay(true)
      setCurrentCountdown(countdownValue)
      
      captureTimerRef.current = setTimeout(() => {
        // Capture the photo
        setCaptureTrigger(Date.now())
      }, countdownValue * 1000)
    } else if (!isCountdown) {
      setShowCountdownOverlay(false)
    }

    return () => {
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current)
      }
    }
  }, [isCountdown, countdownValue])

  // Show current countdown value
  useEffect(() => {
    if (isCountdown) {
      setCurrentCountdown(countdownValue)
    }
  }, [isCountdown, countdownValue])

  return (
    <div className="h-screen flex">
      {/* Left Side - Camera Preview */}
      <div className="flex-1 relative bg-black">
        <CameraView
          onCapture={onCapture}
          frame={undefined}
          mode="burst"
          burstCount={totalPhotos}
          captureTrigger={captureTrigger}
        />

        {/* Capture Button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ShutterButton
            onClick={onStartCapture}
            disabled={isCountdown}
            mode="burst"
          />
        </div>

        {/* Photo Counter */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white">
          <span className="font-bold">{photos.filter(p => p).length}</span>
          <span className="text-gray-400"> / {totalPhotos}</span>
        </div>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {isCountdown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <motion.div
                key={currentCountdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-center"
              >
                <span className="countdown-number text-8xl text-white font-bold">
                  {currentCountdown}
                </span>
                <p className="text-white text-xl mt-4">
                  Foto {photos.filter(p => p).length + 1} dari {totalPhotos}
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side - Template Preview */}
      <div className="w-1/3 bg-gradient-to-br from-purple-900 to-pink-900 p-4 flex flex-col">
        <h3 className="text-white text-center font-bold mb-4">Preview Template</h3>
        
        {template ? (
          <div className="flex-1 relative bg-white rounded-xl overflow-hidden">
            {/* Template Frame - at bottom */}
            <img
              src={template.imageUrl}
              alt={template.name}
              className="absolute inset-0 w-full h-full object-contain z-0"
            />

            {/* Photo Placeholders - 6 slots (3 rows × 2 columns) - above frame */}
            {/* Each captured photo fills 2 slots (left and right in each row) */}
            <div className="absolute inset-0 grid grid-rows-3 gap-1 p-8 z-10">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => photos[0] && onRetakePhoto(0)}
                  disabled={!photos[0]}
                  className={`relative rounded overflow-hidden ${photos[0] ? 'bg-transparent cursor-pointer group' : 'bg-white/20 border-2 border-dashed border-white/40 cursor-default'}`}
                >
                  {photos[0] ? (
                    <>
                      <img src={photos[0].url || photos[0].base64} alt="Foto 1" className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <span className="text-white text-sm font-medium">Hapus</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs">Foto 1</div>
                  )}
                </button>
                <button
                  onClick={() => photos[0] && onRetakePhoto(0)}
                  disabled={!photos[0]}
                  className={`relative rounded overflow-hidden ${photos[0] ? 'bg-transparent cursor-pointer group' : 'bg-white/20 border-2 border-dashed border-white/40 cursor-default'}`}
                >
                  {photos[0] ? (
                    <>
                      <img src={photos[0].url || photos[0].base64} alt="Foto 1" className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <span className="text-white text-sm font-medium">Hapus</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs">Foto 1</div>
                  )}
                </button>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => photos[1] && onRetakePhoto(1)}
                  disabled={!photos[1]}
                  className={`relative rounded overflow-hidden ${photos[1] ? 'bg-transparent cursor-pointer group' : 'bg-white/20 border-2 border-dashed border-white/40 cursor-default'}`}
                >
                  {photos[1] ? (
                    <>
                      <img src={photos[1].url || photos[1].base64} alt="Foto 2" className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <span className="text-white text-sm font-medium">Hapus</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs">Foto 2</div>
                  )}
                </button>
                <button
                  onClick={() => photos[1] && onRetakePhoto(1)}
                  disabled={!photos[1]}
                  className={`relative rounded overflow-hidden ${photos[1] ? 'bg-transparent cursor-pointer group' : 'bg-white/20 border-2 border-dashed border-white/40 cursor-default'}`}
                >
                  {photos[1] ? (
                    <>
                      <img src={photos[1].url || photos[1].base64} alt="Foto 2" className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <span className="text-white text-sm font-medium">Hapus</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs">Foto 2</div>
                  )}
                </button>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => photos[2] && onRetakePhoto(2)}
                  disabled={!photos[2]}
                  className={`relative rounded overflow-hidden ${photos[2] ? 'bg-transparent cursor-pointer group' : 'bg-white/20 border-2 border-dashed border-white/40 cursor-default'}`}
                >
                  {photos[2] ? (
                    <>
                      <img src={photos[2].url || photos[2].base64} alt="Foto 3" className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <span className="text-white text-sm font-medium">Hapus</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs">Foto 3</div>
                  )}
                </button>
                <button
                  onClick={() => photos[2] && onRetakePhoto(2)}
                  disabled={!photos[2]}
                  className={`relative rounded overflow-hidden ${photos[2] ? 'bg-transparent cursor-pointer group' : 'bg-white/20 border-2 border-dashed border-white/40 cursor-default'}`}
                >
                  {photos[2] ? (
                    <>
                      <img src={photos[2].url || photos[2].base64} alt="Foto 3" className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <span className="text-white text-sm font-medium">Hapus</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs">Foto 3</div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/60">
            <p>Pilih template untuk melihat preview</p>
          </div>
        )}

        {/* Instructions and Finish Button */}
        <div className="mt-4 bg-white/10 rounded-xl p-4">
          <p className="text-white text-sm text-center mb-3">
            {photos.filter(p => p).length === 0 && 'Tekan tombol untuk memulai foto burst'}
            {photos.filter(p => p).length > 0 && photos.filter(p => p).length < totalPhotos && `Ambil ${totalPhotos - photos.filter(p => p).length} foto lagi`}
            {photos.filter(p => p).length === totalPhotos && 'Semua foto selesai! Tekan foto untuk retake.'}
          </p>
          {photos.filter(p => p).length === totalPhotos && (
            <button
              onClick={onFinishCapture}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-colors"
            >
              Lanjut ke Filter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Photo Preview Component
// ============================================

interface PhotoPreviewProps {
  photos: Photo[]
  template?: Template
  onRetake: () => void
  onPrint: () => void
  onContinue?: () => void
}

export function PhotoPreview({ photos, template, onRetake, onPrint, onContinue }: PhotoPreviewProps) {
  const { session } = useBoothStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [compositeImage, setCompositeImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const selectedFilter = session.selectedFilter || 'none'
  
  const filters = [
    { id: 'none', name: 'Normal' },
    { id: 'grayscale(100%)', name: 'B&W' },
    { id: 'sepia(100%)', name: 'Vintage' },
    { id: 'contrast(1.2)', name: 'Dramatic' },
    { id: 'brightness(1.1)', name: 'Bright' },
  ]
  const { setSelectedFilter } = useBoothStore()

  // Generate composite when photos or filter change
  useEffect(() => {
    if (photos.length >= 3 && template) {
      generateComposite()
    }
  }, [photos, template, selectedFilter])

  const generateComposite = async () => {
    if (!template || photos.length < 3) return
    
    setIsGenerating(true)
    try {
      const photoUrls = photos.map(p => p.url || p.base64 || '').filter(Boolean)
      // Pass filter to compositor so it applies to photos only (not frame)
      const result = await compositeToRamadanFrame(
        template.imageUrl, 
        photoUrls, 
        1080, 
        1920,
        selectedFilter !== 'none' ? selectedFilter : undefined
      )
      setCompositeImage(result)
    } catch (error) {
      console.error('Failed to generate composite:', error)
    }
    setIsGenerating(false)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 flex">
      {/* Left Side - Main Image */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold text-white">Hasil Foto</h2>
          <p className="text-white/60 text-sm">Foto sudah siap dicetak</p>
        </div>

        {/* Main Content - Full screen without scroll */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            {isGenerating ? (
              <div className="flex items-center justify-center bg-gray-100 rounded-xl w-80 h-96">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Memproses...</p>
                </div>
              </div>
            ) : compositeImage ? (
              <img
                src={compositeImage}
                alt="Composite Result"
                className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <div className="bg-white rounded-xl w-80 h-96 flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Photo Thumbnails */}
        <div className="flex gap-2 justify-center py-2 px-4">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                index === currentIndex ? 'border-yellow-400' : 'border-white/30'
              }`}
            >
              <img src={photo.url || photo.base64} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Actions - Large buttons */}
        <div className="p-4 pb-6">
          <div className="flex gap-4">
            <button
              onClick={onRetake}
              className="flex-1 py-5 rounded-2xl bg-white/20 text-white font-bold text-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-6 h-6" />
              Ulangi
            </button>
            <button
              onClick={onPrint}
              className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg hover:from-green-400 hover:to-emerald-500 transition-colors flex items-center justify-center gap-3 shadow-lg shadow-green-500/30"
            >
              <Printer className="w-6 h-6" />
              Cetak Sekarang
            </button>
          </div>
          {onContinue && (
            <button
              onClick={onContinue}
              className="w-full mt-3 py-4 rounded-2xl bg-white/10 text-white/80 font-semibold text-base hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah Cetakan / Selesai
            </button>
          )}
        </div>
      </div>

      {/* Right Side - Filter Selection */}
      <div className="w-48 bg-white/10 p-4 flex flex-col">
        <h3 className="text-white font-bold text-center mb-4">Filter</h3>
        <div className="flex-1 overflow-y-auto space-y-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                selectedFilter === filter.id
                  ? 'bg-white text-black'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Print Upsell Modal
// ============================================

interface PrintUpsellModalProps {
  currentCopies: number
  pricePerCopy: number
  onUpdateCopies: (copies: number) => void
  onConfirm: () => void
  onCancel: () => void
  showPayment: boolean
  onPaymentComplete: () => void
}

export function PrintUpsellModal({
  currentCopies,
  pricePerCopy,
  onUpdateCopies,
  onConfirm,
  onCancel,
  showPayment,
  onPaymentComplete,
}: PrintUpsellModalProps) {
  const additionalCopies = currentCopies - 1
  const additionalCost = additionalCopies * pricePerCopy

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full"
      >
        {!showPayment ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Tambah Cetakan?</h2>
            <p className="text-gray-500 text-center mb-6">Mau cetak lebih banyak?</p>

            {/* Copy Counter */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => onUpdateCopies(Math.max(1, currentCopies - 1))}
                className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Minus className="w-6 h-6" />
              </button>
              <div className="text-center">
                <p className="text-4xl font-bold">{currentCopies}</p>
                <p className="text-gray-500 text-sm">copy</p>
              </div>
              <button
                onClick={() => onUpdateCopies(currentCopies + 1)}
                className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Cost Summary */}
            {additionalCopies > 0 && (
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">1 copy (sudah termasuk)</span>
                  <span className="font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{additionalCopies} copy tambahan</span>
                  <span className="font-semibold">Rp {additionalCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total Tambahan</span>
                  <span className="font-bold text-purple-600">Rp {additionalCost.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                >
                  {additionalCopies > 0 ? 'Cukup 1 Copy' : 'Lewati'}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-400 hover:to-purple-500 transition-colors"
                >
                  {additionalCopies > 0 ? 'Bayar & Cetak' : 'Cetak'}
                </button>
              </div>
              {additionalCopies > 0 && (
                <button
                  onClick={onCancel}
                  className="w-full py-3 rounded-xl bg-white/10 text-white/80 font-medium hover:bg-white/20 transition-colors"
                >
                  Selesai (tanpa cetak tambahan)
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Pembayaran Tambahan</h2>
            <p className="text-gray-500 text-center mb-6">Scan QR untuk bayar cetakan tambahan</p>

            {/* QR Placeholder */}
            <div className="bg-gray-100 rounded-xl p-8 mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-48 h-48 bg-white rounded-lg shadow-lg mx-auto mb-4 flex items-center justify-center">
                  <p className="text-gray-400">QR Code</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">Rp {additionalCost.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={onPaymentComplete}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-400 hover:to-purple-500 transition-colors"
              >
                Sudah Bayar
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

// ============================================
// Completed Screen Component
// ============================================

interface CompletedScreenProps {
  galleryCode: string
  customerPhone?: string
  onDone: () => void
}

export function CompletedScreen({ galleryCode, customerPhone, onDone }: CompletedScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
      >
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Terima Kasih!</h2>
        <p className="text-gray-500 mb-6">Foto Anda sudah selesai dicetak</p>

        {/* Gallery Code */}
        <div className="bg-purple-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Kode Galeri</p>
          <p className="text-3xl font-bold text-purple-600 font-mono">{galleryCode}</p>
        </div>

        {/* WhatsApp Notification */}
        {customerPhone && (
          <div className="bg-green-50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-green-700">Link galeri akan dikirim</p>
              <p className="text-xs text-green-600">via WhatsApp ke {customerPhone}</p>
            </div>
          </div>
        )}

        <button
          onClick={onDone}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-400 hover:to-purple-500 transition-colors"
        >
          Selesai
        </button>
      </motion.div>
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

// ============================================
// Processing Screen Component
// ============================================

export function ProcessingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl">Memproses foto Anda...</p>
        <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  )
}
