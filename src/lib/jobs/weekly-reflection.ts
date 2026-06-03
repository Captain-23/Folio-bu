// Async weekly reflection generation — never inline in GET handlers.

import { prisma } from '@/lib/prisma'
import { getWeekStartMonday } from '@/lib/dates/week'
import { generateWeeklyReflection } from '@/lib/gemini'

export function enqueueWeeklyReflectionForUser(userId: string) {
  void generateWeeklyReflectionForUser(userId)
}

async function generateWeeklyReflectionForUser(userId: string) {
  try {
    const weekStart = getWeekStartMonday()
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const entries = await prisma.entry.findMany({
      where: {
        userId,
        isPublished: true,
        isRemoved: false,
        createdAt: { gte: weekStart, lt: weekEnd },
      },
      orderBy: { createdAt: 'asc' },
      select: { content: true },
    })

    if (entries.length < 2) return

    const reflection = await generateWeeklyReflection(entries.map((e) => e.content))
    if (!reflection) return

    await prisma.weeklyReflection.upsert({
      where: { userId_weekStart: { userId, weekStart } },
      update: { content: reflection },
      create: { userId, weekStart, content: reflection },
    })

    await prisma.notification.create({
      data: {
        userId,
        type: 'weekly_reflection_ready',
        message: 'Your weekly reflection is ready',
      },
    })
  } catch (error) {
    console.error('[weekly-reflection]', userId, error)
  }
}

export async function runWeeklyReflectionCronForAllUsers() {
  const users = await prisma.user.findMany({
    where: { isActive: true, agreedToRules: true },
    select: { id: true },
  })

  for (const user of users) {
    enqueueWeeklyReflectionForUser(user.id)
  }
}
