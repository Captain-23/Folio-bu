import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants'

const PUBLIC_API_PREFIXES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/verify/send',
  '/api/auth/verify/confirm',
]

const PROTECTED_API_PREFIXES = [
  '/api/uploads',
  '/api/entries',
  '/api/journal',
  '/api/mood',
  '/api/prompt',
  '/api/reflection',
  '/api/reflections',
  '/api/admin',
  '/api/profile',
  '/api/users',
  '/api/notifications',
  '/api/moderation',
  '/api/auth/me',
  '/api/auth/onboarding',
]

function getToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization')
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim() || null
  }
  return req.cookies.get(AUTH_COOKIE_NAME)?.value ?? null
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  if (pathname === '/api/reflection/weekly' && req.method === 'POST') {
    return NextResponse.next()
  }

  if (pathname === '/api/prompt/today' && req.method === 'POST') {
    return NextResponse.next()
  }

  const needsAuth = PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (!needsAuth) {
    return NextResponse.next()
  }

  const token = getToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const payload = await verifyAccessToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
