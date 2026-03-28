'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Camera,
  Store,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { motion } from 'framer-motion'

// ============================================
// Report Module Component
// ============================================

export function ReportModule() {
  const { outlets, transactions, templates } = useDashboardStore()
  const [dateRange, setDateRange] = useState('week')
  const [selectedOutlet, setSelectedOutlet] = useState('all')

  // Calculate stats
  const totalRevenue = transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalPhotos = 156 // Mock data
  const activeOutlets = outlets.filter(o => o.status === 'online').length

  // Mock chart data
  const chartData = [
    { day: 'Mon', revenue: 2500000, photos: 45 },
    { day: 'Tue', revenue: 3200000, photos: 52 },
    { day: 'Wed', revenue: 2800000, photos: 48 },
    { day: 'Thu', revenue: 3500000, photos: 58 },
    { day: 'Fri', revenue: 4200000, photos: 72 },
    { day: 'Sat', revenue: 5500000, photos: 95 },
    { day: 'Sun', revenue: 4800000, photos: 82 },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const maxRevenue = Math.max(...chartData.map(d => d.revenue))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400">Analytics and performance reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
        <select
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
          className="px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Outlets</option>
          {outlets.map((outlet) => (
            <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+15%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{formatPrice(totalRevenue)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+8%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalPhotos}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Photos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+2</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{activeOutlets}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Outlets</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <BarChart3 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>-3%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{templates.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Templates</p>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
      >
        <h2 className="text-lg font-semibold mb-4">Weekly Revenue</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.map((data, index) => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-purple-500 rounded-t-lg transition-all duration-300 hover:bg-purple-600"
                style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{data.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
      >
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Outlet</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="border-b dark:border-gray-800 last:border-0">
                  <td className="py-3 px-4 text-sm font-medium">{tx.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {outlets.find(o => o.id === tx.outletId)?.name || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{formatPrice(tx.amount)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'success'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
