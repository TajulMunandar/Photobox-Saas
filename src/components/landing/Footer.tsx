'use client'

import { 
  Camera, 
  MapPin, 
  Phone, 
  Clock
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'

// ============================================
// Footer Component
// ============================================

export function Footer() {
  const { branding } = useDashboardStore()

  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt={branding.companyName}
                  className="h-10 w-auto brightness-0 invert"
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
              <span className="text-xl font-bold">{branding.companyName}</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {branding.tagline || 'Platform photo booth profesional untuk event dan bisnis di Indonesia.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/locations" className="hover:text-white transition-colors">Locations</a></li>
              <li><a href="/testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+62 21 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Mon-Fri: 9AM - 6PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {branding.companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
