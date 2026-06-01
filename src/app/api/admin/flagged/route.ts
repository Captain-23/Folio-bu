// GET /api/admin/flagged
// Returns all flagged entries (admin only).

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const flagged = await prisma.entry.findMany({
    where: { isFlagged: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      flagReason: true,
      createdAt: true,
      user: { select: { alias: true } },
    },
  })

  return NextResponse.json({ flagged })
}
