'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Wifi, 
  WifiOff,
  AlertCircle,
  X,
  Check
} from 'lucide-react'
import { useDashboardStore, Outlet } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// Outlet Form Component
// ============================================

interface OutletFormProps {
  outlet?: Outlet | null
  onClose: () => void
  onSubmit: (data: Omit<Outlet, 'id' | 'createdAt'>) => void
}

function OutletForm({ outlet, onClose, onSubmit }: OutletFormProps) {
  const [formData, setFormData] = useState({
    name: outlet?.name || '',
    location: outlet?.location || '',
    mapsUrl: outlet?.mapsUrl || '',
    status: outlet?.status || 'offline' as const,
    features: {
      qris: outlet?.features.qris ?? true,
      voucher: outlet?.features.voucher ?? true,
      cashless: outlet?.features.cashless ?? true,
    },
    lastHeartbeat: outlet?.lastHeartbeat || new Date().toISOString()
  })

  // Update form when outlet prop changes (for edit mode)
  useEffect(() => {
    setFormData({
      name: outlet?.name || '',
      location: outlet?.location || '',
      mapsUrl: outlet?.mapsUrl || '',
      status: outlet?.status || 'offline' as const,
      features: {
        qris: outlet?.features.qris ?? true,
        voucher: outlet?.features.voucher ?? true,
        cashless: outlet?.features.cashless ?? true,
      },
      lastHeartbeat: outlet?.lastHeartbeat || new Date().toISOString()
    })
  }, [outlet])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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
            {outlet ? 'Edit Outlet' : 'Add New Outlet'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Outlet Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Pick Location on Map</label>
            <div className="space-y-2">
              <div className="relative w-full h-64 rounded-lg overflow-hidden border dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <iframe
                  id="map-embed"
                  className="w-full h-full"
                  src={formData.mapsUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56398935027!2d106.698688671875!3d-6.208763868808566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b5c7%3A0x2e69f5390917b5c7!2sJakarta!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid"}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  window.open('https://www.google.com/maps', '_blank')
                }}
                className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Open Google Maps to Select Location
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                1. Click button above to open Google Maps{String.fromCharCode(10)}
                2. Navigate to your desired location{String.fromCharCode(10)}
                3. Click Share {'->'} Embed a map{String.fromCharCode(10)}
                4. Copy the src URL and paste below
              </p>
              <input
                type="url"
                value={formData.mapsUrl}
                onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                placeholder="Paste Google Maps embed URL here..."
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'online' | 'offline' | 'error' })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Features</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.features.qris}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    features: { ...formData.features, qris: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-900 dark:text-white">QRIS Payment</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.features.voucher}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    features: { ...formData.features, voucher: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-900 dark:text-white">Voucher</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.features.cashless}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    features: { ...formData.features, cashless: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-900 dark:text-white">Cashless Payment</span>
              </label>
            </div>
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
              {outlet ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// Outlet Module Component
// ============================================

export function OutletModule() {
  const { outlets, addOutlet, updateOutlet, deleteOutlet, searchQuery } = useDashboardStore()
  const [showForm, setShowForm] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outlet.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = (data: Omit<Outlet, 'id' | 'createdAt'>) => {
    addOutlet(data)
    toast.success('Outlet created successfully!')
  }

  const handleUpdate = (data: Omit<Outlet, 'id' | 'createdAt'>) => {
    if (editingOutlet) {
      updateOutlet(editingOutlet.id, data)
      toast.success('Outlet updated successfully!')
    }
  }

  const handleDelete = (id: string) => {
    deleteOutlet(id)
    setDeleteConfirm(null)
    toast.success('Outlet deleted successfully!')
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Outlet Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your photo booth outlets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Add Outlet
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
        <input
          type="text"
          placeholder="Search outlets..."
          value={searchQuery}
          onChange={(e) => useDashboardStore.getState().setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOutlets.map((outlet) => (
          <motion.div
            key={outlet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border dark:border-gray-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(outlet.status)}
                <h3 className="font-semibold text-gray-900 dark:text-white">{outlet.name}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(outlet.status)}`}>
                {outlet.status}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{outlet.location}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {outlet.features.qris && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  QRIS
                </span>
              )}
              {outlet.features.voucher && (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  Voucher
                </span>
              )}
              {outlet.features.cashless && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  Cashless
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingOutlet(outlet)
                  setShowForm(true)
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirm(outlet.id)}
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
      {filteredOutlets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No outlets found</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <OutletForm
            outlet={editingOutlet}
            onClose={() => {
              setShowForm(false)
              setEditingOutlet(null)
            }}
            onSubmit={editingOutlet ? handleUpdate : handleCreate}
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
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Delete Outlet?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                This action cannot be undone. Are you sure you want to delete this outlet?
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
