'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Building2, 
  Store, 
  Users, 
  Calendar,
  Edit, 
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  MapPin,
  Image,
  Navigation,
  Gift
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useDashboardStore, Voucher } from '@/lib/stores/dashboard-store'
import { useAuth } from '@/lib/auth-context'
import { VoucherForm } from './VoucherModule'
import dynamic from 'next/dynamic'

const LocationMap = dynamic(() => import('@/components/admin/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-lg border dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <p className="text-sm text-gray-500">Memuat peta...</p>
    </div>
  ),
})

// ============================================
// Types
// ============================================

interface Outlet {
  id: string
  name: string
  address: string
  phone: string
  mapsUrl: string
  machineId: string
  pin: string
  isActive: boolean
  status: string
  features: {
    qris: boolean
    voucher: boolean
    cashless: boolean
  }
  createdAt: string
}

interface Tenant {
  id: string
  name: string
  phone: string
  logoUrl: string
  primaryColor: string
  subscriptionPlan: string
  isActive: boolean
  createdAt: string
  outlets: Outlet[]
  outletCount: number
}

// ============================================
// Tenant Form Modal (Multi-step for create)
// ============================================

interface TenantFormProps {
  tenant?: Tenant | null
  onClose: () => void
  onSubmit: (data: any) => void
}

