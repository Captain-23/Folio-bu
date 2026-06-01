// GET /api/entries/[id] — get a single entry by ID (published only, alias-only)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const entry = await prisma.entry.findUnique({
    where: { id: params.id, isPublished: true },
    select: {
      id: true,
      content: true,
      mood: true,
      aiReflection: true,
      createdAt: true,
      user: { select: { alias: true } },
      _count: { select: { reactions: true } },
      reactions: { where: { userId: session.user.id }, select: { id: true } },
    },
  })

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  return NextResponse.json(entry)
}
