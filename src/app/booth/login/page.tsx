'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Delete,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Hash,
  Smartphone
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'

// ============================================
// Booth Login Page - Touch-Friendly Keypad
// ============================================

export default function BoothLoginPage() {
  const { branding, outlets } = useDashboardStore()
  const [pin, setPin] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [loginMethod, setLoginMethod] = useState<'pin' | 'device'>('pin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleKeyPress = (value: string) => {
    if (loginMethod === 'pin') {
      if (pin.length < 6) {
        setPin(prev => prev + value)
      }
    } else {
      if (deviceId.length < 10) {
        setDeviceId(prev => prev + value)
      }
    }
    setError('')
  }

  const handleDelete = () => {
    if (loginMethod === 'pin') {
      setPin(prev => prev.slice(0, -1))
    } else {
      setDeviceId(prev => prev.slice(0, -1))
    }
    setError('')
  }

  const handleClear = () => {
    if (loginMethod === 'pin') {
      setPin('')
    } else {
      setDeviceId('')
    }
    setError('')
  }

  const handleSubmit = async () => {
    const currentValue = loginMethod === 'pin' ? pin : deviceId
    
    if (!currentValue) {
      setError(loginMethod === 'pin' ? 'Masukkan PIN outlet' : 'Masukkan Device ID')
      return
    }

    if (loginMethod === 'pin' && pin.length < 4) {
      setError('PIN harus minimal 4 digit')
      return
    }

    setIsLoading(true)
    setError('')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate successful login
    setSuccess('Login berhasil! Mengarahkan ke booth...')
    setTimeout(() => {
      window.location.href = '/booth'
    }, 1000)
  }

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫']
  ]

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
          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => {
                setLoginMethod('pin')
                setError('')
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'pin'
                  ? 'bg-white shadow-md text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Hash className="w-5 h-5" />
              Outlet PIN
            </button>
            <button
              onClick={() => {
                setLoginMethod('device')
                setError('')
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                loginMethod === 'device'
                  ? 'bg-white shadow-md text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              Device ID
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

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

          {/* PIN/Device ID Display */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {loginMethod === 'pin' ? 'Outlet PIN' : 'Device ID'}
            </label>
            <div 
              className="h-16 rounded-2xl flex items-center justify-center text-3xl font-mono tracking-widest border-2"
              style={{ 
                borderColor: `${branding.primaryColor}40`,
                backgroundColor: `${branding.primaryColor}05`
              }}
            >
              {loginMethod === 'pin' ? (
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
              ) : (
                deviceId || <span className="text-gray-300">Enter Device ID</span>
              )}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {keypadButtons.flat().map((btn, index) => (
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

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isLoading || (!pin && !deviceId)}
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
                <span>Mulai Sesi</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </motion.button>

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
