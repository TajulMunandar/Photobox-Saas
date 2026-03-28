'use client'

import { motion } from 'framer-motion'
import { 
  Camera, 
  CreditCard,
  Printer,
  Film,
  Newspaper,
  QrCode,
  Wifi,
  Cloud,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

// ============================================
// Features Page
// ============================================

export default function FeaturesPage() {
  const { branding } = useDashboardStore()

  const mainFeatures = [
    {
      icon: CreditCard,
      title: 'QRIS Payment',
      description: 'Pembayaran instan dengan QRIS, mendukung semua e-wallet dan bank di Indonesia. Transaksi cepat dan aman untuk setiap sesi foto.',
      benefits: [
        'Mendukung semua e-wallet (GoPay, OVO, DANA, ShopeePay)',
        'Transfer bank langsung',
        'Proses pembayaran < 3 detik',
        'Notifikasi real-time'
      ]
    },
    {
      icon: Printer,
      title: 'Silent Print',
      description: 'Teknologi printing tanpa suara, sempurna untuk event dan aktivasi brand. Kualitas foto profesional dengan kecepatan tinggi.',
      benefits: [
        'Zero noise printing',
        'Kualitas foto 300 DPI',
        'Print speed < 10 detik',
        'Auto paper cutting'
      ]
    },
    {
      icon: Film,
      title: 'GIF Engine',
      description: 'Buat GIF animasi dari burst foto dengan frame kustom dan efek menarik. Hasil yang shareable di media sosial.',
      benefits: [
        'Burst mode hingga 10 foto',
        'Custom frame overlay',
        'Efek transisi menarik',
        'Export ke MP4/GIF'
      ]
    },
    {
      icon: Newspaper,
      title: 'Newspaper A4',
      description: 'Template koran A4 yang unik untuk pengalaman foto yang berkesan. Desain vintage yang Instagram-worthy.',
      benefits: [
        'Template koran klasik',
        'Custom headline & caption',
        'Multiple layout options',
        'High-quality print'
      ]
    }
  ]

  const additionalFeatures = [
    {
      icon: QrCode,
      title: 'QR Code Gallery',
      description: 'Akses galeri foto langsung dari QR code yang di-scan dari hasil cetak.'
    },
    {
      icon: Wifi,
      title: 'Offline Mode',
      description: 'Tetap beroperasi meskipun koneksi internet terputus. Sinkronisasi otomatis saat online.'
    },
    {
      icon: Cloud,
      title: 'Cloud Backup',
      description: 'Semua foto tersimpan aman di cloud dengan backup otomatis.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enkripsi end-to-end untuk semua data dan foto pelanggan.'
    },
    {
      icon: Zap,
      title: 'Real-time Analytics',
      description: 'Dashboard analitik real-time untuk memantau performa booth.'
    },
    {
      icon: Camera,
      title: 'Multi-Template',
      description: 'Pilih dari berbagai template foto yang bisa dikustomisasi.'
    }
  ]

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
              <Zap className="w-4 h-4" />
              <span>Fitur Lengkap</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fitur{' '}
              <span 
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Unggulan
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Teknologi terdepan untuk pengalaman photo booth yang tak terlupakan. 
              Semua yang Anda butuhkan untuk bisnis photo booth profesional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-24">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ 
                      background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                    }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`bg-white rounded-2xl p-8 shadow-lg ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div 
                    className="aspect-video rounded-xl flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${branding.primaryColor}20, ${branding.secondaryColor}20)`
                    }}
                  >
                    <feature.icon className="w-24 h-24" style={{ color: branding.primaryColor }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Lainnya</h2>
            <p className="text-xl text-gray-600">Dan masih banyak lagi fitur yang mendukung bisnis Anda</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${branding.primaryColor}20` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: branding.primaryColor }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
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
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap Mencoba?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Mulai dengan uji coba gratis dan rasakan semua fitur SnapNext
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
