import { create } from 'zustand'

// ============================================
// Types
// ============================================

export interface Outlet {
  id: string
  name: string
  location: string
  mapsUrl: string
  status: 'online' | 'offline' | 'error'
  features: {
    qris: boolean
    voucher: boolean
    cashless: boolean
  }
  lastHeartbeat: string
  createdAt: string
}

export interface Template {
  id: string
  name: string
  category: '4R' | 'A4 Newspaper' | 'GIF'
  imageUrl: string
  price: number
  isActive: boolean
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'owner' | 'manager' | 'staff'
  outletId?: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Voucher {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchase: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: string
}

export interface Testimonial {
  id: string
  customerName: string
  rating: number
  comment: string
  outletId: string
  isApproved: boolean
  createdAt: string
}

export interface Branding {
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  heroBannerUrl: string
  companyName: string
  tagline: string
}

export interface Transaction {
  id: string
  outletId: string
  amount: number
  status: 'success' | 'pending' | 'failed'
  paymentMethod: string
  createdAt: string
}

export interface BoothStatus {
  id: string
  name: string
  outletId: string
  status: 'online' | 'offline' | 'error'
  lastPhoto: string
}

// ============================================
// Dashboard Store
// ============================================

interface DashboardState {
  // Data
  outlets: Outlet[]
  templates: Template[]
  users: User[]
  vouchers: Voucher[]
  testimonials: Testimonial[]
  branding: Branding
  transactions: Transaction[]
  boothStatuses: BoothStatus[]
  
  // UI State
  darkMode: boolean
  sidebarOpen: boolean
  activeModule: string
  searchQuery: string
  
  // Actions - Outlets
  addOutlet: (outlet: Omit<Outlet, 'id' | 'createdAt'>) => void
  updateOutlet: (id: string, data: Partial<Outlet>) => void
  deleteOutlet: (id: string) => void
  
  // Actions - Templates
  addTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void
  updateTemplate: (id: string, data: Partial<Template>) => void
  deleteTemplate: (id: string) => void
  
  // Actions - Users
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  
  // Actions - Vouchers
  addVoucher: (voucher: Omit<Voucher, 'id' | 'createdAt' | 'code' | 'usedCount'>) => void
  updateVoucher: (id: string, data: Partial<Voucher>) => void
  deleteVoucher: (id: string) => void
  
  // Actions - Testimonials
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'createdAt'>) => void
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void
  deleteTestimonial: (id: string) => void
  
  // Actions - Branding
  updateBranding: (data: Partial<Branding>) => void
  
  // Actions - UI
  toggleDarkMode: () => void
  toggleSidebar: () => void
  setActiveModule: (module: string) => void
  setSearchQuery: (query: string) => void
}

// ============================================
// Mock Data
// ============================================

const mockOutlets: Outlet[] = [
  {
    id: '1',
    name: 'Mall Kelapa Gading',
    location: 'Jakarta Utara',
    mapsUrl: 'https://maps.google.com/?q=-6.1588,106.9056',
    status: 'online',
    features: { qris: true, voucher: true, cashless: true },
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Grand Indonesia',
    location: 'Jakarta Pusat',
    mapsUrl: 'https://maps.google.com/?q=-6.1944,106.8229',
    status: 'online',
    features: { qris: true, voucher: true, cashless: true },
    lastHeartbeat: new Date().toISOString(),
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Senayan City',
    location: 'Jakarta Selatan',
    mapsUrl: 'https://maps.google.com/?q=-6.2297,106.7983',
    status: 'offline',
    features: { qris: true, voucher: false, cashless: true },
    lastHeartbeat: new Date(Date.now() - 3600000).toISOString(),
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: '4',
    name: 'Pacific Place',
    location: 'Jakarta Selatan',
    mapsUrl: 'https://maps.google.com/?q=-6.2261,106.8092',
    status: 'error',
    features: { qris: true, voucher: true, cashless: false },
    lastHeartbeat: new Date(Date.now() - 1800000).toISOString(),
    createdAt: '2024-02-10T10:00:00Z'
  }
]

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Classic 4R Frame',
    category: '4R',
    imageUrl: '/templates/classic-4r.png',
    price: 15000,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    name: 'Modern A4 Newspaper',
    category: 'A4 Newspaper',
    imageUrl: '/templates/modern-a4.png',
    price: 25000,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Animated GIF Frame',
    category: 'GIF',
    imageUrl: '/templates/animated-gif.gif',
    price: 35000,
    isActive: true,
    createdAt: '2024-02-01T10:00:00Z'
  }
]

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@snapnext.com',
    role: 'owner',
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@snapnext.com',
    role: 'manager',
    outletId: '1',
    status: 'active',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@snapnext.com',
    role: 'staff',
    outletId: '2',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z'
  }
]

const mockVouchers: Voucher[] = [
  {
    id: '1',
    code: 'WELCOME2024',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 50000,
    maxDiscount: 25000,
    usageLimit: 100,
    usedCount: 45,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    code: 'HOLIDAY50K',
    discountType: 'fixed',
    discountValue: 50000,
    minPurchase: 100000,
    usageLimit: 50,
    usedCount: 12,
    validFrom: '2024-06-01T00:00:00Z',
    validUntil: '2024-08-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-05-15T10:00:00Z'
  }
]

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing photo booth experience! The quality was outstanding.',
    outletId: '1',
    isApproved: true,
    createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    rating: 4,
    comment: 'Great service and fun props. Will definitely come back!',
    outletId: '2',
    isApproved: true,
    createdAt: '2024-02-20T10:00:00Z'
  }
]

