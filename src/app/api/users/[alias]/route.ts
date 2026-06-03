// GET /api/users/:alias — public profile (case-insensitive alias lookup)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { safeUser } from '@/lib/serializers/safe-user'

type RouteContext = { params: { alias: string } }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(req)
    const alias = decodeURIComponent(params.alias)

    const user = await prisma.user.findFirst({
      where: {
        alias: { equals: alias, mode: 'insensitive' },
        isActive: true,
        agreedToRules: true,
      },
      select: {
        id: true,
        alias: true,
        avatarId: true,
        bio: true,
        role: true,
        _count: { select: { followers: true, following: true } },
        entries: {
          where: { isPublished: true, isRemoved: false },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            mood: true,
            wordCount: true,
            readTimeSecs: true,
            createdAt: true,
            _count: { select: { reactions: true } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: auth.userId,
          followingId: user.id,
        },
      },
    })

    return NextResponse.json({
      profile: {
        ...safeUser(user),
        entriesCount: user.entries.length,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        isFollowing: !!existingFollow,
        isSelf: auth.userId === user.id,
        entries: user.entries.map((entry) => ({
          id: entry.id,
          content: entry.content,
          mood: entry.mood,
          wordCount: entry.wordCount,
          readTimeSecs: entry.readTimeSecs,
          createdAt: entry.createdAt,
          reactionCount: entry._count.reactions,
        })),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
