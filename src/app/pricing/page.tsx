'use client'

import { motion } from 'framer-motion'
import { 
  CheckCircle2,
  Star,
  Zap,
  Crown,
  Building2
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

// ============================================
// Pricing Page
// ============================================

export default function PricingPage() {
  const { branding } = useDashboardStore()

  const plans = [
    {
      name: 'Starter',
      price: '299K',
      period: '/bulan',
      description: 'Cocok untuk vendor baru yang ingin memulai bisnis photo booth',
      icon: Zap,
      features: [
        '1 Outlet',
        '500 Foto/bulan',
        'GIF Basic',
        'Template Standar',
        'Support Email',
        'Dashboard Analytics',
        'QRIS Payment'
      ],
      popular: false,
      cta: 'Pilih Paket'
    },
    {
      name: 'Professional',
      price: '799K',
      period: '/bulan',
      description: 'Untuk bisnis yang berkembang dengan kebutuhan lebih banyak',
      icon: Star,
      features: [
        '5 Outlet',
        '2000 Foto/bulan',
        'GIF Premium',
        'Newspaper A4',
        'QRIS Payment',
        'Silent Print',
        'Priority Support',
        'Custom Branding',
        'Advanced Analytics'
      ],
      popular: true,
      cta: 'Pilih Paket'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Solusi kustom untuk perusahaan dengan kebutuhan khusus',
      icon: Crown,
      features: [
        'Unlimited Outlet',
        'Unlimited Foto',
        'Semua Fitur Premium',
        'White Label',
        'API Access',
        'Dedicated Support',
        'Custom Development',
        'SLA Guarantee',
        'Training & Onboarding'
      ],
      popular: false,
      cta: 'Hubungi Kami'
    }
  ]

  const addOns = [
    {
      name: 'Extra Outlet',
      price: '150K/bulan',
      description: 'Tambah outlet baru untuk paket Starter'
    },
    {
      name: 'Extra Photos',
      price: '100K/1000 foto',
      description: 'Tambah kuota foto jika sudah habis'
    },
    {
      name: 'Custom Template',
      price: '500K',
      description: 'Desain template foto kustom sesuai brand Anda'
    },
    {
      name: 'White Label',
      price: '2 Juta',
      description: 'Hapus branding SnapNext dari semua interface'
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
              <Building2 className="w-4 h-4" />
              <span>Harga Transparan</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pilih Paket{' '}
              <span 
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Sesuai Kebutuhan
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Tidak ada biaya tersembunyi. Pilih paket yang sesuai dengan skala bisnis Anda 
              dan tingkatkan kapan saja.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl p-8 shadow-lg relative ${
                  plan.popular ? 'ring-2 scale-105' : ''
                }`}
                style={{
                  borderColor: plan.popular ? branding.primaryColor : undefined,
                  // @ts-ignore - ringColor prop for motion
                  ringColor: plan.popular ? branding.primaryColor : undefined
                }}
              >
                {plan.popular && (
                  <div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-medium"
                    style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                  >
                    Popular
                  </div>
                )}
                
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                  }}
                >
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'text-white hover:opacity-90'
                      : 'border-2 hover:bg-gray-50'
                  }`}
                  style={{
                    background: plan.popular ? `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` : undefined,
                    borderColor: plan.popular ? undefined : `${branding.primaryColor}40`,
                    color: plan.popular ? 'white' : branding.primaryColor
                  }}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Add-ons & Tambahan</h2>
            <p className="text-xl text-gray-600">Butuh lebih banyak? Tambahkan fitur sesuai kebutuhan</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <motion.div
                key={addon.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{addon.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{addon.description}</p>
                <p 
                  className="text-xl font-bold"
                  style={{ color: branding.primaryColor }}
                >
                  {addon.price}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'Apakah ada kontrak jangka panjang?',
                a: 'Tidak, semua paket berbasis bulanan dan bisa dibatalkan kapan saja.'
              },
              {
                q: 'Bisakah upgrade paket di tengah periode?',
                a: 'Ya, Anda bisa upgrade kapan saja. Selisih harga akan dihitung secara prorata.'
              },
              {
                q: 'Apa yang terjadi jika kuota foto habis?',
                a: 'Anda bisa membeli add-on Extra Photos atau menunggu periode berikutnya.'
              },
              {
                q: 'Apakah ada diskon untuk pembayaran tahunan?',
                a: 'Ya, dapatkan diskon 20% untuk pembayaran tahunan.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
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
                Masih Ragu?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Coba gratis 14 hari tanpa kartu kredit. Rasakan semua fitur SnapNext.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/admin/login"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Mulai Gratis
                </a>
                <a 
                  href="/features"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Lihat Fitur
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
