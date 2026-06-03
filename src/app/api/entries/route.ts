// GET  /api/entries — paginated public feed (published, not removed)
// POST /api/entries — create entry (auth required)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { computeEntryMetrics } from '@/lib/services/entry-metrics'
import { enqueueEntryAiEnrichment } from '@/lib/jobs/ai-enrichment'
import { CreateEntrySchema } from '@/lib/validations'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const skip = (page - 1) * PAGE_SIZE

    const entries = await prisma.entry.findMany({
      where: { isPublished: true, isRemoved: false },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { alias: true, avatarId: true } },
        _count: { select: { reactions: true } },
        reactions: { where: { userId: auth.userId }, select: { id: true } },
      },
      take: PAGE_SIZE,
      skip,
    })

    return NextResponse.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        content: entry.content,
        imageUrl: entry.imageUrl,
        mood: entry.mood,
        aiReflection: entry.aiReflection,
        wordCount: entry.wordCount,
        readTimeSecs: entry.readTimeSecs,
        createdAt: entry.createdAt,
        user: entry.user,
        reactionCount: entry._count.reactions,
        hasReacted: entry.reactions.length > 0,
      })),
      page,
      hasMore: entries.length === PAGE_SIZE,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const body = await req.json()
    const parsed = CreateEntrySchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { content, imageUrl } = parsed.data
    const { wordCount, readTimeSecs } = computeEntryMetrics(content)

    const entry = await prisma.entry.create({
      data: {
        userId: auth.userId,
        content,
        imageUrl: imageUrl ?? null,
        wordCount,
        readTimeSecs,
        isPublished: false,
        isRemoved: false,
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        wordCount: true,
        readTimeSecs: true,
        isPublished: true,
        createdAt: true,
      },
    })

    enqueueEntryAiEnrichment(entry.id, content)

    return NextResponse.json({ message: 'Entry created', entry }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
