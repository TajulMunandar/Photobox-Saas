import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'snapnext-dev-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: string
  tenantId: string
  email: string
  name: string
  role: string
}

export interface LoginResult {
  success: boolean
  user?: AuthUser
  token?: string
  error?: string
}

// ============================================
// Password Utilities
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================
// JWT Utilities
// ============================================

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      tenantId: decoded.tenantId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }
  } catch (error) {
    return null
  }
}

// ============================================
// Login Function
// ============================================

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return { success: false, error: 'Email atau password salah' }
    }

    if (!user.isActive) {
      return { success: false, error: 'Akun Anda tidak aktif' }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return { success: false, error: 'Email atau password salah' }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Create auth user object
    const authUser: AuthUser = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    // Generate JWT token
    const token = generateToken(authUser)

    return {
      success: true,
      user: authUser,
      token,
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Terjadi kesalahan pada server' }
  }
}

// ============================================
// Get Current User from Request (Legacy + New)
// ============================================

export function getAuth(req: Request): { tenantId: string; user?: AuthUser } {
  const user = getAuthFromRequest(req)
  return {
    tenantId: user?.tenantId || 'cbf37a34-3ecb-450f-b1f6-a61b74b61310',
    user: user || undefined,
  }
}

export function getAuthFromRequest(request: Request): AuthUser | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    return verifyToken(token)
  }

  // Try to get from cookie (for browser requests)
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const token = cookies['auth-token']
    if (token) {
      return verifyToken(token)
    }
  }

  return null
}

// ============================================
// Middleware Helper - Check if user has access
// ============================================

export function hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

// Allowed roles for admin dashboard
export const ADMIN_ROLES = ['SUPER_ADMIN', 'OWNER', 'MANAGER']
