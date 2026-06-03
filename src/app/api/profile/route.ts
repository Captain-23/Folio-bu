import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'
import { handleRouteError } from '@/lib/api/errors'
import { safeUser } from '@/lib/serializers/safe-user'
import { UpdateProfileSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { alias: true, avatarId: true, bio: true, role: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      alias: user.alias ?? '',
      avatarId: user.avatarId ?? 'robot',
      bio: user.bio ?? '',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const body = await req.json()
    const parsed = UpdateProfileSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        avatarId: parsed.data.avatarId,
        bio: parsed.data.bio?.trim() ?? '',
      },
      select: { alias: true, avatarId: true, bio: true, role: true },
    })

    return NextResponse.json({
      alias: updated.alias ?? '',
      avatarId: updated.avatarId ?? 'robot',
      bio: updated.bio ?? '',
      user: safeUser(updated),
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleRouteError(error)
  }
}
