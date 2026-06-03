import { NextRequest } from 'next/server'
import { requireAuth, AuthError, type AuthContext } from '@/lib/auth/require-auth'

export async function requireAdmin(req: NextRequest): Promise<AuthContext> {
  const auth = await requireAuth(req)
  if (auth.role !== 'ADMIN') {
    throw new AuthError('Forbidden', 403)
  }
  return auth
}
