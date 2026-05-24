'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star,
  MessageSquare,
  X,
  Check,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { useDashboardStore, Testimonial } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// Testimonial Form Component
// ============================================

interface TestimonialFormProps {
  testimonial?: Testimonial | null
  onClose: () => void
  onSubmit: (data: Omit<Testimonial, 'id' | 'createdAt'>) => void
}

function TestimonialForm({ testimonial, onClose, onSubmit }: TestimonialFormProps) {
  const { outlets } = useDashboardStore()
  const [formData, setFormData] = useState({
    customerName: testimonial?.customerName || '',
    rating: testimonial?.rating || 5,
    comment: testimonial?.comment || '',
    outletId: testimonial?.outletId || '',
    isApproved: testimonial?.isApproved ?? false
  })

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
            {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Customer Name</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Outlet</label>
            <select
              value={formData.outletId}
              onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select Outlet</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= formData.rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Comment</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isApproved}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Approved</span>
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
              {testimonial ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// Testimonial Module Component
// ============================================

export function TestimonialModule() {
  const { testimonials, outlets, addTestimonial, updateTestimonial, deleteTestimonial, searchQuery } = useDashboardStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = 
      testimonial.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.comment.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'approved' && testimonial.isApproved) ||
      (filterStatus === 'pending' && !testimonial.isApproved)
    return matchesSearch && matchesStatus
  })

  const handleCreate = async (data: Omit<Testimonial, 'id' | 'createdAt'>) => {
      try {
        const res = await fetch('/api/testimonials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
  
        const result = await res.json()
  
        if (!res.ok) {
          throw new Error(result.message || 'Failed to create Testimonial')
        }
  
        const refresh = await fetch('/api/testimonials')
        const freshData = await refresh.json()
  
        useDashboardStore.getState().setTestimonials(freshData)
  
        toast.success('Testimonial created successfully!')
      } catch (err: any) {
        toast.error(err.message || 'Failed to create Testimonial')
      }
    }
  
    useEffect(() => {
      const fetchtesTimonials = async () => {
        const res = await fetch('/api/testimonials')
        const data = await res.json()
  
        useDashboardStore.getState().setTestimonials(data)
      }
  
      fetchtesTimonials()
    }, [])

    const handleUpdate = async (data: Omit<Testimonial, 'id' | 'createdAt'>) => {
      if (!editingTestimonial) return
    
      try {
        const res = await fetch(`/api/testimonials/${editingTestimonial.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
    
        const result = await res.json()
    
        if (!res.ok) {
          throw new Error(result.message || 'Failed to update testimonial')
        }
    
        const refresh = await fetch('/api/testimonials')
        const fresh = await refresh.json()
    
        useDashboardStore.getState().setTestimonials(fresh)
    
        toast.success('Testimonial updated successfully!')
      } catch (err: any) {
        toast.error(err.message || 'Failed to update testimonial')
      }
    }

    const handleDelete = async (id: string) => {
      try {
        const res = await fetch(`/api/testimonials/${id}`, {
          method: 'DELETE',
        })
    
        if (!res.ok) throw new Error()
    
        deleteTestimonial(id) 
        setDeleteConfirm(null)
        toast.success('Testimonial deleted successfully!')
      } catch (err) {
        toast.error('Failed to delete Testimonial')
      }
    }

    const handleApprove = async (id: string) => {
      try {
        const res = await fetch(`/api/testimonials/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isApproved: true,
          }),
        })
    
        const result = await res.json()
    
        if (!res.ok) {
          throw new Error(result.message || 'Failed to approve')
        }
    
        const refresh = await fetch('/api/testimonials')
        const data = await refresh.json()
    
        useDashboardStore.getState().setTestimonials(data)
    
        toast.success('Testimonial approved!')
      } catch (err: any) {
        toast.error(err.message || 'Failed to approve')
      }
    }



  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved: false,
        }),
      })
  
      const result = await res.json()
  
      if (!res.ok) {
        throw new Error(result.message || 'Failed to reject')
      }
  
      const refresh = await fetch('/api/testimonials')
      const data = await refresh.json()
  
      useDashboardStore.getState().setTestimonials(data)
  
      toast.success('Testimonial rejected!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject')
    }
  }

  const getOutletName = (outletId: string) => {
    const outlet = outlets.find(o => o.id === outletId)
    return outlet?.name || 'Unknown Outlet'
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage customer testimonials and reviews</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
          <input
            type="text"
            placeholder="Search testimonials..."
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
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTestimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border dark:border-gray-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{testimonial.customerName}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                testimonial.isApproved
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {testimonial.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`w-4 h-4 ${
                    star <= testimonial.rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`} 
                />
              ))}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
              "{testimonial.comment}"
            </p>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              <p>{getOutletName(testimonial.outletId)}</p>
              <p>{formatDate(testimonial.createdAt)}</p>
            </div>

            <div className="flex gap-2">
              {!testimonial.isApproved && (
                <button
                  onClick={() => handleApprove(testimonial.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 text-sm"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve
                </button>
              )}
              {testimonial.isApproved && (
                <button
                  onClick={() => handleReject(testimonial.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-sm"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject
                </button>
              )}
              <button
                onClick={() => {
                  setEditingTestimonial(testimonial)
                  setShowForm(true)
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-white">Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirm(testimonial.id)}
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
      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No testimonials found</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TestimonialForm
            testimonial={editingTestimonial}
            onClose={() => {
              setShowForm(false)
              setEditingTestimonial(null)
            }}
            onSubmit={editingTestimonial ? handleUpdate : handleCreate}
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
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Delete Testimonial?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                This action cannot be undone. Are you sure you want to delete this testimonial?
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
