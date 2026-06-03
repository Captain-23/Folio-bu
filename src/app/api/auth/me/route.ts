// GET /api/auth/me — current user from JWT

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { safeUser } from '@/lib/serializers/safe-user'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        alias: true,
        avatarId: true,
        bio: true,
        role: true,
        onboardingComplete: true,
        agreedToRules: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive || !user.agreedToRules) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    return NextResponse.json({
      user: safeUser(user),
      onboardingComplete: user.onboardingComplete,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
