'use client'

import { 
  Store, 
  Image, 
  Users, 
  Gift, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Camera,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { motion } from 'framer-motion'

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  positive?: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatCard({ title, value, change, positive, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </motion.div>
  )
}

// ============================================
// Dashboard Overview Component
// ============================================

export function DashboardOverview() {
  const { outlets, templates, users, vouchers, transactions, boothStatuses } = useDashboardStore()

  // Calculate stats
  const totalOutlets = outlets.length
  const activeOutlets = outlets.filter(o => o.status === 'online').length
  const totalTemplates = templates.length
  const activeTemplates = templates.filter(t => t.isActive).length
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const totalVouchers = vouchers.length
  const activeVouchers = vouchers.filter(v => v.isActive).length

  // Calculate revenue (mock)
  const todayRevenue = transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate photos today (mock)
  const photosToday = 156

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('id-ID')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      online: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      offline: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    }
    return styles[status as keyof typeof styles] || styles.offline
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Outlets"
          value={totalOutlets}
          change="+2 this month"
          positive={true}
          icon={Store}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Sessions"
          value={activeOutlets}
          change="Currently active"
          positive={true}
          icon={Wifi}
          color="bg-green-500"
        />
        <StatCard
          title="Revenue Today"
          value={formatPrice(todayRevenue)}
          change="+15% vs yesterday"
          positive={true}
          icon={DollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="Photos Today"
          value={photosToday}
          change="-5% vs yesterday"
          positive={false}
          icon={Camera}
          color="bg-pink-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Templates</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeTemplates} / {totalTemplates}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active templates</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Users</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeUsers} / {totalUsers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vouchers</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeVouchers} / {totalVouchers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active vouchers</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <Store className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Outlets</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeOutlets} / {totalOutlets}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Online outlets</p>
        </motion.div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b dark:border-gray-800 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{tx.id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {outlets.find(o => o.id === tx.outletId)?.name || 'Unknown Outlet'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">{formatPrice(tx.amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'success' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Booth Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Booth Status</h2>
          <div className="space-y-4">
            {boothStatuses.map((booth) => (
              <div key={booth.id} className="flex items-center justify-between py-2 border-b dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  {getStatusIcon(booth.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{booth.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last photo: {formatTime(booth.lastPhoto)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(booth.status)}`}>
                  {booth.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => useDashboardStore.getState().setActiveModule('outlets')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Store className="w-8 h-8 text-gray-400 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Add Outlet</span>
          </button>
          <button 
            onClick={() => useDashboardStore.getState().setActiveModule('vouchers')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Gift className="w-8 h-8 text-gray-400 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Create Voucher</span>
          </button>
          <button 
            onClick={() => useDashboardStore.getState().setActiveModule('templates')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Image className="w-8 h-8 text-gray-400 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Upload Template</span>
          </button>
          <button 
            onClick={() => useDashboardStore.getState().setActiveModule('testimonials')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Users className="w-8 h-8 text-gray-400 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Add Testimonial</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
