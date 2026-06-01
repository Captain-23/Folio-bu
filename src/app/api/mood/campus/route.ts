// GET /api/mood/campus
// Returns the aggregated mood distribution across all entries in the last 24 hours.
// Result is cached for 30 minutes to avoid hammering the DB on every feed load.
// No individual entry or user data is returned — only percentages.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const revalidate = 1800 // Next.js cache: 30 minutes

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000) // last 24 hours

  // Group entries by mood, count each
  const moodCounts = await prisma.entry.groupBy({
    by: ['mood'],
    where: { isPublished: true, mood: { not: null }, createdAt: { gte: since } },
    _count: { mood: true },
  })

  const total = moodCounts.reduce((sum, m) => sum + m._count.mood, 0)

  if (total === 0) return NextResponse.json({ moods: [], total: 0 })

  // Convert to percentages — never return individual entries
  const moods = moodCounts
    .map((m) => ({
      mood: m.mood,
      count: m._count.mood,
      percentage: Math.round((m._count.mood / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({ moods, total })
}
