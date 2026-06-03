// GET /api/notifications — fetch notifications for logged-in user, newest first

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

const PAGE_SIZE = 30

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const skip = (page - 1) * PAGE_SIZE

    const notifications = await prisma.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip,
      include: {
        actor: { select: { alias: true, avatarId: true } },
      },
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: auth.userId, isRead: false },
    })

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        isRead: n.isRead,
        entryId: n.entryId,
        createdAt: n.createdAt,
        actor: n.actor,
      })),
      unreadCount,
      page,
      hasMore: notifications.length === PAGE_SIZE,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
