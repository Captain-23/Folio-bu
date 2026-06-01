// POST /api/entries/[id]/react
// Toggles the current user's "Felt this" reaction on an entry.
// Reacting twice removes the reaction (toggle behaviour).
// The userId is stored for uniqueness but never returned in responses.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const entryId = params.id
  const userId = session.user.id

  // Check if reaction already exists
  const existing = await prisma.reaction.findUnique({
    where: { entryId_userId: { entryId, userId } },
  })

  if (existing) {
    // Toggle off — remove the reaction
    await prisma.reaction.delete({ where: { id: existing.id } })
    return NextResponse.json({ reacted: false })
  } else {
    // Toggle on — add the reaction
    await prisma.reaction.create({ data: { entryId, userId } })
    return NextResponse.json({ reacted: true })
  }
}
