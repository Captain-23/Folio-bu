// GET /api/notifications/unread — unread count for header badge

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthContext } from '@/lib/auth/require-auth'

export async function GET(req: NextRequest) {
  const auth = await getAuthContext(req)
  if (!auth) {
    return NextResponse.json({ count: 0 })
  }

  const count = await prisma.notification.count({
    where: { userId: auth.userId, isRead: false },
  })

  return NextResponse.json({ count })
}
