import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { generateDailyPrompt } from '@/lib/gemini'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let prompt = await prisma.dailyPrompt.findUnique({ where: { date: today } })

    if (!prompt) {
      const generated = await generateDailyPrompt()
      if (generated) {
        try {
          prompt = await prisma.dailyPrompt.create({ data: { prompt: generated, date: today } })
        } catch {
          prompt = await prisma.dailyPrompt.findFirst({ orderBy: { createdAt: 'desc' } })
        }
      }
    }

    return NextResponse.json({ prompt: prompt?.prompt ?? null })
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const generated = await generateDailyPrompt()
  if (!generated) return NextResponse.json({ error: 'Generation failed' }, { status: 500 })

  await prisma.dailyPrompt.upsert({
    where: { date: today },
    update: { prompt: generated },
    create: { prompt: generated, date: today },
  })

  return NextResponse.json({ message: 'Prompt generated' })
}
