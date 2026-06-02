import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { handle: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const alias = decodeURIComponent(params.handle)
  const target = await prisma.user.findFirst({
    where: { alias: { equals: alias, mode: 'insensitive' }, onboardingComplete: true },
    select: { id: true },
  })
  if (!target) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (target.id === session.user.id) {
    return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 })
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
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
      followerId: session.user.id,
      followingId: target.id,
    },
  })
  const followersCount = await prisma.follow.count({ where: { followingId: target.id } })
  return NextResponse.json({ isFollowing: true, followersCount })
}
