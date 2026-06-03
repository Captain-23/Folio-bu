// POST /api/entries/:id/react — toggle reaction (auth required)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

type RouteContext = { params: { id: string } }

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(_req)
    const entryId = params.id

    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { id: true, isPublished: true, isRemoved: true, userId: true },
    })

    if (!entry || !entry.isPublished || entry.isRemoved) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const existing = await prisma.reaction.findUnique({
      where: { entryId_userId: { entryId, userId: auth.userId } },
    })

    let reacted: boolean

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } })
      reacted = false
    } else {
      await prisma.reaction.create({
        data: { entryId, userId: auth.userId },
      })
      reacted = true

      if (entry.userId !== auth.userId) {
        await prisma.notification.create({
          data: {
            userId: entry.userId,
            actorId: auth.userId,
            type: 'reaction',
            message: 'Someone resonated with your journal entry',
            entryId,
          },
        })
      }
    }

    const reactionCount = await prisma.reaction.count({ where: { entryId } })

    return NextResponse.json({ reacted, reactionCount })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
