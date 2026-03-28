'use client'

import { motion } from 'framer-motion'
import { 
  Star,
  MessageSquare,
  Quote,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { useState } from 'react'

// ============================================
// Testimonials Page
// ============================================

export default function TestimonialsPage() {
  const { branding, testimonials, outlets } = useDashboardStore()
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const approvedTestimonials = testimonials.filter(t => t.isApproved)

  const getOutletName = (outletId: string) => {
    const outlet = outlets.find(o => o.id === outletId)
    return outlet?.name || 'SnapNext User'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
              <MessageSquare className="w-4 h-4" />
              <span>Testimoni Pelanggan</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Apa Kata{' '}
              <span 
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Mereka?
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Dengarkan pengalaman nyata dari pelanggan yang telah menggunakan SnapNext 
              untuk berbagai event dan aktivasi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Testimonial */}
      {approvedTestimonials.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-lg relative"
            >
              {/* Quote Icon */}
              <div 
                className="absolute top-6 left-6 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${branding.primaryColor}20` }}
              >
                <Quote className="w-6 h-6" style={{ color: branding.primaryColor }} />
              </div>

              <div className="pt-8">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-6 h-6 ${
                        star <= approvedTestimonials[activeTestimonial]?.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-2xl md:text-3xl text-gray-700 mb-8 leading-relaxed">
                  "{approvedTestimonials[activeTestimonial]?.comment}"
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                    }}
                  >
                    {approvedTestimonials[activeTestimonial]?.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {approvedTestimonials[activeTestimonial]?.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getOutletName(approvedTestimonials[activeTestimonial]?.outletId)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(approvedTestimonials[activeTestimonial]?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              {approvedTestimonials.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveTestimonial(prev => 
                      prev === 0 ? approvedTestimonials.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setActiveTestimonial(prev => 
                      (prev + 1) % approvedTestimonials.length
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </>
              )}

              {/* Dots */}
              {approvedTestimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {approvedTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === activeTestimonial
                          ? 'bg-purple-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      style={{
                        backgroundColor: index === activeTestimonial ? branding.primaryColor : undefined
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* All Testimonials Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Semua Testimoni</h2>
            <p className="text-xl text-gray-600">Lebih banyak cerita dari pelanggan kami</p>
          </motion.div>

          {approvedTestimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`w-4 h-4 ${
                          star <= testimonial.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 mb-4 line-clamp-4">
                    "{testimonial.comment}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ 
                        background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                      }}
                    >
                      {testimonial.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {testimonial.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getOutletName(testimonial.outletId)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada testimoni yang tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <div 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: branding.primaryColor }}
              >
                4.8
              </div>
              <p className="text-gray-600">Rating Rata-rata</p>
            </div>
            <div className="text-center">
              <div 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: branding.primaryColor }}
              >
                150+
              </div>
              <p className="text-gray-600">Testimoni</p>
            </div>
            <div className="text-center">
              <div 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: branding.primaryColor }}
              >
                98%
              </div>
              <p className="text-gray-600">Kepuasan</p>
            </div>
            <div className="text-center">
              <div 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: branding.primaryColor }}
              >
                50+
              </div>
              <p className="text-gray-600">Event Sukses</p>
            </div>
          </motion.div>
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
                Bergabunglah dengan Mereka
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Jadilah bagian dari komunitas vendor SnapNext dan rasakan pengalaman photo booth yang luar biasa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/admin/login"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Mulai Sekarang
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
