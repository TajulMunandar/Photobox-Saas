import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// ============================================
// Middleware - Protect Admin Routes
// ============================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  const publicPaths = [
    '/admin/login',
    '/api/auth/login',
    '/api/auth/logout',
    '/',
    '/booth',
    '/pricing',
    '/testimonials',
    '/locations',
  ]

  // Check if path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith('/api/') && !pathname.startsWith('/api/admin')
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Protect all /admin routes except login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token
    const user = verifyToken(token)
    if (!user) {
      // Invalid/expired token - redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth-token')
      return response
    }

    // Token valid - allow access
    // Optionally attach user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-tenant-id', user.tenantId)
    response.headers.set('x-user-role', user.role)
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
