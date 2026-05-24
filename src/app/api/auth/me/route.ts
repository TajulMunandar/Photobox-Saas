import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  const token = request.headers.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith('auth-token='))
    ?.split('=')[1]

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const user = verifyToken(token)
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user,
  })
}
