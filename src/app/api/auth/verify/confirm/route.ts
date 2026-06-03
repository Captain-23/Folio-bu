import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  consumeVerificationCode,
  VerificationError,
  type LoginVerificationPayload,
  type SignupVerificationPayload,
} from '@/lib/auth/email-verification'
import { jsonWithAuthSession } from '@/lib/auth/session-response'
import { VerifyConfirmSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = VerifyConfirmSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { email, code, purpose } = parsed.data
    const prismaPurpose = purpose === 'signup' ? 'SIGNUP' : 'LOGIN'

    const payload = await consumeVerificationCode({
      email,
      purpose: prismaPurpose,
      code,
    })

    if (purpose === 'signup') {
      const signup = payload as SignupVerificationPayload
      const completeProfile = Boolean(signup.alias && signup.avatarId)
      const now = new Date()

      const user = await prisma.user.create({
        data: {
          email,
          password: signup.passwordHash,
          alias: signup.alias ?? null,
          avatarId: signup.avatarId ?? null,
          agreedToRules: true,
          agreedAt: now,
          onboardingComplete: completeProfile,
          isActive: true,
        },
        select: {
          id: true,
          alias: true,
          avatarId: true,
          bio: true,
          role: true,
          onboardingComplete: true,
        },
      })

      return jsonWithAuthSession(user, 201, { message: 'Account created' })
    }

    const login = payload as LoginVerificationPayload

    const user = await prisma.user.findUnique({
      where: { id: login.userId },
      select: {
        id: true,
        email: true,
        alias: true,
        avatarId: true,
        bio: true,
        role: true,
        isActive: true,
        agreedToRules: true,
        onboardingComplete: true,
      },
    })

    if (!user || !user.isActive || !user.agreedToRules) {
      return NextResponse.json({ error: 'Account unavailable' }, { status: 403 })
    }

    if (user.email !== email) {
      await prisma.user.update({ where: { id: user.id }, data: { email } })
    }

    return jsonWithAuthSession(user)
  } catch (error) {
    if (error instanceof VerificationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[auth:verify:confirm]', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
