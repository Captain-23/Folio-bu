import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { requireAuth, AuthError } from '@/lib/auth/require-auth'

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Use JPEG, PNG, WebP, or GIF' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 2 MB or smaller' }, { status: 400 })
    }

    const ext = EXT_BY_TYPE[file.type] ?? 'jpg'
    const filename = `${auth.userId}-${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'entries')

    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/entries/${filename}` })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[uploads]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