const mockBranding: Branding = {
  logoUrl: '/logo.png',
  primaryColor: '#a855f7',
  secondaryColor: '#ec4899',
  heroBannerUrl: '/hero-banner.jpg',
  companyName: 'SnapNext',
  tagline: 'Capture Your Moments'
}

const mockTransactions: Transaction[] = [
  {
    id: 'TRX001',
    outletId: '1',
    amount: 50000,
    status: 'success',
    paymentMethod: 'QRIS',
    createdAt: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'TRX002',
    outletId: '2',
    amount: 75000,
    status: 'pending',
    paymentMethod: 'Cash',
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'TRX003',
    outletId: '3',
    amount: 25000,
    status: 'success',
    paymentMethod: 'QRIS',
    createdAt: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 'TRX004',
    outletId: '4',
    amount: 100000,
    status: 'success',
    paymentMethod: 'Card',
    createdAt: new Date(Date.now() - 900000).toISOString()
  }
]

const mockBoothStatuses: BoothStatus[] = [
  {
    id: '1',
    name: 'Booth #1 - Kelapa Gading',
    outletId: '1',
    status: 'online',
    lastPhoto: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: '2',
    name: 'Booth #2 - Grand Indonesia',
    outletId: '2',
    status: 'online',
    lastPhoto: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: '3',
    name: 'Booth #3 - Senayan City',
    outletId: '3',
    status: 'offline',
    lastPhoto: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '4',
    name: 'Booth #4 - Pacific Place',
    outletId: '4',
    status: 'error',
    lastPhoto: new Date(Date.now() - 1800000).toISOString()
  }
]

// ============================================
// Helper Functions
// ============================================

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ============================================
// Store
// ============================================

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial Data
  outlets: mockOutlets,
  templates: mockTemplates,
  users: mockUsers,
  vouchers: mockVouchers,
  testimonials: mockTestimonials,
  branding: mockBranding,
  transactions: mockTransactions,
  boothStatuses: mockBoothStatuses,
  
  // Initial UI State
  darkMode: false,
  sidebarOpen: true,
  activeModule: 'dashboard',
  searchQuery: '',
  
  // Outlets Actions
  addOutlet: (outlet) => set((state) => ({
    outlets: [...state.outlets, { ...outlet, id: generateId(), createdAt: new Date().toISOString() }]
  })),
  
  updateOutlet: (id, data) => set((state) => ({
    outlets: state.outlets.map((o) => (o.id === id ? { ...o, ...data } : o))
  })),
  
  deleteOutlet: (id) => set((state) => ({
    outlets: state.outlets.filter((o) => o.id !== id)
  })),
  
  // Templates Actions
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, { ...template, id: generateId(), createdAt: new Date().toISOString() }]
  })),
  
  updateTemplate: (id, data) => set((state) => ({
    templates: state.templates.map((t) => (t.id === id ? { ...t, ...data } : t))
  })),
  
  deleteTemplate: (id) => set((state) => ({
    templates: state.templates.filter((t) => t.id !== id)
  })),
  
  // Users Actions
  addUser: (user) => set((state) => ({
    users: [...state.users, { ...user, id: generateId(), createdAt: new Date().toISOString() }]
  })),
  
  updateUser: (id, data) => set((state) => ({
    users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u))
  })),
  
  deleteUser: (id) => set((state) => ({
    users: state.users.filter((u) => u.id !== id)
  })),
  
  // Vouchers Actions
  addVoucher: (voucher) => set((state) => ({
    vouchers: [...state.vouchers, { 
      ...voucher, 
      id: generateId(), 
      code: generateVoucherCode(),
      usedCount: 0,
      createdAt: new Date().toISOString() 
    }]
  })),
  
  updateVoucher: (id, data) => set((state) => ({
    vouchers: state.vouchers.map((v) => (v.id === id ? { ...v, ...data } : v))
  })),
  
  deleteVoucher: (id) => set((state) => ({
    vouchers: state.vouchers.filter((v) => v.id !== id)
  })),
  
  // Testimonials Actions
  addTestimonial: (testimonial) => set((state) => ({
    testimonials: [...state.testimonials, { ...testimonial, id: generateId(), createdAt: new Date().toISOString() }]
  })),
  
  updateTestimonial: (id, data) => set((state) => ({
    testimonials: state.testimonials.map((t) => (t.id === id ? { ...t, ...data } : t))
  })),
  
  deleteTestimonial: (id) => set((state) => ({
    testimonials: state.testimonials.filter((t) => t.id !== id)
  })),
  
  // Branding Actions
  updateBranding: (data) => set((state) => ({
    branding: { ...state.branding, ...data }
  })),
  
  // UI Actions
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveModule: (module) => set({ activeModule: module }),
  setSearchQuery: (query) => set({ searchQuery: query })
}))
