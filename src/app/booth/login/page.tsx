'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Delete,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Hash,
  ArrowLeft
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'

export default function BoothLoginPage() {
  const { branding, outlets } = useDashboardStore()
  const [step, setStep] = useState(1)
  const [deviceId, setDeviceId] = useState('')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [keypadMode, setKeypadMode] = useState<'numeric' | 'alpha'>('numeric')

  // Check cached login on mount
  useEffect(() => {
    const cached = localStorage.getItem('boothLogin')
    if (cached) {
      try {
        const data = JSON.parse(cached)
        if (data.outletId && data.timestamp) {
          window.location.href = '/booth'
        }
      } catch {}
    }
  }, [])

  const maxDeviceIdLength = 14

  const handleKeyPress = (value: string) => {
    setError('')
    if (step === 1) {
      if (deviceId.length < maxDeviceIdLength) {
        setDeviceId(prev => prev + value.toUpperCase())
      }
    } else {
      if (pin.length < 6) {
        setPin(prev => prev + value)
      }
    }
  }

  const handleDelete = () => {
    setError('')
    if (step === 1) {
      setDeviceId(prev => prev.slice(0, -1))
    } else {
      setPin(prev => prev.slice(0, -1))
    }
  }

  const handleClear = () => {
    setError('')
    if (step === 1) {
      setDeviceId('')
    } else {
      setPin('')
    }
  }

  const handleNext = () => {
    if (!deviceId || deviceId.length < 5) {
      setError('Masukkan Device ID yang valid (contoh: BOOTH-ASDA-002)')
      return
    }
    setStep(2)
    setKeypadMode('numeric')
  }

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError('PIN harus minimal 4 digit')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Authenticate with device ID and PIN
      const res = await fetch(`/api/outlets?machineId=${encodeURIComponent(deviceId)}`)
      if (!res.ok) throw new Error('Outlet not found')

      const outlets = await res.json()
      const outlet = Array.isArray(outlets) ? outlets.find((o: any) => o.pin === pin) : null

      if (!outlet) {
        setError('Device ID atau PIN salah')
        setIsLoading(false)
        return
      }

      // Set outlet as active
      await fetch(`/api/outlets/${outlet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })

      // Cache login in localStorage
      localStorage.setItem('boothLogin', JSON.stringify({
        deviceId,
        outletId: outlet.id,
        outletName: outlet.name,
        pin,
        timestamp: Date.now(),
      }))

      setSuccess('Login berhasil! Mengarahkan ke booth...')
      setTimeout(() => {
        window.location.href = '/booth'
      }, 1000)
    } catch (err) {
      setError('Gagal login. Periksa Device ID dan PIN.')
      setIsLoading(false)
    }
  }

  const alphaKeys = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M','-'],
  ]

  const numericKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫'],
  ]

  const formatDeviceId = (value: string) => {
    if (!value) return <span className="text-gray-300">BOOTH-XXXX-XXX</span>
    return value
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ 
        background: `linear-gradient(135deg, ${branding.primaryColor}10, ${branding.secondaryColor}10)`
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full">
          <defs>
            <pattern id="booth-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="80" height="80" fill="none" stroke={branding.primaryColor} strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#booth-pattern)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-4">
            {branding.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt={branding.companyName}
                className="h-14 w-auto"
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                }}
              >
                <Camera className="w-7 h-7 text-white" />
              </div>
            )}
            <span 
              className="text-3xl font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {branding.companyName}
            </span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booth / Outlet Login</h1>
          <p className="text-gray-500">Masuk untuk memulai sesi foto</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
          </div>

          {/* Step Label */}
          <div className="flex items-center gap-2 mb-6">
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setError('') }}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <label className="block text-sm font-medium text-gray-700">
              {step === 1 ? 'Masukkan Device ID' : 'Masukkan PIN Outlet'}
            </label>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-600 text-sm">{success}</p>
            </motion.div>
          )}

          {/* Input Display */}
          <div className="mb-8">
            <div 
              className="h-16 rounded-2xl flex items-center justify-center text-2xl font-mono tracking-widest border-2"
              style={{ 
                borderColor: `${branding.primaryColor}40`,
                backgroundColor: `${branding.primaryColor}05`
              }}
            >
              {step === 1 ? (
                <span className="text-gray-900 font-bold tracking-[0.3em]">
                  {deviceId || <span className="text-gray-300 font-sans">BOOTH-XXXX-XXX</span>}
                </span>
              ) : (
                pin ? (
                  <div className="flex gap-2">
                    {pin.split('').map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: branding.primaryColor }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-300">••••</span>
                )
              )}
            </div>
          </div>

          {/* Keypad */}
          {step === 1 && keypadMode === 'alpha' ? (
            <div className="space-y-2 mb-4">
              {alphaKeys.map((row, ri) => (
                <div key={ri} className="flex gap-1.5 justify-center">
                  {row.map(btn => (
                    <motion.button
                      key={btn}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (btn === '⌫') {
                          handleDelete()
                        } else if (btn === 'C') {
                          handleClear()
                        } else {
                          handleKeyPress(btn)
                        }
                      }}
                      className="w-10 h-14 rounded-xl text-lg font-semibold bg-gray-50 text-gray-900 hover:bg-gray-100"
                      style={{ backgroundColor: `${branding.primaryColor}10` }}
                    >
                      {btn}
                    </motion.button>
                  ))}
                </div>
              ))}
              <div className="flex gap-1.5 justify-center mt-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="w-20 h-14 rounded-xl text-base font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Clear
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setKeypadMode('numeric')}
                  className="w-20 h-14 rounded-xl text-base font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  123
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="w-20 h-14 rounded-xl text-base bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                >
                  <Delete className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-2">
                {numericKeys.flat().map((btn) => (
                  <motion.button
                    key={btn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (btn === '⌫') {
                        handleDelete()
                      } else if (btn === 'C') {
                        handleClear()
                      } else {
                        handleKeyPress(btn)
                      }
                    }}
                    className={`h-16 rounded-2xl text-2xl font-semibold transition-all ${
                      btn === 'C' 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : btn === '⌫'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: btn !== 'C' && btn !== '⌫' ? `${branding.primaryColor}10` : undefined
                    }}
                  >
                    {btn === '⌫' ? <Delete className="w-6 h-6 mx-auto" /> : btn}
                  </motion.button>
                ))}
              </div>
              {step === 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setKeypadMode('alpha')}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 mb-3"
                >
                  ABC
                </motion.button>
              )}
            </>
          )}

          {/* Submit / Next Button */}
          {step === 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!deviceId}
              className="w-full py-4 px-4 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
              }}
            >
              <Smartphone className="w-5 h-5" />
              <span>Lanjut ke PIN</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading || !pin}
              className="w-full py-4 px-4 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5" />
                  <span>Mulai Sesi</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Back to Home */}
          <a
            href="/"
            className="w-full py-4 px-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-lg"
          >
            Kembali ke Beranda
          </a>
        </div>

        {/* Active Outlets Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Outlet Aktif:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {outlets.filter(o => o.status === 'online').slice(0, 3).map(outlet => (
              <span 
                key={outlet.id}
                className="px-3 py-1 bg-white rounded-full text-xs font-medium shadow-sm"
                style={{ color: branding.primaryColor }}
              >
                {outlet.name}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} {branding.companyName}. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}
