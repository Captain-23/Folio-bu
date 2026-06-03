import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const skip = (page - 1) * PAGE_SIZE

    const entries = await prisma.entry.findMany({
      where: { userId: auth.userId },
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
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
