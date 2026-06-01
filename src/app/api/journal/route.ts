// GET /api/journal
// Returns the current user's personal journal entries (all entries, regardless of publication status).

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const skip = (page - 1) * PAGE_SIZE

  const entries = await prisma.entry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    skip,
    take: PAGE_SIZE,
    select: {
      id: true,
      content: true,
      mood: true,
      aiReflection: true,
      isPublished: true,
      isFlagged: true,
      flagReason: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ entries, page, hasMore: entries.length === PAGE_SIZE })
}
