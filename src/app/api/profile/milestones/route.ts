// GET /api/profile/milestones
// Returns milestone progress computed from the current user's journal history.

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
  const todayKey = toDateKey(today)
  const yesterdayKey = toDateKey(yesterday)

  if (!unique.has(todayKey) && unique.has(yesterdayKey)) {
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

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const entries = await prisma.entry.findMany({
    where: { userId: session.user.id },
    select: {
      createdAt: true,
      _count: { select: { reactions: true } },
    },
  })

  const entriesCount = entries.length
  const reactionsReceived = entries.reduce((sum, entry) => sum + entry._count.reactions, 0)
  const streakDays = getCurrentStreak(entries.map((entry) => toDateKey(entry.createdAt)))

  return NextResponse.json({
    entriesCount,
    reactionsReceived,
    streakDays,
  })
}
