// GET /api/reflections/current — this week's reflection for the logged-in user (read-only)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { getWeekStartMonday } from '@/lib/dates/week'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const weekStart = getWeekStartMonday()

    const reflection = await prisma.weeklyReflection.findUnique({
      where: { userId_weekStart: { userId: auth.userId, weekStart } },
      select: {
        content: true,
        weekStart: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      reflection: reflection?.content ?? null,
      weekStart: weekStart.toISOString(),
      ready: !!reflection,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
