// GET /api/moderation/reports — pending reports queue (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const reports = await prisma.report.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        entry: {
          select: {
            id: true,
            content: true,
            isPublished: true,
            isRemoved: true,
            isFlagged: true,
            createdAt: true,
            user: { select: { alias: true, avatarId: true } },
          },
        },
        reporter: { select: { alias: true, avatarId: true } },
      },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
