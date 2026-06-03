import { AUTH_COOKIE_NAME } from '@/lib/auth/constants'

const MAX_AGE_SEC = 7 * 24 * 60 * 60

export function authCookieOptions(token: string) {
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE_SEC,
  }
}

export function clearAuthCookieOptions() {
  return {
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}
