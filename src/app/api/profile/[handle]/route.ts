import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getFeedEntriesByAuthorSlug } from '@/lib/feed-entries'

function toDateKey(date: Date) {
  return date.toISOString().split('T')[0]
}

function getCurrentStreak(dateKeys: string[]) {
  if (dateKeys.length === 0) return 0

  const unique = new Set(dateKeys)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let cursor = new Date(today)
  if (!unique.has(toDateKey(today)) && unique.has(toDateKey(yesterday))) {
    cursor = yesterday
  }
  if (!unique.has(toDateKey(cursor))) return 0

  let streak = 0
  while (unique.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export async function GET(req: NextRequest, { params }: { params: { handle: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const alias = decodeURIComponent(params.handle)
  const user = await prisma.user.findFirst({
    where: {
      alias: { equals: alias, mode: 'insensitive' },
      onboardingComplete: true,
    },
    select: {
      id: true,
      alias: true,
      avatarId: true,
      bio: true,
      entries: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: { select: { reactions: true } },
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    const mockEntries = getFeedEntriesByAuthorSlug(alias)
    if (mockEntries.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const mockAlias = mockEntries[0].authorHandle.replace(/^@/, '')
    const mockReactions = mockEntries.reduce(
      (sum, entry) => sum + entry.reactions.reduce((entrySum, reaction) => entrySum + reaction.count, 0),
      0
    )

    return NextResponse.json({
      profile: {
        id: `mock-${alias.toLowerCase()}`,
        alias: mockAlias,
        avatarId: 'robot',
        bio: 'Community writer profile from the public journal feed.',
        entriesCount: mockEntries.length,
        reactionsReceived: mockReactions,
        streakDays: 0,
        followersCount: 0,
        followingCount: 0,
        isFollowing: false,
        isSelf: false,
        entries: mockEntries.map((entry) => ({
          id: entry.id,
          content: entry.paragraphs.join('\n\n'),
          createdAt: new Date().toISOString(),
          reactionsCount: entry.reactions.reduce((sum, reaction) => sum + reaction.count, 0),
        })),
      },
    })
  }

  const reactionsReceived = user.entries.reduce((sum, entry) => sum + entry._count.reactions, 0)
  const streakDays = getCurrentStreak(user.entries.map((entry) => toDateKey(entry.createdAt)))

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: user.id,
      },
    },
  })

  return NextResponse.json({
    profile: {
      id: user.id,
      alias: user.alias,
      avatarId: user.avatarId ?? 'robot',
      bio: user.bio ?? '',
      entriesCount: user.entries.length,
      reactionsReceived,
      streakDays,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing: !!existingFollow,
      isSelf: session.user.id === user.id,
      entries: user.entries.map((entry) => ({
        id: entry.id,
        content: entry.content,
        createdAt: entry.createdAt.toISOString(),
        reactionsCount: entry._count.reactions,
      })),
    },
  })
}
