'use client'

import { useState , useEffect} from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User as UserIcon,
  Mail,
  Shield,
  X,
  Check
} from 'lucide-react'
import { useDashboardStore, User } from '@/lib/stores/dashboard-store'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// User Form Component
// ============================================

interface TenantOption {
  id: string
  name: string
}

interface UserFormProps {
  user?: User | null
  tenants: TenantOption[]
  onClose: () => void
  onSubmit: (data: Omit<User, 'id' | 'createdAt'>) => void
}

function UserForm({ user, tenants, onClose, onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'staff',
    tenantId: user?.tenantId || '',
    status: user?.status || 'active',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!user && !formData.password) {
      toast.error('Password is required')
      return
    }
    const { confirmPassword, ...submitData } = formData
    const payload = formData.role === 'SUPER_ADMIN' ? { ...submitData, tenantId: undefined } : submitData
    onSubmit(payload as any)
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
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value, tenantId: e.target.value === 'SUPER_ADMIN' ? '' : formData.tenantId })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager Outlet</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {formData.role !== 'SUPER_ADMIN' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Tenant</label>
              <select
                value={formData.tenantId}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Pilih Tenant</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </>
          )}

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
              {user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// User Module Component
// ============================================

export function UserModule() {
  const { users, addUser, updateUser, deleteUser, searchQuery } = useDashboardStore()
  const { user: currentUser } = useAuth()
  const isManager = currentUser?.role?.toUpperCase() === 'MANAGER'
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [tenants, setTenants] = useState<TenantOption[]>([])

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  
    const matchesRole = filterRole === 'all' || user.role === filterRole
  
    return matchesSearch && matchesRole
  })

  const handleCreate = async (data: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
  
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to create user')
      }

      const refresh = await fetch('/api/users')
      const freshData = await refresh.json()

      useDashboardStore.getState().setUsers(freshData)

      toast.success('User created successfully!')
    } catch (err) {
      toast.error('Failed to create User')
    }
  }

   useEffect(() => {
      const fetchUsers = async () => {
        const res = await fetch('/api/users')
        const data = await res.json()
    
        useDashboardStore.getState().setUsers(data)
      }

      const fetchTenants = async () => {
        const res = await fetch('/api/tenants')
        if (res.ok) {
          const data = await res.json()
          setTenants(data)
        }
      }
    
      fetchUsers()
      fetchTenants()
    }, [])

 const handleUpdate = async (data: Omit<User, 'id' | 'createdAt'>) => {
     if (!editingUser) return 
 
     try {
       const res = await fetch(`/api/users/${editingUser.id}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
       })
 
       const result = await res.json()
       
       if (!res.ok) {
        throw new Error(result.message || 'Failed to create user')
      }

      const refresh = await fetch('/api/users')
      const freshData = await refresh.json()

      useDashboardStore.getState().setUsers(freshData)

       toast.success('Outlet updated successfully!')
     } catch (err) {
         toast.error('Failed to update outlet')
     }
   }

   const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })
  
      if (!res.ok) throw new Error()
  
      deleteUser(id) 
      setDeleteConfirm(null)
      toast.success('Outlet deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete outlet')
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      manager: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      staff: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
    return styles[role as keyof typeof styles] || styles.staff
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage user access and permissions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => useDashboardStore.getState().setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.tenantName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!(isManager && user.role === 'owner') && (
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setShowForm(true)
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      )}
                      {!(isManager && user.role === 'owner') && (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <UserForm
            user={editingUser}
            tenants={tenants}
            onClose={() => {
              setShowForm(false)
              setEditingUser(null)
            }}
            onSubmit={editingUser ? handleUpdate : handleCreate}
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
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Delete User?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                This action cannot be undone. Are you sure you want to delete this user?
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
