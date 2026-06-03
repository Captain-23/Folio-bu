import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'

type RouteContext = { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(_req)

    const entry = await prisma.entry.findUnique({
      where: { id: params.id },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    await prisma.entry.update({
      where: { id: params.id },
      data: { isFlagged: false, flagReason: null, isPublished: true },
    })

    return NextResponse.json({ message: 'Entry unflagged and published' })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
