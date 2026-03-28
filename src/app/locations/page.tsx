'use client'

import { motion } from 'framer-motion'
import { 
  MapPin, 
  Clock, 
  ArrowRight,
  Search,
  Filter,
  ExternalLink,
  Navigation
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { useState, useEffect } from 'react'

// ============================================
// Locations Page with Live Google Maps
// ============================================

export default function LocationsPage() {
  const { branding, outlets } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all')
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null)

  const filteredOutlets = outlets.filter(outlet => {
    const matchesSearch = 
      outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || outlet.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const onlineCount = outlets.filter(o => o.status === 'online').length

  // Generate directions URL
  const getDirectionsUrl = (outlet: typeof outlets[0]) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(outlet.location)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
              style={{ 
                backgroundColor: `${branding.primaryColor}20`,
                color: branding.primaryColor
              }}
            >
              <MapPin className="w-4 h-4" />
              <span>Lokasi Kami</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Temukan Booth{' '}
              <span 
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Terdekat
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              {onlineCount}+ outlet aktif di seluruh Indonesia. Temukan lokasi SnapNext terdekat dari Anda.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg relative h-[500px]"
          >
            {/* Google Maps Embed */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.84559901476918!3d-6.208763495493379!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b759%3A0x6b45e67356225804!2sJakarta!5e0!3m2!1sen!2sid!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi SnapNext"
            />
            
            {/* Map Overlay Info */}
            <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4 max-w-xs">
              <h3 className="font-semibold text-gray-900 mb-2">Cara Menggunakan</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Klik marker untuk melihat detail lokasi</li>
                <li>• Gunakan tombol navigasi untuk arah</li>
                <li>• Zoom in/out untuk melihat area lebih detail</li>
                <li>• Drag untuk menjelajahi peta</li>
              </ul>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Legend</h4>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <span className="text-sm text-gray-600">Lokasi Aktif</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ 
                  '--tw-ring-color': branding.primaryColor
                } as React.CSSProperties}
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  background: statusFilter === 'all' ? `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` : undefined
                }}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('online')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  statusFilter === 'online'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setStatusFilter('offline')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  statusFilter === 'offline'
                    ? 'bg-gray-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Offline
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-8 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutlets.map((outlet, index) => (
              <motion.div
                key={outlet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                  selectedOutlet === outlet.id ? 'ring-2' : ''
                }`}
                style={{
                  ringColor: selectedOutlet === outlet.id ? branding.primaryColor : undefined
                }}
                onClick={() => {
                  setSelectedOutlet(outlet.id)
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{outlet.name}</h3>
                    <p className="text-gray-500 mt-1">{outlet.location}</p>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      outlet.status === 'online'
                        ? 'bg-green-100 text-green-600'
                        : outlet.status === 'offline'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {outlet.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    <span className="text-sm">{outlet.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    <span className="text-sm">10:00 - 22:00</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {outlet.features.qris && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                      QRIS
                    </span>
                  )}
                  {outlet.features.voucher && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      Voucher
                    </span>
                  )}
                  {outlet.features.cashless && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                      Cashless
                    </span>
                  )}
                </div>

                <a
                  href={getDirectionsUrl(outlet)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-white hover:opacity-90"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Navigation className="w-4 h-4" />
                  Buka di Google Maps
                </a>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredOutlets.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada lokasi yang ditemukan</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
            }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ingin Buka Outlet Baru?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Bergabunglah dengan jaringan vendor SnapNext dan dapatkan penghasilan dari bisnis photo booth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/admin/login"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Daftar Sekarang
                </a>
                <a 
                  href="/features"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
