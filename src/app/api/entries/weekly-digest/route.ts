import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

const DIGEST_LIMIT = 6

function getCurrentWeekRange(now = new Date()) {
  const day = now.getDay()
  const daysSinceMonday = (day + 6) % 7

  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - daysSinceMonday)

  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return { start, end }
}

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)

    const { start, end } = getCurrentWeekRange()

    const entries = await prisma.entry.findMany({
      where: {
        isPublished: true,
        isRemoved: false,
        createdAt: { gte: start, lt: end },
      },
      orderBy: [{ reactions: { _count: 'desc' } }, { createdAt: 'desc' }],
      take: DIGEST_LIMIT,
      select: {
        id: true,
        content: true,
        mood: true,
        createdAt: true,
        user: { select: { alias: true, avatarId: true } },
        _count: { select: { reactions: true } },
      },
    })

    return NextResponse.json({ entries, weekStart: start.toISOString(), weekEnd: end.toISOString() })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
