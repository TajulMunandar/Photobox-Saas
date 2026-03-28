'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { 
  Camera, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  CreditCard,
  Printer,
  Film,
  Newspaper,
  Users,
  Image as ImageIcon,
  TrendingUp,
  Clock,
  Navigation
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

// ============================================
// Home Page - Hero Section
// ============================================

export default function HomePage() {
  const { branding, outlets } = useDashboardStore()
  const [stats, setStats] = useState({
    photos: 10000,
    outlets: 50,
    users: 5000,
    uptime: 99.9
  })

  // Live stats counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        photos: prev.photos + Math.floor(Math.random() * 5),
        outlets: prev.outlets + (Math.random() > 0.95 ? 1 : 0),
        users: prev.users + Math.floor(Math.random() * 3),
        uptime: 99.9
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const onlineOutlets = outlets.filter(o => o.status === 'online')

  const features = [
    {
      icon: CreditCard,
      title: 'QRIS Payment',
      description: 'Pembayaran instan dengan QRIS'
    },
    {
      icon: Printer,
      title: 'Silent Print',
      description: 'Teknologi printing tanpa suara'
    },
    {
      icon: Film,
      title: 'GIF Engine',
      description: 'Buat GIF animasi dari burst foto'
    },
    {
      icon: Newspaper,
      title: 'Newspaper A4',
      description: 'Template koran A4 yang unik'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${branding.primaryColor}, transparent 50%), 
                         radial-gradient(circle at 70% 80%, ${branding.secondaryColor}, transparent 50%)`
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
                style={{ 
                  backgroundColor: `${branding.primaryColor}20`,
                  color: branding.primaryColor
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Solusi SaaS Photo Box All-in-One</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                SnapNext: Solusi SaaS{' '}
                <span 
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Photo Box All-in-One
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Platform photo booth profesional dengan pembayaran QRIS, printing instan, 
                pembuatan GIF, dan galeri digital. Sempurna untuk event, pesta, dan aktivasi marketing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/booth"
                  className="px-8 py-4 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:opacity-90 shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                  }}
                >
                  Mulai Sesi Foto
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a 
                  href="/features"
                  className="px-8 py-4 border-2 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
                  style={{ borderColor: `${branding.primaryColor}40` }}
                >
                  Pelajari Fitur
                </a>
              </div>
            </motion.div>

            {/* Floating Photo Frames Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[500px] hidden lg:block"
            >
              {/* Frame 1 */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [-5, -5, -5]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-10 left-10 w-48 h-64 bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ transform: 'rotate(-5deg)' }}
              >
                <img 
                  src="https://picsum.photos/seed/photo1/400/500" 
                  alt="Photo 1"
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent"
                >
                  <p className="text-white text-sm font-medium">Event Photo</p>
                </div>
              </motion.div>

              {/* Frame 2 */}
              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [5, 5, 5]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute top-20 right-10 w-56 h-72 bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{ transform: 'rotate(5deg)' }}
              >
                <img 
                  src="https://picsum.photos/seed/photo2/400/500" 
                  alt="Photo 2"
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent"
                >
                  <p className="text-white text-sm font-medium">Party Time</p>
                </div>
              </motion.div>

              {/* Frame 3 */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 0, 0]
                }}
                transition={{ 
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-20 left-1/4 w-52 h-68 bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <img 
                  src="https://picsum.photos/seed/photo3/400/500" 
                  alt="Photo 3"
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent"
                >
                  <p className="text-white text-sm font-medium">Memories</p>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full"
                style={{ 
                  background: `radial-gradient(circle, ${branding.primaryColor}40, transparent)`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <StatCard 
              icon={ImageIcon}
              value={stats.photos.toLocaleString()}
              label="Photos Captured"
              color={branding.primaryColor}
            />
            <StatCard 
              icon={MapPin}
              value={stats.outlets.toString()}
              label="Active Outlets"
              color={branding.secondaryColor}
            />
            <StatCard 
              icon={Users}
              value={stats.users.toLocaleString()}
              label="Happy Users"
              color={branding.primaryColor}
            />
            <StatCard 
              icon={TrendingUp}
              value={`${stats.uptime}%`}
              label="Uptime"
              color={branding.secondaryColor}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Teknologi terdepan untuk pengalaman photo booth yang tak terlupakan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
                primaryColor={branding.primaryColor}
                secondaryColor={branding.secondaryColor}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <a 
              href="/features"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all hover:opacity-90"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                color: 'white'
              }}
            >
              Lihat Semua Fitur
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Map Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
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
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {onlineOutlets.length}+ outlet aktif di seluruh Indonesia. Temukan lokasi SnapNext terdekat dari Anda.
            </p>
          </motion.div>

          {/* Google Maps Embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg relative h-[500px] mb-8"
          >
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

          {/* Location List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Outlet Aktif</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {outlets.slice(0, 4).map((outlet) => (
                <motion.div
                  key={outlet.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{outlet.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{outlet.location}</p>
                    </div>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
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

                  <div className="space-y-2 mb-4">
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
                  <div className="flex flex-wrap gap-1 mb-4">
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
                    href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.location}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white hover:opacity-90 text-sm"
                    style={{ 
                      background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                    Buka di Maps
                  </a>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <a 
                href="/locations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
              >
                <span>Lihat Semua Lokasi</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
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
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="cta-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="20" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-pattern)" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap Memulai?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Bergabunglah dengan ratusan vendor yang telah mempercayakan bisnis photo booth mereka dengan SnapNext
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/admin/login"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Mulai Gratis
                </a>
                <a 
                  href="/pricing"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Lihat Harga
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

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  value: string
  label: string
  color: string
}

function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className="text-center"
    >
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
      >
        {value}
      </motion.p>
      <p className="text-gray-500">{label}</p>
    </motion.div>
  )
}

// ============================================
// Feature Card Component
// ============================================

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  index: number
  primaryColor: string
  secondaryColor: string
}

function FeatureCard({ icon: Icon, title, description, index, primaryColor, secondaryColor }: FeatureCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
        }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}
