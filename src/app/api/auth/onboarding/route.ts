// POST /api/auth/onboarding — set pseudonym and avatar after signup (JWT).

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { safeUser } from '@/lib/serializers/safe-user'
import { OnboardingSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const body = await req.json()
    const parsed = OnboardingSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { pseudonym, avatarId } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.onboardingComplete) {
      return NextResponse.json({ error: 'Profile already set up' }, { status: 400 })
    }

    const aliasTaken = await prisma.user.findFirst({
      where: {
        alias: { equals: pseudonym, mode: 'insensitive' },
        NOT: { id: user.id },
      },
    })

    if (aliasTaken) {
      return NextResponse.json({ error: 'That pseudonym is already taken' }, { status: 409 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        alias: pseudonym,
        avatarId,
        onboardingComplete: true,
      },
      select: { alias: true, avatarId: true, bio: true, role: true, onboardingComplete: true },
    })

    return NextResponse.json({
      user: safeUser(updated),
      onboardingComplete: updated.onboardingComplete,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[onboarding]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
