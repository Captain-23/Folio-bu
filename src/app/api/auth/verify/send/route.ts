import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { issueVerificationCode, VerificationError } from '@/lib/auth/email-verification'
import { VerifySendSchema } from '@/lib/validations'
import { isAvatarId } from '@/lib/avatars'
import { getPrismaErrorMessage } from '@/lib/api/prisma-errors'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = VerifySendSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const data = parsed.data

    if (data.purpose === 'signup') {
      const { email, password } = data

      const existing = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      })
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }

      if (data.alias) {
        const aliasTaken = await prisma.user.findFirst({
          where: { alias: { equals: data.alias, mode: 'insensitive' } },
        })
        if (aliasTaken) {
          return NextResponse.json({ error: 'That alias is already taken' }, { status: 409 })
        }
      }

      if (data.avatarId && !isAvatarId(data.avatarId)) {
        return NextResponse.json({ error: 'Choose one of the 8 character avatars' }, { status: 400 })
      }

      const passwordHash = await bcrypt.hash(password, 12)
      const completeProfile = Boolean(data.alias && data.avatarId)

      const { expiresAt, devCode } = await issueVerificationCode({
        email,
        purpose: 'SIGNUP',
        payload: {
          passwordHash,
          ...(data.alias && data.avatarId
            ? { alias: data.alias, avatarId: data.avatarId }
            : {}),
        },
      })

      return NextResponse.json({
        message: 'Verification code sent',
        expiresAt: expiresAt.toISOString(),
        ...(devCode ? { devCode } : {}),
        onboardingComplete: completeProfile,
      })
    }

    const { email, password } = data

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: {
        id: true,
        password: true,
        isActive: true,
        agreedToRules: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    if (!user.agreedToRules) {
      return NextResponse.json({ error: 'Account is not activated' }, { status: 403 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const { expiresAt, devCode } = await issueVerificationCode({
      email,
      purpose: 'LOGIN',
      payload: { userId: user.id },
    })

    return NextResponse.json({
      message: 'Verification code sent',
      expiresAt: expiresAt.toISOString(),
      ...(devCode ? { devCode } : {}),
    })
  } catch (error) {
    if (error instanceof VerificationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[auth:verify:send]', error)

    const prismaMessage = getPrismaErrorMessage(error)
    const message =
      prismaMessage ??
      (process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : 'Could not send verification code')

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
