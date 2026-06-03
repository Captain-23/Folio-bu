// PATCH /api/notifications/read — mark all notifications as read

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const result = await prisma.notification.updateMany({
      where: { userId: auth.userId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ updated: result.count })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
