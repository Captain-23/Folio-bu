import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { prisma } from '@/lib/prisma'

function toDateKey(date: Date) {
  return date.toISOString().split('T')[0]
}

function getCurrentStreak(dateKeys: string[]) {
  if (dateKeys.length === 0) return 0

  const unique = new Set(dateKeys)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let cursor = new Date(today)
  if (!unique.has(toDateKey(today)) && unique.has(toDateKey(yesterday))) {
    cursor = yesterday
  }
  if (!unique.has(toDateKey(cursor))) return 0

  let streak = 0
  while (unique.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const entries = await prisma.entry.findMany({
      where: { userId: auth.userId },
      select: {
        createdAt: true,
        _count: { select: { reactions: true } },
      },
    })

    const entriesCount = entries.length
    const reactionsReceived = entries.reduce((sum, entry) => sum + entry._count.reactions, 0)
    const streakDays = getCurrentStreak(entries.map((entry) => toDateKey(entry.createdAt)))

    return NextResponse.json({ entriesCount, reactionsReceived, streakDays })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
