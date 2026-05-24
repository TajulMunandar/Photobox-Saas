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
import { TenantModule } from '@/components/admin/TenantModule'
import { OutletDetailModule } from '@/components/admin/OutletDetailModule'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/lib/auth-context'

const ALLOWED_MODULES: Record<string, string[]> = {
  SUPER_ADMIN: ['dashboard', 'outlets', 'templates', 'users', 'vouchers', 'testimonials', 'settings', 'locations', 'reports', 'tenants', 'outlet-detail'],
  OWNER: ['dashboard', 'tenants', 'users', 'vouchers', 'testimonials', 'locations', 'reports', 'outlet-detail'],
  MANAGER: ['dashboard', 'tenants', 'users', 'vouchers', 'testimonials', 'locations', 'reports', 'outlet-detail'],
  STAFF: ['dashboard', 'tenants', 'outlet-detail'],
}

function InnerApp() {
  const { activeModule, setActiveModule, darkMode, setOutlets, setUsers, setVouchers, setTestimonials, setTransactions } = useDashboardStore()
  const { user, isLoading } = useAuth()

  const role = user?.role?.toUpperCase() || ''
  const allowed = ALLOWED_MODULES[role] || ['dashboard']

  useEffect(() => {
    if (!isLoading && !allowed.includes(activeModule)) {
      setActiveModule('dashboard')
    }
  }, [isLoading, activeModule, allowed, setActiveModule])

  // Apply dark mode to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [darkMode])

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [outletsRes, usersRes, vouchersRes, testimonialsRes, transactionsRes] =
          await Promise.all([
            fetch('/api/outlets'),
            fetch('/api/users'),
            fetch('/api/vouchers'),
            fetch('/api/testimonials'),
            fetch('/api/transactions'),
          ])

        if (outletsRes.ok) {
          const outlets = await outletsRes.json()
          setOutlets(outlets)
        }

        if (usersRes.ok) {
          const users = await usersRes.json()
          setUsers(users)
        }

        if (vouchersRes.ok) {
          const vouchers = await vouchersRes.json()
          setVouchers(vouchers)
        }

        if (testimonialsRes.ok) {
          const testimonials = await testimonialsRes.json()
          setTestimonials(testimonials)
        }

        if (transactionsRes.ok) {
          const transactions = await transactionsRes.json()
          setTransactions(transactions)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [setOutlets, setUsers, setVouchers, setTestimonials, setTransactions])

  const renderModule = () => {
    if (!allowed.includes(activeModule)) {
      return <DashboardOverview />
    }
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
      case 'tenants':
        return <TenantModule />
      case 'outlet-detail':
        return <OutletDetailModule />
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

export default function AdminPage() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}
