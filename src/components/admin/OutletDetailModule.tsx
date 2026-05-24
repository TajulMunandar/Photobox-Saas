'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Settings, 
  Monitor, 
  Camera, 
  CreditCard,
  UserCircleIcon,
  MapPin,
  Clock,
  Star
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const LocationMap = dynamic(() => import('@/components/admin/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-lg border dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <p className="text-sm text-gray-500">Memuat peta...</p>
    </div>
  ),
})

interface OutletDetail {
  id: string
  name: string
  location: string
  address: string
  phone: string
  latitude: string
  longitude: string
  mapsUrl: string
  machineId: string
  pin: string
  isActive: boolean
  status: string
  lastHeartbeat: string | null
  features: {
    qris: boolean
    voucher: boolean
    cashless: boolean
  }
  config: {
    priceDefault: number
    printEnabled: boolean
    galleryEnabled: boolean
    gifEnabled: boolean
    newspaperEnabled: boolean
    paymentMethods: any
  } | null
  recentHeartbeats: any[]
  createdAt: string
}

export function OutletDetailModule() {
  const { selectedOutletId, setSelectedOutletId, setActiveModule } = useDashboardStore()
  const { user } = useAuth()
  const isStaff = user?.role?.toUpperCase() === 'STAFF'
  const [outlet, setOutlet] = useState<OutletDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'machine' | 'sessions' | 'assets'>('overview')
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [mapSearchQuery, setMapSearchQuery] = useState('')
  const [mapSearchInput, setMapSearchInput] = useState('')
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(false)

  const goBack = () => {
    setSelectedOutletId(null)
    setActiveModule('tenants')
  }

  const fetchOutletDetail = async () => {
    if (!selectedOutletId) return

    try {
      setLoading(true)
      const res = await fetch(`/api/outlets/${selectedOutletId}`)
      if (res.ok) {
        const data = await res.json()
        setOutlet(data)
        const lat = data.latitude || ''
        const lng = data.longitude || ''
        if (lat && lng) {
          setMapPosition({ lat: parseFloat(lat), lng: parseFloat(lng) })
        } else {
          setMapPosition(null)
        }
        setFormData({
          name: data.name,
          location: data.location || data.address,
          latitude: lat,
          longitude: lng,
          mapsUrl: data.mapsUrl,
          features: { ...data.features },
          isActive: data.isActive,
          config: data.config ? {
            priceDefault: data.config.priceDefault,
            printEnabled: data.config.printEnabled,
            galleryEnabled: data.config.galleryEnabled,
            gifEnabled: data.config.gifEnabled,
            newspaperEnabled: data.config.newspaperEnabled,
            paymentMethods: data.config.paymentMethods
              ? { ...data.config.paymentMethods }
              : { cash: true, qris: true, voucher: true },
          } : null,
        })
      } else {
        const err = await res.json().catch(() => ({}))
        console.error('Outlet detail load failed:', err)
        toast.error(err.message || 'Failed to load outlet details (permission or not found)')
        goBack()
      }
    } catch (error) {
      toast.error('Failed to load outlet')
      goBack()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedOutletId) {
      fetchOutletDetail()
    } else {
      goBack()
    }
  }, [selectedOutletId])

  const fetchSessions = async () => {
    if (!selectedOutletId) return
    setSessionsLoading(true)
    try {
      const res = await fetch(`/api/sessions?outletId=${selectedOutletId}`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setSessionsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'sessions' && selectedOutletId) {
      fetchSessions()
    }
  }, [activeTab, selectedOutletId])

  const fetchTestimonials = async () => {
    if (!selectedOutletId) return
    setTestimonialsLoading(true)
    try {
      const res = await fetch(`/api/testimonials?outletId=${selectedOutletId}`)
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    } finally {
      setTestimonialsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'assets' && selectedOutletId) {
      fetchTestimonials()
    }
  }, [activeTab, selectedOutletId])

  const handleSave = async () => {
    if (!selectedOutletId) return

    try {
      const res = await fetch(`/api/outlets/${selectedOutletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Outlet updated successfully')
        setEditing(false)
        fetchOutletDetail()
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to update outlet')
      }
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  if (loading || !outlet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'machine', label: 'Machine Status', icon: Monitor },
    { id: 'sessions', label: 'Photo Sessions', icon: Camera },
    { id: 'assets', label: 'Testimony', icon: UserCircleIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tenants
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {outlet.name}
              <span className={`text-xs px-2 py-1 rounded-full ${
                outlet.isActive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {outlet.isActive ? 'Active' : 'Inactive'}
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4" /> {outlet.address || outlet.location}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {editing ? (
            <>
                <button
                  onClick={() => {
                    setEditing(false)
                    const lat = outlet.latitude || ''
                    const lng = outlet.longitude || ''
                    if (lat && lng) {
                      setMapPosition({ lat: parseFloat(lat), lng: parseFloat(lng) })
                    } else {
                      setMapPosition(null)
                    }
                  setFormData({
                    name: outlet.name,
                    location: outlet.location,
                    latitude: lat,
                    longitude: lng,
                    mapsUrl: outlet.mapsUrl,
                    features: { ...outlet.features },
                    isActive: outlet.isActive,
                    config: outlet.config ? {
                      priceDefault: outlet.config.priceDefault,
                      printEnabled: outlet.config.printEnabled,
                      galleryEnabled: outlet.config.galleryEnabled,
                      gifEnabled: outlet.config.gifEnabled,
                      newspaperEnabled: outlet.config.newspaperEnabled,
                    } : null,
                  })
                  }}
                  className="px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </>
          ) : !isStaff ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Edit className="w-4 h-4" /> Edit Outlet
            </button>
          ) : null}
        </div>
      </div>

      {/* Machine ID + Quick Info */}
      <div className="flex items-center gap-4 text-sm">
        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-gray-700 dark:text-gray-300">
          {outlet.machineId}
        </div>
        <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg font-mono text-purple-600 dark:text-purple-400">
          PIN: {outlet.pin}
        </div>
        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Last seen: {outlet.lastHeartbeat ? new Date(outlet.lastHeartbeat).toLocaleString('id-ID') : 'Never'}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b dark:border-gray-800">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Outlet Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{outlet.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Address / Location</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{outlet.address}</p>
                  )}
                </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Lokasi di Peta</label>
                    <div className="mt-1">
                      <LocationMap
                        selectedLatLng={mapPosition}
                        onMapClick={editing ? (lat, lng) => {
                          setMapPosition({ lat, lng })
                          setFormData((prev: any) => ({
                            ...prev,
                            latitude: lat.toString(),
                            longitude: lng.toString(),
                            mapsUrl: `https://maps.google.com/?q=${lat},${lng}`
                          }))
                        } : undefined}
                      />
                    </div>
                    {editing && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Klik pada peta untuk memilih lokasi outlet
                      </p>
                    )}
                  </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                   <div className="text-gray-400 dark:text-gray-400">Status</div>
                   <div className="font-semibold text-lg text-gray-900 dark:text-white">{outlet.status}</div>
                 </div>
                 <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                   <div className="text-gray-400 dark:text-gray-400">Machine ID</div>
                   <div className="font-mono font-semibold text-gray-900 dark:text-white">{outlet.machineId}</div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <CreditCard className="w-5 h-5" /> Outlet Configuration
            </h3>

            {outlet.config && formData.config ? (
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Default Price (IDR)</label>
                  {editing ? (
                    <input
                      type="number"
                      value={formData.config.priceDefault}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, priceDefault: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      Rp {outlet.config?.priceDefault?.toLocaleString('id-ID') || '0'}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Enabled Features</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: 'printEnabled', label: 'Print' },
                      { key: 'galleryEnabled', label: 'Gallery' },
                      { key: 'gifEnabled', label: 'GIF' },
                      { key: 'newspaperEnabled', label: 'Newspaper' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                        {editing ? (
                          <input
                            type="checkbox"
                            checked={formData.config[item.key as keyof typeof formData.config]}
                            onChange={(e) => setFormData({
                              ...formData,
                              config: { ...formData.config, [item.key]: e.target.checked }
                            })}
                            className="w-4 h-4 text-purple-600"
                          />
                        ) : (
                          <span className={formData.config[item.key as keyof typeof formData.config] ? 'text-green-600' : 'text-red-600'}>
                            {formData.config[item.key as keyof typeof formData.config] ? 'ON' : 'OFF'}
                          </span>
                        )}
                        <span className="text-sm text-gray-900 dark:text-white">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Payment Methods</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'cash', label: 'Cash' },
                      { key: 'qris', label: 'QRIS' },
                      { key: 'voucher', label: 'Voucher' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                        {editing ? (
                          <input
                            type="checkbox"
                            checked={formData.config.paymentMethods?.[item.key] ?? false}
                            onChange={(e) => setFormData({
                              ...formData,
                              config: {
                                ...formData.config,
                                paymentMethods: {
                                  ...formData.config.paymentMethods,
                                  [item.key]: e.target.checked
                                }
                              }
                            })}
                            className="w-4 h-4 text-purple-600"
                          />
                        ) : (
                          <span className={formData.config.paymentMethods?.[item.key] ? 'text-green-600' : 'text-red-600'}>
                            {formData.config.paymentMethods?.[item.key] ? 'ON' : 'OFF'}
                          </span>
                        )}
                        <span className="text-sm text-gray-900 dark:text-white">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No configuration found for this outlet.</p>
            )}
          </div>
        )}

        {/* MACHINE STATUS */}
        {activeTab === 'machine' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Recent Machine Heartbeats</h3>
            {outlet.recentHeartbeats.length > 0 ? (
              <div className="space-y-3 text-sm">
                {outlet.recentHeartbeats.map((hb, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <span className="font-medium">{hb.status}</span>
                      <div className="text-xs text-gray-500">{new Date(hb.lastSeen).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      CPU: {hb.cpuUsage ?? '-'}% | RAM: {hb.memoryUsage ?? '-'}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No heartbeat data yet.</p>
            )}
          </div>
        )}

        {/* SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Photo Sessions</h3>
              <button
                onClick={fetchSessions}
                className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada sesi foto untuk outlet ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {session.sessionCode || session.id.slice(0, 8)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          session.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : session.status === 'PROCESSING'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {session.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          session.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : session.paymentStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {session.paymentStatus || 'PENDING'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{session.photoCount} foto</span>
                      {session.paymentMethod && (
                        <span>Pembayaran: {session.paymentMethod}</span>
                      )}
                      {session.totalPrice > 0 && (
                        <span>Rp {session.totalPrice.toLocaleString('id-ID')}</span>
                      )}
                      {session.voucherCode && (
                        <span>Voucher: {session.voucherCode}</span>
                      )}
                    </div>

                    {session.photos && session.photos.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {(Array.isArray(session.photos) ? session.photos : []).slice(0, 4).map((photo: string, i: number) => (
                          <div key={i} className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                            <img
                              src={typeof photo === 'string' ? photo : photo}
                              alt={`Photo ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {session.photoCount > 4 && (
                          <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                            +{session.photoCount - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {session.gifUrl && (
                      <div className="mt-2">
                        <a href={session.gifUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">
                          Lihat GIF
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASSETS / TESTIMONY */}
        {activeTab === 'assets' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Customer Testimonials</h3>
              <button
                onClick={fetchTestimonials}
                className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>

            {testimonialsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12">
                <UserCircleIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada testimoni untuk outlet ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((testimonial: any) => (
                  <div
                    key={testimonial.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {testimonial.customerName}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        testimonial.isApproved
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {testimonial.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 mb-2">
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

                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                      &ldquo;{testimonial.comment}&rdquo;
                    </p>

                    <div className="mt-3 text-xs text-gray-400">
                      {new Date(testimonial.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Future sections hint */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t dark:border-gray-800">
        More management tools coming: Templates • Vouchers • Testimonials • Users • Gallery Settings • etc.
      </div>
    </div>
  )
}
