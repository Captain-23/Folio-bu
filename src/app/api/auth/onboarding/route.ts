// POST /api/auth/onboarding — set pseudonym and avatar after signup.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OnboardingSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = OnboardingSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { pseudonym, avatarId } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      select: { alias: true, avatarId: true, onboardingComplete: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[onboarding]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
