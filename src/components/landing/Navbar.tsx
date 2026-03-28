'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  ChevronDown,
  Users,
  Menu,
  X
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'

// ============================================
// Navbar Component
// ============================================

export function Navbar() {
  const { branding } = useDashboardStore()
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLoginDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/locations', label: 'Locations' },
    { href: '/testimonials', label: 'Testimonials' }
  ]

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b"
      style={{ 
        borderColor: `${branding.primaryColor}20`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <a href="/" className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt={branding.companyName}
                className="h-10 w-auto"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                }}
              >
                <Camera className="w-5 h-5 text-white" />
              </div>
            )}
            <span 
              className="text-xl font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {branding.companyName}
            </span>
          </a>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href} 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Login Dropdown */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
              }}
            >
              Login
              <ChevronDown className={`w-4 h-4 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {loginDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border overflow-hidden"
                >
                  <a
                    href="/admin/login"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setLoginDropdownOpen(false)}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${branding.primaryColor}20` }}
                    >
                      <Users className="w-5 h-5" style={{ color: branding.primaryColor }} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Admin / Owner</p>
                      <p className="text-xs text-gray-500">Dashboard & Management</p>
                    </div>
                  </a>
                  <a
                    href="/booth/login"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t"
                    onClick={() => setLoginDropdownOpen(false)}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${branding.secondaryColor}20` }}
                    >
                      <Camera className="w-5 h-5" style={{ color: branding.secondaryColor }} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Booth / Outlet</p>
                      <p className="text-xs text-gray-500">Photo Session Interface</p>
                    </div>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
