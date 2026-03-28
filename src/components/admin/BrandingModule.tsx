'use client'

import { useState } from 'react'
import { 
  Palette, 
  Image as ImageIcon, 
  Type, 
  Save,
  Upload,
  X
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// ============================================
// Branding Module Component
// ============================================

export function BrandingModule() {
  const { branding, updateBranding } = useDashboardStore()
  const [formData, setFormData] = useState({
    logoUrl: branding.logoUrl,
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    heroBannerUrl: branding.heroBannerUrl,
    companyName: branding.companyName,
    tagline: branding.tagline
  })

  const handleSave = () => {
    updateBranding(formData)
    toast.success('Branding settings saved successfully!')
  }

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branding & CMS</h1>
          <p className="text-gray-500 dark:text-gray-400">Customize your brand appearance and content</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-purple-500" />
            Company Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            Brand Colors
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded-lg border dark:border-gray-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 rounded-lg border dark:border-gray-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Color Preview */}
            <div className="pt-4">
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="flex gap-2">
                <div 
                  className="w-16 h-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: formData.primaryColor }}
                />
                <div 
                  className="w-16 h-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: formData.secondaryColor }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-500" />
            Logo
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Logo Preview */}
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="w-32 h-32 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {formData.logoUrl ? (
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-500" />
            Hero Banner
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Banner URL</label>
              <input
                type="url"
                value={formData.heroBannerUrl}
                onChange={(e) => setFormData({ ...formData, heroBannerUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Banner Preview */}
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="w-full h-32 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {formData.heroBannerUrl ? (
                  <img 
                    src={formData.heroBannerUrl} 
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Preview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-800"
      >
        <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
        
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Header Preview */}
          <div 
            className="h-16 flex items-center px-6"
            style={{ backgroundColor: formData.primaryColor }}
          >
            <div className="flex items-center gap-3">
              {formData.logoUrl && (
                <img 
                  src={formData.logoUrl} 
                  alt="Logo"
                  className="h-8 w-auto"
                />
              )}
              <span className="text-white font-bold">{formData.companyName}</span>
            </div>
          </div>
          
          {/* Hero Preview */}
          <div 
            className="h-48 flex items-center justify-center relative"
            style={{ 
              background: formData.heroBannerUrl 
                ? `url(${formData.heroBannerUrl}) center/cover`
                : `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`
            }}
          >
            <div className="text-center text-white z-10">
              <h3 className="text-2xl font-bold mb-2">{formData.companyName}</h3>
              <p className="text-lg opacity-90">{formData.tagline}</p>
            </div>
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
