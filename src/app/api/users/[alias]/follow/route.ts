// POST /api/users/:alias/follow — toggle follow (auth required)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { assertNotSelfFollow, FollowError } from '@/lib/services/follows'

type RouteContext = { params: { alias: string } }

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(req)
    const alias = decodeURIComponent(params.alias)

    const target = await prisma.user.findFirst({
      where: {
        alias: { equals: alias, mode: 'insensitive' },
        isActive: true,
        agreedToRules: true,
      },
      select: { id: true, alias: true },
    })

    if (!target) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    assertNotSelfFollow(auth.userId, target.id)

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: auth.userId,
          followingId: target.id,
        },
      },
    })

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } })
      const followersCount = await prisma.follow.count({ where: { followingId: target.id } })
      return NextResponse.json({ isFollowing: false, followersCount })
    }

    await prisma.follow.create({
      data: {
        followerId: auth.userId,
        followingId: target.id,
      },
    })

    await prisma.notification.create({
      data: {
        userId: target.id,
        actorId: auth.userId,
        type: 'follow',
        message: 'You have a new follower',
      },
    })

    const followersCount = await prisma.follow.count({ where: { followingId: target.id } })
    return NextResponse.json({ isFollowing: true, followersCount })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof FollowError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
