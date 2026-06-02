// GET /api/entries/weekly-digest
// Returns most-reacted published entries for the current week.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DIGEST_LIMIT = 6

function getCurrentWeekRange(now = new Date()) {
  const day = now.getDay() // 0 = Sunday
  const daysSinceMonday = (day + 6) % 7

  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - daysSinceMonday)

  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return { start, end }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { start, end } = getCurrentWeekRange()

  const entries = await prisma.entry.findMany({
    where: {
      isPublished: true,
      createdAt: { gte: start, lt: end },
    },
    orderBy: [{ reactions: { _count: 'desc' } }, { createdAt: 'desc' }],
    take: DIGEST_LIMIT,
    select: {
      id: true,
      content: true,
      mood: true,
      createdAt: true,
      user: { select: { alias: true } },
      _count: { select: { reactions: true } },
    },
  })

  return NextResponse.json({ entries, weekStart: start.toISOString(), weekEnd: end.toISOString() })
}
