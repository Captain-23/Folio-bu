import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const flagged = await prisma.entry.findMany({
      where: { isFlagged: true, isRemoved: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        flagReason: true,
        createdAt: true,
        user: { select: { alias: true, avatarId: true } },
      },
    })

    return NextResponse.json({ flagged })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
