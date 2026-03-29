'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Gift,
  Percent,
  DollarSign,
  Calendar,
  X,
  Check,
  Copy
} from 'lucide-react'
import { useDashboardStore, Voucher } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// Voucher Form Component
// ============================================

interface VoucherFormProps {
  voucher?: Voucher | null
  onClose: () => void
  onSubmit: (data: Omit<Voucher, 'id' | 'createdAt' | 'code' | 'usedCount'>) => void
}

function VoucherForm({ voucher, onClose, onSubmit }: VoucherFormProps) {
  const [formData, setFormData] = useState({
    discountType: voucher?.discountType || 'percentage' as const,
    discountValue: voucher?.discountValue || 0,
    minPurchase: voucher?.minPurchase || 0,
    maxDiscount: voucher?.maxDiscount || undefined,
    usageLimit: voucher?.usageLimit || 100,
    validFrom: voucher?.validFrom ? voucher.validFrom.split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: voucher?.validUntil ? voucher.validUntil.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: voucher?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString()
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {voucher ? 'Edit Voucher' : 'Create New Voucher'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Discount Type</label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (Rp)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Discount Value {formData.discountType === 'percentage' ? '(%)' : '(Rp)'}
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              min="0"
              max={formData.discountType === 'percentage' ? 100 : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Minimum Purchase (Rp)</label>
            <input
              type="number"
              value={formData.minPurchase}
              onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              min="0"
            />
          </div>

          {formData.discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Maximum Discount (Rp)</label>
              <input
                type="number"
                value={formData.maxDiscount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscount: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Usage Limit</label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              min="1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Valid From</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Active</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-gray-900 dark:text-white">Cancel</span>
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              {voucher ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// Voucher Module Component
// ============================================

export function VoucherModule() {
  const { vouchers, addVoucher, updateVoucher, deleteVoucher, searchQuery } = useDashboardStore()
  const [showForm, setShowForm] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && voucher.isActive) ||
      (filterStatus === 'inactive' && !voucher.isActive)
    return matchesSearch && matchesStatus
  })

  const handleCreate = (data: Omit<Voucher, 'id' | 'createdAt' | 'code' | 'usedCount'>) => {
    addVoucher(data)
    toast.success('Voucher created successfully!')
  }

  const handleUpdate = (data: Omit<Voucher, 'id' | 'createdAt' | 'code' | 'usedCount'>) => {
    if (editingVoucher) {
      updateVoucher(editingVoucher.id, data)
      toast.success('Voucher updated successfully!')
    }
  }

  const handleDelete = (id: string) => {
    deleteVoucher(id)
    setDeleteConfirm(null)
    toast.success('Voucher deleted successfully!')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Voucher code copied!')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vouchers & Discounts</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage promotional vouchers and discounts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Create Voucher
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
          <input
            type="text"
            placeholder="Search vouchers..."
            value={searchQuery}
            onChange={(e) => useDashboardStore.getState().setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVouchers.map((voucher) => (
          <motion.div
            key={voucher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border dark:border-gray-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                <span className="font-mono font-bold text-lg">{voucher.code}</span>
              </div>
              <button
                onClick={() => copyCode(voucher.code)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Copy className="w-4 h-4 text-gray-400 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {voucher.discountType === 'percentage' ? (
                <Percent className="w-4 h-4 text-green-500" />
              ) : (
                <DollarSign className="w-4 h-4 text-green-500" />
              )}
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {voucher.discountType === 'percentage' 
                  ? `${voucher.discountValue}%`
                  : formatPrice(voucher.discountValue)
                }
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <span>Min. purchase:</span>
                <span className="font-medium">{formatPrice(voucher.minPurchase)}</span>
              </div>
              {voucher.maxDiscount && (
                <div className="flex items-center gap-2">
                  <span>Max. discount:</span>
                  <span className="font-medium">{formatPrice(voucher.maxDiscount)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span>Usage:</span>
                <span className="font-medium">{voucher.usedCount} / {voucher.usageLimit}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(voucher.validFrom)} - {formatDate(voucher.validUntil)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                voucher.isActive
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {voucher.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingVoucher(voucher)
                  setShowForm(true)
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirm(voucher.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm"
              >
                <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVouchers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No vouchers found</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <VoucherForm
            voucher={editingVoucher}
            onClose={() => {
              setShowForm(false)
              setEditingVoucher(null)
            }}
            onSubmit={editingVoucher ? handleUpdate : handleCreate}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Delete Voucher?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                This action cannot be undone. Are you sure you want to delete this voucher?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
