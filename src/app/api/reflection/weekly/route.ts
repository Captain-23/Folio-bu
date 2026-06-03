// GET  /api/reflection/weekly — legacy alias for current weekly reflection
// POST /api/reflection/weekly — cron: enqueue weekly reflection generation for all users

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { getWeekStartMonday } from '@/lib/dates/week'
import { runWeeklyReflectionCronForAllUsers } from '@/lib/jobs/weekly-reflection'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const weekStart = getWeekStartMonday()

    const reflection = await prisma.weeklyReflection.findUnique({
      where: { userId_weekStart: { userId: auth.userId, weekStart } },
      select: { content: true },
    })

    return NextResponse.json({ reflection: reflection?.content ?? null })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  runWeeklyReflectionCronForAllUsers()
  return NextResponse.json({ message: 'Weekly reflection generation started' })
}
