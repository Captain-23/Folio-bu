// GET /api/notifications/unread — unread reactions + comments count for header badge.

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 })
  }

  // TODO: aggregate unread reactions and comments from the database
  return NextResponse.json({ count: 0 })
}
