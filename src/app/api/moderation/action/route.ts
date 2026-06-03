// POST /api/moderation/action — log moderation action and apply side effects (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { applyModerationAction } from '@/lib/services/moderation'
import { ModerationActionSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)

    const body = await req.json()
    const parsed = ModerationActionSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { targetType, targetId, action, reason } = parsed.data

    if (targetType === 'entry') {
      const entry = await prisma.entry.findUnique({ where: { id: targetId }, select: { id: true } })
      if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (targetType === 'user') {
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, role: true },
      })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      if (user.role === 'ADMIN' && (action === 'suspended' || action === 'removed')) {
        return NextResponse.json(
          { error: 'Cannot suspend or remove moderator accounts — set isActive false instead' },
          { status: 400 }
        )
      }
    }

    await applyModerationAction({
      moderatorId: admin.userId,
      targetType,
      targetId,
      action,
      reason,
    })

    return NextResponse.json({ message: 'Moderation action recorded' }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
