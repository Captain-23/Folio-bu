// POST /api/auth/logout — clears auth cookie (client should discard JWT).

import { NextResponse } from 'next/server'
import { clearAuthCookieOptions } from '@/lib/auth/cookies'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  response.cookies.set(clearAuthCookieOptions())
  return response
}
