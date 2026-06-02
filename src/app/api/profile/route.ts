import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateProfileSchema } from '@/lib/validations'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { alias: true, avatarId: true, bio: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({
    alias: user.alias ?? '',
    avatarId: user.avatarId ?? 'robot',
    bio: user.bio ?? '',
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = UpdateProfileSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatarId: parsed.data.avatarId,
        bio: parsed.data.bio?.trim() ?? '',
      },
      select: { alias: true, avatarId: true, bio: true },
    })

    return NextResponse.json({
      alias: updated.alias ?? '',
      avatarId: updated.avatarId ?? 'robot',
      bio: updated.bio ?? '',
    })
  } catch (error) {
    console.error('[profile:update]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
