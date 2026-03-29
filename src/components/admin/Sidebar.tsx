'use client'

import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Image, 
  CreditCard, 
  Settings, 
  BarChart3, 
  QrCode,
  Gift,
  MessageSquare,
  MapPin,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard-store'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// Sidebar Item Component
// ============================================

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  module: string
  active?: boolean
  onClick: () => void
}

function SidebarItem({ icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
        ${active 
          ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'}
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${active ? 'rotate-90' : ''}`} />
    </button>
  )
}

// ============================================
// Sidebar Component
// ============================================

export function Sidebar() {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    activeModule, 
    setActiveModule,
    darkMode,
    toggleDarkMode
  } = useDashboardStore()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard' },
    { icon: Store, label: 'Outlets', module: 'outlets' },
    { icon: Image, label: 'Template Frames', module: 'templates' },
    { icon: Users, label: 'User Management', module: 'users' },
    { icon: Gift, label: 'Vouchers', module: 'vouchers' },
    { icon: MessageSquare, label: 'Testimonials', module: 'testimonials' },
    { icon: MapPin, label: 'Locations', module: 'locations' },
    { icon: BarChart3, label: 'Reports', module: 'reports' },
    { icon: Settings, label: 'Settings', module: 'settings' },
  ]

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transform transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            SnapNext Admin
          </h1>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.module}
              icon={item.icon}
              label={item.label}
              module={item.module}
              active={activeModule === item.module}
              onClick={() => setActiveModule(item.module)}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-800 space-y-2">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          {/* Logout */}
          <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  )
}
