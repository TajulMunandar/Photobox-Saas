'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  hasRole: () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            setUser(data.user)
          }
        }
      } catch (e) {
        console.error('Failed to fetch user')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const hasRole = (roles: string[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
