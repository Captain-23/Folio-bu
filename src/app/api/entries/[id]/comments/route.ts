// GET  /api/entries/:id/comments — list comments (auth required)
// POST /api/entries/:id/comments — create comment (auth required)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { CreateCommentSchema } from '@/lib/validations'

type RouteContext = { params: { id: string } }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAuth(req)
    const entryId = params.id

    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { id: true, isPublished: true, isRemoved: true },
    })

    if (!entry || !entry.isPublished || entry.isRemoved) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const comments = await prisma.comment.findMany({
      where: { entryId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { alias: true, avatarId: true } },
      },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(req)
    const entryId = params.id

    const body = await req.json()
    const parsed = CreateCommentSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { id: true, isPublished: true, isRemoved: true, userId: true },
    })

    if (!entry || !entry.isPublished || entry.isRemoved) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        entryId,
        userId: auth.userId,
        content: parsed.data.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { alias: true, avatarId: true } },
      },
    })

    // Notify the entry owner (skip if commenter is the owner)
    if (entry.userId !== auth.userId) {
      await prisma.notification.create({
        data: {
          userId: entry.userId,
          actorId: auth.userId,
          type: 'reaction', // reusing closest notification type
          message: 'Someone commented on your journal entry',
          entryId,
        },
      })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
