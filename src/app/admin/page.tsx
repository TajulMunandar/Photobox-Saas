'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'
import { DashboardOverview } from '@/components/admin/DashboardOverview'
import { OutletModule } from '@/components/admin/OutletModule'
import { TemplateModule } from '@/components/admin/TemplateModule'
import { UserModule } from '@/components/admin/UserModule'
import { VoucherModule } from '@/components/admin/VoucherModule'
import { TestimonialModule } from '@/components/admin/TestimonialModule'
import { BrandingModule } from '@/components/admin/BrandingModule'
import { LocationModule } from '@/components/admin/LocationModule'
import { ReportModule } from '@/components/admin/ReportModule'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Toaster } from 'sonner'

// ============================================
// Admin Page Component
// ============================================

export default function AdminPage() {
  const { activeModule, darkMode } = useDashboardStore()

  // Apply dark mode to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview />
      case 'outlets':
        return <OutletModule />
      case 'templates':
        return <TemplateModule />
      case 'users':
        return <UserModule />
      case 'vouchers':
        return <VoucherModule />
      case 'testimonials':
        return <TestimonialModule />
      case 'settings':
        return <BrandingModule />
      case 'locations':
        return <LocationModule />
      case 'reports':
        return <ReportModule />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderModule()}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
