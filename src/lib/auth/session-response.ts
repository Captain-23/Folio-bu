import { NextResponse } from 'next/server'
import { signAccessToken } from '@/lib/auth/jwt'
import { authCookieOptions } from '@/lib/auth/cookies'
import { safeUser } from '@/lib/serializers/safe-user'
import type { Role } from '@prisma/client'

type SessionUser = {
  id: string
  alias: string | null
  avatarId: string | null
  bio: string | null
  role: Role
  onboardingComplete: boolean
}

export async function jsonWithAuthSession(
  user: SessionUser,
  status = 200,
  extra: Record<string, unknown> = {}
) {
  const token = await signAccessToken({ sub: user.id, role: user.role })
  const response = NextResponse.json(
    {
      token,
      user: safeUser(user),
      onboardingComplete: user.onboardingComplete,
      ...extra,
    },
    { status }
  )
  response.cookies.set(authCookieOptions(token))
  return response
}
