'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  ExternalLink,
  X,
  Check
} from 'lucide-react'
import { useDashboardStore, Outlet } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// Location Form Component
// ============================================

interface LocationFormProps {
  outlet?: Outlet | null
  onClose: () => void
  onSubmit: (data: Partial<Outlet>) => void
}

function LocationForm({ outlet, onClose, onSubmit }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: outlet?.name || '',
    location: outlet?.location || '',
    mapsUrl: outlet?.mapsUrl || ''
  })

  // Update form when outlet prop changes (for edit mode)
  useEffect(() => {
    setFormData({
      name: outlet?.name || '',
      location: outlet?.location || '',
      mapsUrl: outlet?.mapsUrl || ''
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
            {outlet ? 'Edit Location' : 'Add Location'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Location Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Address</label>
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
// Location Module Component
// ============================================

export function LocationModule() {
  const { outlets, updateOutlet, searchQuery } = useDashboardStore()
  const [showForm, setShowForm] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null)

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outlet.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpdate = (data: Partial<Outlet>) => {
    if (editingOutlet) {
      updateOutlet(editingOutlet.id, data)
      toast.success('Location updated successfully!')
    }
  }

  const openMaps = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locations</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage outlet locations and maps</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => useDashboardStore.getState().setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Locations Grid */}
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
                <MapPin className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{outlet.name}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                outlet.status === 'online'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : outlet.status === 'offline'
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {outlet.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {outlet.location}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => openMaps(outlet.mapsUrl)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Open Map</span>
              </button>
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
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOutlets.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No locations found</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <LocationForm
            outlet={editingOutlet}
            onClose={() => {
              setShowForm(false)
              setEditingOutlet(null)
            }}
            onSubmit={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
