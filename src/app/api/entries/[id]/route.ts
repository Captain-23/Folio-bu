// GET    /api/entries/:id — single entry (published public, or owner/admin)
// PATCH  /api/entries/:id — update entry (owner only)
// DELETE /api/entries/:id — delete entry (owner or admin)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { computeEntryMetrics } from '@/lib/services/entry-metrics'
import { enqueueEntryAiEnrichment } from '@/lib/jobs/ai-enrichment'
import { UpdateEntrySchema } from '@/lib/validations'

type RouteContext = { params: { id: string } }

const publicEntryInclude = {
  user: { select: { alias: true, avatarId: true } },
  _count: { select: { reactions: true } },
} as const

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(req)
    const { id } = params

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        ...publicEntryInclude,
        reactions: { where: { userId: auth.userId }, select: { id: true } },
      },
    })

    if (!entry || entry.isRemoved) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const isOwner = entry.userId === auth.userId
    const isAdmin = auth.role === 'ADMIN'

    if (!entry.isPublished && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: entry.id,
      content: entry.content,
      imageUrl: entry.imageUrl,
      mood: entry.mood,
      aiReflection: entry.aiReflection,
      wordCount: entry.wordCount,
      readTimeSecs: entry.readTimeSecs,
      isPublished: entry.isPublished,
      isFlagged: entry.isFlagged,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      user: entry.user,
      reactionCount: entry._count.reactions,
      hasReacted: entry.reactions.length > 0,
      isOwner,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(req)
    const { id } = params

    const existing = await prisma.entry.findUnique({
      where: { id },
      select: { id: true, userId: true, isRemoved: true },
    })

    if (!existing || existing.isRemoved) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (existing.userId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = UpdateEntrySchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { content } = parsed.data
    const { wordCount, readTimeSecs } = computeEntryMetrics(content)

    const entry = await prisma.entry.update({
      where: { id },
      data: {
        content,
        wordCount,
        readTimeSecs,
        isPublished: false,
        isFlagged: false,
        flagReason: null,
        mood: null,
        aiReflection: null,
      },
      select: {
        id: true,
        content: true,
        wordCount: true,
        readTimeSecs: true,
        isPublished: true,
        updatedAt: true,
      },
    })

    enqueueEntryAiEnrichment(id, content)

    return NextResponse.json({ message: 'Entry updated', entry })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(req)
    const { id } = params

    const existing = await prisma.entry.findUnique({
      where: { id },
      select: { id: true, userId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const isOwner = existing.userId === auth.userId
    const isAdmin = auth.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.entry.delete({ where: { id } })

    return NextResponse.json({ message: 'Entry deleted' })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
