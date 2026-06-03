import type { ModAction, TargetType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type ModerationActionInput = {
  moderatorId: string
  targetType: TargetType
  targetId: string
  action: ModAction
  reason?: string
}

export async function applyModerationAction(input: ModerationActionInput) {
  const { moderatorId, targetType, targetId, action, reason } = input

  await prisma.moderationLog.create({
    data: {
      moderatorId,
      targetType,
      targetId,
      action,
      reason,
    },
  })

  if (targetType === 'entry') {
    switch (action) {
      case 'removed':
        await prisma.entry.update({
          where: { id: targetId },
          data: { isRemoved: true, isPublished: false },
        })
        break
      case 'flagged':
        await prisma.entry.update({
          where: { id: targetId },
          data: { isFlagged: true, flagReason: reason ?? 'flagged by moderator' },
        })
        break
      case 'unflagged':
        await prisma.entry.update({
          where: { id: targetId },
          data: { isFlagged: false, flagReason: null },
        })
        break
      default:
        break
    }
  }

  if (targetType === 'user') {
    switch (action) {
      case 'suspended':
        await prisma.user.update({
          where: { id: targetId },
          data: { isActive: false },
        })
        break
      case 'reinstated':
        await prisma.user.update({
          where: { id: targetId },
          data: { isActive: true },
        })
        break
      case 'warned':
        await prisma.notification.create({
          data: {
            userId: targetId,
            type: 'moderation_warning',
            message: reason ?? 'A moderator reviewed activity on your account',
          },
        })
        break
      default:
        break
    }
  }
}
