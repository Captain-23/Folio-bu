// GET /api/prompt/today
// Returns today's daily journaling prompt.
// The prompt is generated once per day via a Vercel cron job (see vercel.json).
// If no prompt exists for today, falls back to the most recent one.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateDailyPrompt } from '@/lib/gemini'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Try to find today's prompt
  let prompt = await prisma.dailyPrompt.findUnique({ where: { date: today } })

  if (!prompt) {
    // Fallback: generate one on-demand if cron hasn't run yet
    const generated = await generateDailyPrompt()
    if (generated) {
      try {
        prompt = await prisma.dailyPrompt.create({ data: { prompt: generated, date: today } })
      } catch {
        // Another request may have created it concurrently — fetch it
        prompt = await prisma.dailyPrompt.findFirst({ orderBy: { createdAt: 'desc' } })
      }
    }
  }

  return NextResponse.json({ prompt: prompt?.prompt ?? null })
}

// ─── CRON HANDLER ─────────────────────────────────────────────────────────────
// Called by Vercel cron at 6:00 AM daily (see vercel.json).
// This is a separate POST handler on this same route for the cron trigger.
export async function POST(req: NextRequest) {
  // Verify the request is from Vercel cron (not a public endpoint)
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