function TenantForm({ tenant, onClose, onSubmit }: TenantFormProps) {
  const [step, setStep] = useState(1)
  const [tenantData, setTenantData] = useState({
    name: tenant?.name || '',
    phone: tenant?.phone || '',
    primaryColor: tenant?.primaryColor || '#a855f7',
    subscriptionPlan: tenant?.subscriptionPlan || 'FREE',
    isActive: tenant?.isActive ?? true,
  })
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantData.name) {
      toast.error('Tenant name is required')
      return
    }
    if (tenant) {
      onSubmit(tenantData)
      onClose()
    } else {
      setStep(2)
    }
  }

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData.name || !userData.email) {
      toast.error('User name and email are required')
      return
    }
    if (!userData.password) {
      toast.error('Password is required')
      return
    }
    if (userData.password !== userData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    onSubmit({ tenant: tenantData, user: userData })
    onClose()
  }

  if (tenant) {
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Tenant</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <form onSubmit={handleTenantSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Tenant / Company Name</label>
              <input
                type="text"
                value={tenantData.name}
                onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                placeholder="PT Photo Booth Indonesia"
                required
              />
            </div>



            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Phone</label>
              <input
                type="text"
                value={tenantData.phone}
                onChange={(e) => setTenantData({ ...tenantData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                placeholder="+62 812-3456-7890"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Subscription</label>
                <select
                  value={tenantData.subscriptionPlan}
                  onChange={(e) => setTenantData({ ...tenantData, subscriptionPlan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Primary Color</label>
                <input
                  type="color"
                  value={tenantData.primaryColor}
                  onChange={(e) => setTenantData({ ...tenantData, primaryColor: e.target.value })}
                  className="w-full h-10 rounded-lg border dark:border-gray-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={tenantData.isActive}
                onChange={(e) => setTenantData({ ...tenantData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-900 dark:text-white">Active Tenant</label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Update Tenant
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )
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
        {/* Step Indicator */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step === 1 ? 'Add New Tenant' : 'Tenant Owner User'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex px-4 pt-4 gap-2">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleTenantSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Tenant / Company Name</label>
              <input
                type="text"
                value={tenantData.name}
                onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                placeholder="PT Photo Booth Indonesia"
                required
              />
            </div>



            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Phone</label>
              <input
                type="text"
                value={tenantData.phone}
                onChange={(e) => setTenantData({ ...tenantData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                placeholder="+62 812-3456-7890"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Subscription</label>
                <select
                  value={tenantData.subscriptionPlan}
                  onChange={(e) => setTenantData({ ...tenantData, subscriptionPlan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Primary Color</label>
                <input
                  type="color"
                  value={tenantData.primaryColor}
                  onChange={(e) => setTenantData({ ...tenantData, primaryColor: e.target.value })}
                  className="w-full h-10 rounded-lg border dark:border-gray-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={tenantData.isActive}
                onChange={(e) => setTenantData({ ...tenantData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-900 dark:text-white">Active Tenant</label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Next: Owner User
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleUserSubmit} className="p-4 space-y-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Create an owner user for <strong className="text-gray-900 dark:text-white">{tenantData.name}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Full Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Email (login)</label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                placeholder="owner@tenant.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Password</label>
              <input
                type="password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Confirm Password</label>
              <input
                type="password"
                value={userData.confirmPassword}
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="text-xs text-gray-400">
              Role: <strong className="text-purple-600">Owner</strong> &mdash; Full access to manage this tenant
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Tenant &amp; User
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

// ============================================
// Main Tenant Module
// ============================================

export function TenantModule() {
  const { setActiveModule, setSelectedOutletId } = useDashboardStore()
  const { user } = useAuth()
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN'
  const isStaff = user?.role?.toUpperCase() === 'STAFF'
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set())

  // Per-tenant data for quick actions
  const [tenantTemplates, setTenantTemplates] = useState<Record<string, any[]>>({})
  const [tenantBrandAssets, setTenantBrandAssets] = useState<Record<string, any[]>>({})
  const [loadingTenantData, setLoadingTenantData] = useState<Record<string, boolean>>({})
  const [tenantVouchers, setTenantVouchers] = useState<Record<string, Voucher[]>>({})
  const [showVoucherForm, setShowVoucherForm] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [voucherTenantId, setVoucherTenantId] = useState('')
  const [deleteConfirmVoucher, setDeleteConfirmVoucher] = useState<{ tenantId: string; voucherId: string } | null>(null)

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [currentTenantForModal, setCurrentTenantForModal] = useState<string>('')
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'FOUR_R',
    price: 30000,
    imageUrl: '',
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  // Brand Asset Modal
  const [showBrandAssetModal, setShowBrandAssetModal] = useState(false)
  const [brandAssetTenantId, setBrandAssetTenantId] = useState('')
  const [brandAssetType, setBrandAssetType] = useState('')
  const [brandAssetForm, setBrandAssetForm] = useState({ url: '' })
  const [uploadingBrandAsset, setUploadingBrandAsset] = useState(false)

  // Edit / Delete Tenant
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [deleteConfirmTenantId, setDeleteConfirmTenantId] = useState<string | null>(null)
  const [deleteConfirmOutlet, setDeleteConfirmOutlet] = useState<{ tenantId: string; outletId: string; outletName: string } | null>(null)

  // Transaction recap (per tenant)
  const [tenantTransactions, setTenantTransactions] = useState<Record<string, any[]>>({})
  const [transactionsLoading, setTransactionsLoading] = useState<Record<string, boolean>>({})

  // Add Outlet Modal (per tenant)
  const [showAddOutletModal, setShowAddOutletModal] = useState(false)
  const [outletTenantId, setOutletTenantId] = useState('')
  const [outletPin, setOutletPin] = useState('')
  const [outletForm, setOutletForm] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    features: { qris: true, voucher: true, cashless: true }
  })
  const [selectedLatLng, setSelectedLatLng] = useState<{lat: number; lng: number} | null>(null)
  const [creatingOutlet, setCreatingOutlet] = useState(false)

  const fetchTenants = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tenants')
      if (res.ok) {
        const data = await res.json()
        setTenants(data)
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
      toast.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  const fetchTenantData = async (tenantId: string) => {
    setLoadingTenantData(prev => ({ ...prev, [tenantId]: true }))

    try {
      const [templatesRes, assetsRes, vouchersRes] = await Promise.all([
        fetch(`/api/templates?tenantId=${tenantId}`),
        fetch(`/api/brand-assets?tenantId=${tenantId}`),
        fetch(`/api/vouchers?tenantId=${tenantId}`),
      ])

      if (templatesRes.ok) {
        const templates = await templatesRes.json()
        setTenantTemplates(prev => ({ ...prev, [tenantId]: templates }))
      }

      if (assetsRes.ok) {
        const assets = await assetsRes.json()
        setTenantBrandAssets(prev => ({ ...prev, [tenantId]: assets }))
      }

      if (vouchersRes.ok) {
        const vouchers = await vouchersRes.json()
        setTenantVouchers(prev => ({ ...prev, [tenantId]: vouchers }))
      }
    } catch (error) {
      console.error('Failed to fetch tenant data:', error)
    } finally {
      setLoadingTenantData(prev => ({ ...prev, [tenantId]: false }))
    }
  }

  // Upload image helper (reuses existing photo upload endpoint)
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('sessionId', 'admin')
    formData.append('galleryCode', 'template')

    const res = await fetch('/api/photos/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error('Upload failed')

    const data = await res.json()
    return data.url || data.photoUrl
  }

  // Open template modal (add or edit)
  const openTemplateModal = (tenantId: string, template?: any) => {
    setCurrentTenantForModal(tenantId)
    if (template) {
      setEditingTemplate(template)
      setTemplateForm({
        name: template.name,
        type: template.type,
        price: template.price,
        imageUrl: template.imageUrl || '',
      })
    } else {
      setEditingTemplate(null)
      setTemplateForm({
        name: '',
        type: 'FOUR_R',
        price: 30000,
        imageUrl: '',
      })
    }
    setShowTemplateModal(true)
  }

  // Save template (create or update)
  const saveTemplate = async () => {
    if (!currentTenantForModal || !templateForm.name) return

    try {
      const payload = {
        tenantId: currentTenantForModal,
        ...templateForm,
      }

      if (editingTemplate) {
        await fetch(`/api/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setShowTemplateModal(false)
      fetchTenantData(currentTenantForModal)
      toast.success(editingTemplate ? 'Template updated' : 'Template created')
    } catch (error) {
      toast.error('Failed to save template')
    }
  }

  // Voucher handlers
  const openVoucherForm = (tenantId: string, voucher?: Voucher) => {
    setVoucherTenantId(tenantId)
    setEditingVoucher(voucher || null)
    setShowVoucherForm(true)
  }

  const handleSaveVoucher = async (data: Omit<Voucher, 'id' | 'createdAt' | 'usedCount'>) => {
    try {
      const payload = { ...data, tenantId: voucherTenantId }
      let res: Response

      if (editingVoucher) {
        res = await fetch(`/api/vouchers/${editingVoucher.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/vouchers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.message || 'Gagal menyimpan voucher')
        return
      }

      const saved = editingVoucher ? null : await res.json()
      const targetTenantId = saved?.tenantId || voucherTenantId
      if (saved) {
        setTenantVouchers(prev => ({
          ...prev,
          [targetTenantId]: [...(prev[targetTenantId] || []), saved],
        }))
      }

      setShowVoucherForm(false)
      setEditingVoucher(null)
      // Refresh vouchers from server
      try {
        const refreshRes = await fetch(`/api/vouchers?tenantId=${targetTenantId}`)
        if (refreshRes.ok) {
          const vouchers = await refreshRes.json()
          setTenantVouchers(prev => ({ ...prev, [targetTenantId]: vouchers }))
        }
      } catch {}
      toast.success(editingVoucher ? 'Voucher updated' : 'Voucher created')
    } catch (error) {
      toast.error('Gagal menyimpan voucher')
    }
  }

  const handleDeleteVoucher = async (tenantId: string, voucherId: string) => {
    try {
      const res = await fetch(`/api/vouchers/${voucherId}`, { method: 'DELETE' })
      if (res.ok) {
        setDeleteConfirmVoucher(null)
        fetchTenantData(tenantId)
        toast.success('Voucher deleted')
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to delete voucher')
      }
    } catch (error) {
      toast.error('Failed to delete voucher')
    }
  }

  // Handle image file selection + upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const url = await uploadImage(file)
      setTemplateForm(prev => ({ ...prev, imageUrl: url }))
      toast.success('Image uploaded')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Brand Asset Modal helpers
  const openBrandAssetModal = (tenantId: string, type: string, currentUrl = '') => {
    setBrandAssetTenantId(tenantId)
    setBrandAssetType(type)
    setBrandAssetForm({ url: currentUrl })
    setShowBrandAssetModal(true)
  }

  const handleBrandAssetImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBrandAsset(true)
    try {
      const url = await uploadImage(file)
      setBrandAssetForm({ url })
      toast.success('Image uploaded')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingBrandAsset(false)
    }
  }

  const saveBrandAsset = async () => {
    if (!brandAssetTenantId || !brandAssetType || !brandAssetForm.url) {
      toast.error('Please provide a URL or upload an image')
      return
    }

    try {
      const existingAsset = (tenantBrandAssets[brandAssetTenantId] || []).find((a: any) => a.type === brandAssetType)

      if (existingAsset) {
        await fetch(`/api/brand-assets/${existingAsset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: brandAssetForm.url }),
        })
      } else {
        await fetch('/api/brand-assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: brandAssetTenantId,
            type: brandAssetType,
            url: brandAssetForm.url,
          }),
        })
      }

      setShowBrandAssetModal(false)
      fetchTenantData(brandAssetTenantId)
      toast.success('Brand asset updated')
    } catch (error) {
      toast.error('Failed to save brand asset')
    }
  }

  // Open Add Outlet modal for a specific tenant
  const openAddOutletModal = (tenantId: string) => {
    setOutletTenantId(tenantId)
    setOutletPin(String(Math.floor(100000 + Math.random() * 900000)))
    setOutletForm({
      name: '',
      location: '',
      latitude: '',
      longitude: '',
      features: { qris: true, voucher: true, cashless: true }
    })
    setSelectedLatLng(null)
    setShowAddOutletModal(true)
  }

  // Create new outlet for the tenant
  const createOutletForTenant = async () => {
    if (!outletTenantId || !outletForm.name || !outletForm.location) {
      toast.error('Nama dan lokasi outlet wajib diisi')
      return
    }

    setCreatingOutlet(true)
    try {
      const mapsUrl = outletForm.latitude && outletForm.longitude
        ? `https://maps.google.com/?q=${outletForm.latitude},${outletForm.longitude}`
        : ''

      const res = await fetch('/api/outlets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: outletTenantId,
          name: outletForm.name,
          location: outletForm.location,
          latitude: outletForm.latitude,
          longitude: outletForm.longitude,
          mapsUrl,
          features: outletForm.features,
          pin: outletPin,
        })
      })

      if (res.ok) {
        const newOutlet = await res.json()
        toast.success('Outlet berhasil ditambahkan', {
          description: `ID: ${newOutlet.machineId}`,
          duration: 5000,
        })
        setShowAddOutletModal(false)
        fetchTenantData(outletTenantId)
      } else {
        const err = await res.json()
        toast.error(err.message || 'Gagal menambahkan outlet')
      }
    } catch (error) {
      toast.error('Gagal menambahkan outlet')
    } finally {
      setCreatingOutlet(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const handleAddTenant = async (data: any) => {
    try {
      const tenantPayload = data.tenant || data
      const userPayload = data.user

      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantPayload),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.message || 'Failed to create tenant')
        return
      }

      const newTenant = await res.json()

      if (userPayload) {
        const userRes = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: newTenant.id,
            name: userPayload.name,
            email: userPayload.email,
            password: userPayload.password,
            role: 'owner',
            status: 'active',
          }),
        })

        if (!userRes.ok) {
          const userErr = await userRes.json()
          toast.warning('Tenant created, but failed to create owner user: ' + (userErr.message || ''))
        } else {
          const newUser = await userRes.json()
          // Refresh users in store
          const refreshUsers = await fetch('/api/users')
          if (refreshUsers.ok) {
            const freshUsers = await refreshUsers.json()
            useDashboardStore.getState().setUsers(freshUsers)
          }
          toast.success('Tenant & owner user created successfully')
        }
      } else {
        toast.success('Tenant created successfully')
      }

      setTenants(prev => [newTenant, ...prev])
    } catch (error) {
      toast.error('Failed to create tenant')
    }
  }

  const handleEditTenant = async (data: any) => {
    if (!editingTenant) return
    try {
      const res = await fetch(`/api/tenants/${editingTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const updated = await res.json()
        setTenants(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
        setEditingTenant(null)
        toast.success('Tenant updated successfully')
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to update tenant')
      }
    } catch (error) {
      toast.error('Failed to update tenant')
    }
  }

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTenants(prev => prev.filter(t => t.id !== tenantId))
        setDeleteConfirmTenantId(null)
        toast.success('Tenant deleted successfully')
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to delete tenant')
      }
    } catch (error) {
      toast.error('Failed to delete tenant')
    }
  }

  const handleDeleteOutlet = async (tenantId: string, outletId: string) => {
    try {
      const res = await fetch(`/api/outlets/${outletId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTenants(prev => prev.map(t => {
          if (t.id !== tenantId) return t
          return { ...t, outlets: t.outlets.filter(o => o.id !== outletId), outletCount: t.outletCount - 1 }
        }))
        setDeleteConfirmOutlet(null)
        toast.success('Outlet berhasil dihapus')
      } else {
        const err = await res.json()
        toast.error(err.message || 'Gagal menghapus outlet')
      }
    } catch (error) {
      toast.error('Gagal menghapus outlet')
    }
  }

  const fetchTenantTransactions = async (tenantId: string, outletIds: string[]) => {
    setTransactionsLoading(prev => ({ ...prev, [tenantId]: true }))
    try {
      const allTransactions: any[] = []
      for (const oid of outletIds) {
        const res = await fetch(`/api/transactions?outletId=${oid}`)
        if (res.ok) {
          const data = await res.json()
          allTransactions.push(...data.map((t: any) => ({ ...t, outletId: oid })))
        }
      }
      setTenantTransactions(prev => ({ ...prev, [tenantId]: allTransactions }))
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setTransactionsLoading(prev => ({ ...prev, [tenantId]: false }))
    }
  }

  const computeRecap = (transactions: any[]) => {
    const successful = transactions.filter(t => t.status === 'success')
    const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0)
    const totalTransactions = transactions.length
    const successfulTransactions = successful.length
    return { totalRevenue, totalTransactions, successfulTransactions }
  }

  const toggleExpand = (tenantId: string) => {
    const newExpanded = new Set(expandedTenants)
    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId)
    } else {
      newExpanded.add(tenantId)
      fetchTenantData(tenantId)
      // Fetch transactions for recap
      const tenant = tenants.find(t => t.id === tenantId)
      if (tenant && tenant.outlets.length > 0 && !tenantTransactions[tenantId]) {
        fetchTenantTransactions(tenantId, tenant.outlets.map(o => o.id))
      }
    }
    setExpandedTenants(newExpanded)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all vendors and their outlets</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Tenant
          </button>
        )}
      </div>

      {/* Tenants List */}
      <div className="space-y-4">
        {tenants.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border dark:border-gray-800">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No tenants found. Create your first tenant.</p>
          </div>
        ) : (
          tenants.map((tenant) => {
            const isExpanded = expandedTenants.has(tenant.id)

            return (
              <div
                key={tenant.id}
                className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 overflow-hidden"
              >
                {/* Tenant Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  onClick={() => toggleExpand(tenant.id)}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: tenant.primaryColor }}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{tenant.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tenant.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                        }`}>
                          {tenant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{tenant.phone || 'No phone'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Store className="w-4 h-4" />
                      <span>{tenant.outletCount} outlets</span>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500">
                      {tenant.subscriptionPlan}
                    </div>
                    {!isStaff && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTenant(tenant)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                        title="Edit Tenant"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {!isStaff && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirmTenantId(tenant.id)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Hapus Tenant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Outlets */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50"
                    >
                      <div className="p-4">
                        {/* Transaction Recap */}
                        {tenantTransactions[tenant.id] && (
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border dark:border-gray-700">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                Rp {(computeRecap(tenantTransactions[tenant.id]).totalRevenue || 0).toLocaleString('id-ID')}
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border dark:border-gray-700">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Transactions</div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {computeRecap(tenantTransactions[tenant.id]).totalTransactions}
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border dark:border-gray-700">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Successful</div>
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {computeRecap(tenantTransactions[tenant.id]).successfulTransactions}
                              </div>
                            </div>
                          </div>
                        )}
                        {transactionsLoading[tenant.id] && (
                          <div className="text-xs text-gray-500 mb-4">Loading recap...</div>
                        )}

                         <div className="flex items-center justify-between mb-3">
                           <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                             <Store className="w-4 h-4" />
                             Outlets ({tenant.outlets.length})
                           </h4>
                           {!isStaff && (
                             <button
                               onClick={() => openAddOutletModal(tenant.id)}
                               className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                             >
                               + Add Outlet
                             </button>
                           )}
                         </div>

                        {tenant.outlets.length === 0 ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400 py-3">
                            No outlets yet for this tenant.
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {tenant.outlets.map((outlet) => {
                              const outletTx = (tenantTransactions[tenant.id] || []).filter((t: any) => t.outletId === outlet.id)
                              const outletRecap = computeRecap(outletTx)
                              return (
                                <div
                                  key={outlet.id}
                                  onClick={() => {
                                    setSelectedOutletId(outlet.id)
                                    setActiveModule('outlet-detail')
                                  }}
                                  className="group bg-white dark:bg-gray-900 rounded-lg p-3 border dark:border-gray-700 flex items-center justify-between cursor-pointer hover:border-purple-400 hover:shadow-sm transition-all"
                                >
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{outlet.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3" /> {outlet.address || 'No address'}
                                    </div>
                                    {outletRecap.totalTransactions > 0 && (
                                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                                        <span>Revenue: Rp {outletRecap.totalRevenue.toLocaleString('id-ID')}</span>
                                        <span>Tx: {outletRecap.totalTransactions}</span>
                                      </div>
                                    )}
                                  </div>
                                   <div className="flex items-center gap-3 text-xs">
                                   <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 font-mono">
                                     {outlet.machineId}
                                   </span>
                                   <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-400 font-mono">
                                     PIN: {outlet.pin}
                                   </span>
                                     <span className={`px-2 py-0.5 rounded ${
                                       outlet.isActive 
                                         ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                         : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                     }`}>
                                       {outlet.isActive ? 'Active' : 'Inactive'}
                                     </span>

                                     {!isStaff && (
                                       <button
                                         onClick={(e) => {
                                           e.stopPropagation()
                                           setDeleteConfirmOutlet({ tenantId: tenant.id, outletId: outlet.id, outletName: outlet.name })
                                         }}
                                         className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                         title="Hapus outlet"
                                       >
                                         <Trash2 className="w-3.5 h-3.5" />
                                       </button>
                                     )}
                                      <span className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1 group-hover:text-purple-700">
                                        Manage →
                                      </span>
                                    </div>
                                 </div>
                              )
                            })}
                          </div>
                          )}

                         {/* Vouchers */}
                         <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Gift className="w-4 h-4" />
                                Vouchers ({(tenantVouchers[tenant.id] || []).length})
                              </div>
                              {!isStaff && (
                                <button
                                  onClick={() => openVoucherForm(tenant.id)}
                                  className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                  + Add Voucher
                                </button>
                              )}
                            </div>

                           {loadingTenantData[tenant.id] ? (
                             <div className="text-xs text-gray-500 py-2">Loading...</div>
                           ) : (tenantVouchers[tenant.id] || []).length > 0 ? (
                             <div className="space-y-2 text-sm">
                               {(tenantVouchers[tenant.id] || []).map((v) => (
                                 <div key={v.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <div>
                                      <span className="font-medium text-gray-900 dark:text-white">{v.code}</span>
                                      <span className="ml-2 text-xs text-gray-400">
                                        {v.discountType === 'percentage' ? `${v.discountValue}%` : `Rp ${v.discountValue.toLocaleString('id-ID')}`}
                                        {v.minPurchase > 0 && ` / min Rp ${v.minPurchase.toLocaleString('id-ID')}`}
                                      </span>
                                      <span className={`ml-2 text-xs ${v.isActive ? 'text-green-500' : 'text-red-400'}`}>
                                        {v.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                      <span className="ml-2 text-[10px] text-gray-400 font-mono">
                                        tenant: {v.tenantId?.substring(0, 8) || '?'}
                                      </span>
                                   </div>
                                   <div className="flex gap-2 text-xs">
                                     {!isStaff && (
                                       <>
                                         <button
                                           onClick={() => openVoucherForm(tenant.id, v)}
                                           className="text-purple-600 hover:underline"
                                         >
                                           Edit
                                         </button>
                                         <button
                                           onClick={() => setDeleteConfirmVoucher({ tenantId: tenant.id, voucherId: v.id })}
                                           className="text-red-600 hover:underline"
                                         >
                                           Delete
                                         </button>
                                       </>
                                     )}
                                   </div>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <div className="text-xs text-gray-500 py-2">
                               No vouchers yet. Add your first voucher for this tenant.
                             </div>
                           )}
                         </div>

                         {/* Real Frame Templates & Brand Assets from Database */}
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                          
                          {/* Frame Templates - Real CRUD */}
                          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Image className="w-4 h-4" />
                                Frame Templates ({(tenantTemplates[tenant.id] || []).length})
                              </div>
                              {!isStaff && (
                                <button
                                  onClick={() => openTemplateModal(tenant.id)}
                                  className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                  + Add Template
                                </button>
                              )}
                            </div>

                            {loadingTenantData[tenant.id] ? (
                              <div className="text-xs text-gray-500 py-2">Loading...</div>
                            ) : (tenantTemplates[tenant.id] || []).length > 0 ? (
                              <div className="space-y-2 text-sm">
                                {(tenantTemplates[tenant.id] || []).map((t: any) => (
                                  <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                     <div>
                                       <span className="font-medium text-gray-900 dark:text-white">{t.name}</span>
                                       <span className="ml-2 text-xs text-gray-400 dark:text-gray-400">Rp {t.price}</span>
                                     </div>
                                     <div className="flex gap-2 text-xs">
                                       {!isStaff && (
                                         <>
                                           <button 
                                             onClick={() => openTemplateModal(tenant.id, t)}
                                             className="text-purple-600 hover:underline"
                                           >
                                             Edit
                                           </button>
                                           <button 
                                             onClick={() => {
                                               if (confirm('Delete this template?')) {
                                                 fetch(`/api/templates/${t.id}`, { method: 'DELETE' })
                                                   .then(() => fetchTenantData(tenant.id))
                                               }
                                             }}
                                             className="text-red-600 hover:underline"
                                           >
                                             Delete
                                           </button>
                                         </>
                                       )}
                                     </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 py-2">
                                No templates yet. Add your first frame template for this tenant.
                              </div>
                            )}
                          </div>

                          {/* Brand Assets - Real from Database */}
                          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Image className="w-4 h-4" />
                                Brand Assets
                              </div>
                              <button
                                onClick={() => fetchTenantData(tenant.id)}
                                className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
                              >
                                Refresh
                              </button>
                            </div>

                            {loadingTenantData[tenant.id] ? (
                              <div className="text-xs text-gray-500">Loading assets...</div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {['LOGO', 'HERO_IMAGE', 'FAVICON', 'BANNER'].map((type) => {
                                  const asset = (tenantBrandAssets[tenant.id] || []).find((a: any) => a.type === type)
                                  return (
                                    <div key={type} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                      <div className="flex items-center justify-between mb-1">
                                         <span className="text-xs font-medium text-gray-900 dark:text-white">{type.replace('_', ' ')}</span>
                                         {!isStaff && (
                                           <button 
                                             onClick={() => openBrandAssetModal(tenant.id, type, asset?.url || '')}
                                             className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                           >
                                             {asset?.url ? 'Edit' : 'Add'}
                                           </button>
                                         )}
                                      </div>
                                      {asset?.url ? (
                                        <div className="w-full h-20 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                          <img
                                            src={asset.url}
                                            alt={type}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-full h-20 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-400">
                                          No image
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                        </div>

                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            )
          })
        )}
      </div>

      {/* Add / Edit Tenant Modal */}
      <AnimatePresence>
        {(showForm || editingTenant) && (
          <TenantForm 
            tenant={editingTenant}
            onClose={() => {
              setShowForm(false)
              setEditingTenant(null)
            }} 
            onSubmit={editingTenant ? handleEditTenant : handleAddTenant} 
          />
        )}
      </AnimatePresence>

      {/* Template Modal - with File Upload */}
      <AnimatePresence>
        {showTemplateModal && (
          <div 
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowTemplateModal(false)}
          >
            <div 
              className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'Add New Template'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Classic 4R"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="FOUR_R">4R Classic</option>
                    <option value="A4_NEWSPAPER">A4 Newspaper</option>
                    <option value="GIF">GIF Animated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Price (IDR)</label>
                  <input
                    type="number"
                    value={templateForm.price}
                    onChange={(e) => setTemplateForm({ ...templateForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Template Image</label>
                  
                  {templateForm.imageUrl && (
                    <div className="mb-2">
                      <img 
                        src={templateForm.imageUrl} 
                        alt="Preview" 
                        className="w-full max-h-40 object-contain rounded border dark:border-gray-700 bg-gray-50 dark:bg-gray-800" 
                      />
                    </div>
                  )}

                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </label>

                  <input
                    type="text"
                    value={templateForm.imageUrl}
                    onChange={(e) => setTemplateForm({ ...templateForm, imageUrl: e.target.value })}
                    placeholder="Or paste image URL"
                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTemplate}
                  disabled={!templateForm.name || uploadingImage}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Brand Asset Edit Modal with File Upload */}
      <AnimatePresence>
        {showBrandAssetModal && (
          <div 
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowBrandAssetModal(false)}
          >
            <div 
              className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Edit {brandAssetType.replace('_', ' ')}
              </h3>

              <div className="space-y-4">
                {brandAssetForm.url && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Current Preview</label>
                    <img 
                      src={brandAssetForm.url} 
                      alt="Preview" 
                      className="w-full max-h-48 object-contain rounded border dark:border-gray-700 bg-gray-50 dark:bg-gray-800" 
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Image / URL</label>
                  
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 mb-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleBrandAssetImageUpload} 
                      className="hidden" 
                    />
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadingBrandAsset ? 'Uploading...' : 'Click to upload image'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG recommended</p>
                    </div>
                  </label>

                  <input
                    type="text"
                    value={brandAssetForm.url}
                    onChange={(e) => setBrandAssetForm({ url: e.target.value })}
                    placeholder="Or paste direct image URL"
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBrandAssetModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBrandAsset}
                  disabled={!brandAssetForm.url || uploadingBrandAsset}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Save Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Outlet Modal (per tenant) */}
      <AnimatePresence>
        {showAddOutletModal && (
          <div 
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowAddOutletModal(false)}
          >
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Tambah Outlet Baru
            </h3>

              <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Nama Outlet</label>
                  <input
                    type="text"
                    value={outletForm.name}
                    onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })}
                    placeholder="SnapNext Mall"
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Alamat / Lokasi</label>
                  <input
                    type="text"
                    value={outletForm.location}
                    onChange={(e) => setOutletForm({ ...outletForm, location: e.target.value })}
                    placeholder="Jl. Merdeka No. 123"
                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">PIN (untuk login device)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={outletPin}
                      onChange={(e) => setOutletPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-lg tracking-widest"
                      maxLength={6}
                      placeholder="123456"
                    />
                    <button
                      type="button"
                      onClick={() => setOutletPin(String(Math.floor(100000 + Math.random() * 900000)))}
                      className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 text-sm"
                      title="Generate PIN"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">6 digit angka untuk autentikasi device booth</p>
                </div>

                {/* Lokasi Peta */}
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Lokasi di Peta</label>
                  <div className="space-y-2">
                    <LocationMap
                      selectedLatLng={selectedLatLng}
                      onMapClick={(lat, lng) => {
                        setSelectedLatLng({ lat, lng })
                        setOutletForm(prev => ({
                          ...prev,
                          latitude: lat.toString(),
                          longitude: lng.toString()
                        }))
                      }}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Latitude</label>
                        <input
                          type="text"
                          value={outletForm.latitude}
                          onChange={(e) => {
                            const val = e.target.value
                            setOutletForm(prev => ({ ...prev, latitude: val }))
                            if (val && outletForm.longitude) {
                              const lat = parseFloat(val)
                              const lng = parseFloat(outletForm.longitude)
                              if (!isNaN(lat) && !isNaN(lng)) {
                                setSelectedLatLng({ lat, lng })
                              }
                            }
                          }}
                          placeholder="-6.2088"
                          className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Longitude</label>
                        <input
                          type="text"
                          value={outletForm.longitude}
                          onChange={(e) => {
                            const val = e.target.value
                            setOutletForm(prev => ({ ...prev, longitude: val }))
                            if (outletForm.latitude && val) {
                              const lat = parseFloat(outletForm.latitude)
                              const lng = parseFloat(val)
                              if (!isNaN(lat) && !isNaN(lng)) {
                                setSelectedLatLng({ lat, lng })
                              }
                            }
                          }}
                          placeholder="106.8456"
                          className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords
                              setSelectedLatLng({ lat: latitude, lng: longitude })
                              setOutletForm(prev => ({
                                ...prev,
                                latitude: latitude.toString(),
                                longitude: longitude.toString()
                              }))
                              toast.success('Lokasi saat ini berhasil dipilih')
                            },
                            (error) => {
                              toast.error('Tidak dapat mengakses lokasi: ' + error.message)
                            }
                          )
                        } else {
                          toast.error('Geolocation tidak didukung di browser ini')
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2 text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      Gunakan Lokasi Saat Ini
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Klik pada peta atau isi koordinat di atas untuk menentukan lokasi outlet
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-white">Fitur Pembayaran</label>
                  <div className="space-y-2">
                    {[
                      { key: 'qris', label: 'QRIS' },
                      { key: 'voucher', label: 'Voucher' },
                      { key: 'cashless', label: 'Cashless' }
                    ].map((f) => (
                      <label key={f.key} className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={outletForm.features[f.key as keyof typeof outletForm.features]}
                          onChange={(e) => setOutletForm({
                            ...outletForm,
                            features: {
                              ...outletForm.features,
                              [f.key]: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddOutletModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Batal
                </button>
                <button
                  onClick={createOutletForTenant}
                  disabled={creatingOutlet || !outletForm.name || !outletForm.location}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {creatingOutlet ? 'Menyimpan...' : 'Tambah Outlet'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Voucher Form Modal */}
      <AnimatePresence>
        {showVoucherForm && (
          <VoucherForm
            voucher={editingVoucher}
            onClose={() => { setShowVoucherForm(false); setEditingVoucher(null) }}
            onSubmit={handleSaveVoucher}
          />
        )}
      </AnimatePresence>

      {/* Delete Tenant Confirmation */}
      <AnimatePresence>
        {deleteConfirmTenantId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmTenantId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Hapus Tenant?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Semua data tenant termasuk outlet, template, voucher, dan aset lainnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmTenantId(null)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDeleteTenant(deleteConfirmTenantId)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Outlet Confirmation */}
      <AnimatePresence>
        {deleteConfirmOutlet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmOutlet(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Hapus Outlet?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Outlet <strong>{deleteConfirmOutlet.outletName}</strong> akan dihapus permanen beserta semua data terkait. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmOutlet(null)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDeleteOutlet(deleteConfirmOutlet.tenantId, deleteConfirmOutlet.outletId)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Voucher Confirmation */}
      <AnimatePresence>
        {deleteConfirmVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmVoucher(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Hapus Voucher?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Voucher ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmVoucher(null)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDeleteVoucher(deleteConfirmVoucher.tenantId, deleteConfirmVoucher.voucherId)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
