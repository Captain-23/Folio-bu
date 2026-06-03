import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

export const revalidate = 1800

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const moodCounts = await prisma.entry.groupBy({
      by: ['mood'],
      where: {
        isPublished: true,
        isRemoved: false,
        mood: { not: null },
        createdAt: { gte: since },
      },
      _count: { mood: true },
    })

    const total = moodCounts.reduce((sum, m) => sum + m._count.mood, 0)

    if (total === 0) return NextResponse.json({ moods: [], total: 0 })

    const moods = moodCounts
      .map((m) => ({
        mood: m.mood,
        count: m._count.mood,
        percentage: Math.round((m._count.mood / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ moods, total })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
