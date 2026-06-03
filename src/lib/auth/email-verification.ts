import { randomInt } from 'crypto'
import bcrypt from 'bcryptjs'
import type { VerificationPurpose } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendVerificationCodeEmail } from '@/lib/email/mailer'

const CODE_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

export type SignupVerificationPayload = {
  passwordHash: string
  alias?: string
  avatarId?: string
}

export type LoginVerificationPayload = {
  userId: string
}

function generateCode(): string {
  return String(randomInt(100000, 1000000))
}

export async function issueVerificationCode(params: {
  email: string
  purpose: VerificationPurpose
  payload: SignupVerificationPayload | LoginVerificationPayload
}): Promise<{ expiresAt: Date; devCode?: string }> {
  const { email, purpose, payload } = params

  const recent = await prisma.emailVerificationCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: 'desc' },
  })

  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new VerificationError('Please wait a minute before requesting another code', 429)
  }

  await prisma.emailVerificationCode.deleteMany({ where: { email, purpose } })

  const code = generateCode()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + CODE_TTL_MS)

  await prisma.emailVerificationCode.create({
    data: {
      email,
      purpose,
      codeHash,
      payload,
      expiresAt,
    },
  })

  const purposeLabel = purpose === 'SIGNUP' ? 'signup' : 'login'

  let delivered = false
  try {
    const result = await sendVerificationCodeEmail(email, code, purposeLabel)
    delivered = result.delivered
  } catch (error) {
    console.error('[auth:verify] email delivery failed:', error)
    if (process.env.NODE_ENV !== 'development') {
      throw new VerificationError(
        'Could not send verification email. Check SMTP settings in .env',
        502
      )
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[auth:verify] ${purpose} code for ${email}: ${code}`)
  }

  const devCode =
    process.env.NODE_ENV === 'development' && !delivered ? code : undefined

  return { expiresAt, devCode }
}

export async function consumeVerificationCode(params: {
  email: string
  purpose: VerificationPurpose
  code: string
}): Promise<SignupVerificationPayload | LoginVerificationPayload> {
  const { email, purpose, code } = params

  const record = await prisma.emailVerificationCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: 'desc' },
  })

  if (!record) {
    throw new VerificationError('Verification code expired or invalid', 400)
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationCode.delete({ where: { id: record.id } })
    throw new VerificationError('Verification code expired', 400)
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.emailVerificationCode.delete({ where: { id: record.id } })
    throw new VerificationError('Too many attempts. Request a new code.', 400)
  }

  const valid = await bcrypt.compare(code, record.codeHash)

  if (!valid) {
    await prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    })
    throw new VerificationError('Invalid verification code', 400)
  }

  await prisma.emailVerificationCode.delete({ where: { id: record.id } })

  return record.payload as SignupVerificationPayload | LoginVerificationPayload
}

export class VerificationError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
