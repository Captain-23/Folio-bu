import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants'

export type AuthContext = {
  userId: string
  role: 'STUDENT' | 'ADMIN'
}

function extractBearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  const token = extractBearerToken(req) ?? cookies().get(AUTH_COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyAccessToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isActive: true },
  })

  if (!user || !user.isActive) return null

  return { userId: user.id, role: user.role }
}

export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const ctx = await getAuthContext(req)
  if (!ctx) {
    throw new AuthError('Unauthorised', 401)
  }
  return ctx
}

export class AuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
