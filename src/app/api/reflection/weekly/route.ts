// GET /api/reflection/weekly
// Returns the current user's weekly reflection (if it exists).
// Only returns data for the current week.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateWeeklyReflection } from '@/lib/gemini'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Calculate start of current week (Sunday)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)

  const reflection = await prisma.weeklyReflection.findUnique({
    where: { userId_weekStart: { userId: session.user.id, weekStart } },
  })

  return NextResponse.json({ reflection: reflection?.content ?? null })
}

// ─── CRON HANDLER ─────────────────────────────────────────────────────────────
// Called by Vercel cron every Sunday at midnight (see vercel.json).
export async function POST(req: NextRequest) {
  // Verify the request is from Vercel cron (not a public endpoint)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Get all users
  const users = await prisma.user.findMany()

  for (const user of users) {
    // Calculate last 7 days
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const entries = await prisma.entry.findMany({
      where: {
        userId: user.id,
        isPublished: true,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
      select: { content: true },
    })

    const content = entries.map((e) => e.content)
    const reflection = await generateWeeklyReflection(content)

    if (reflection) {
      const weekStart = new Date(today)
      const dayOfWeek = today.getDay()
      weekStart.setDate(today.getDate() - dayOfWeek)
      weekStart.setHours(0, 0, 0, 0)

      await prisma.weeklyReflection.upsert({
        where: { userId_weekStart: { userId: user.id, weekStart } },
        update: { content: reflection },
        create: { userId: user.id, weekStart, content: reflection },
      })
    }
  }

  return NextResponse.json({ message: 'Weekly reflections generated' })
}
