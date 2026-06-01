// DELETE /api/admin/flagged/[id]
// Removes the flag from an entry (admin only).

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const entry = await prisma.entry.findUnique({
    where: { id: params.id },
  })

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  // Unflag and publish the entry
  await prisma.entry.update({
    where: { id: params.id },
    data: { isFlagged: false, flagReason: null, isPublished: true },
  })

  return NextResponse.json({ message: 'Entry unflagged and published' })
}
