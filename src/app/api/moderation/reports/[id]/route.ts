// PATCH /api/moderation/reports/:id — update report status (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { UpdateReportStatusSchema } from '@/lib/validations'

type RouteContext = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(req)

    const body = await req.json()
    const parsed = UpdateReportStatusSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const existing = await prisma.report.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      select: {
        id: true,
        status: true,
        reason: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
