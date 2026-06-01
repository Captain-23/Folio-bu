// GET  /api/entries — returns paginated public feed (published entries only, alias-only)
// POST /api/entries — creates a new entry, triggers async AI pipeline

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateEntrySchema } from '@/lib/validations'
import { moderateEntry, tagMood, generateReflection } from '@/lib/gemini'

const PAGE_SIZE = 20

// ─── GET — Public Feed ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const skip = (page - 1) * PAGE_SIZE

  // IMPORTANT: the select below is the privacy boundary.
  // userId and user.email are intentionally excluded.
  const entries = await prisma.entry.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take: PAGE_SIZE,
    select: {
      id: true,
      content: true,
      mood: true,
      aiReflection: true,
      createdAt: true,
      user: { select: { alias: true } }, // alias only — never email or userId
      _count: { select: { reactions: true } },
      reactions: { where: { userId: session.user.id }, select: { id: true } }, // current user's reaction
    },
  })

  return NextResponse.json({ entries, page, hasMore: entries.length === PAGE_SIZE })
}

// ─── POST — Create Entry ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { content } = parsed.data

  // Save the entry immediately — user gets instant confirmation
  // isPublished stays false until AI pipeline completes
  const entry = await prisma.entry.create({
    data: { userId: session.user.id, content },
  })

  // Trigger AI pipeline asynchronously — do not await
  // This keeps the API response fast (< 500ms) regardless of AI latency
  runAIPipeline(entry.id, content)

  return NextResponse.json({ message: 'Entry posted', entryId: entry.id }, { status: 201 })
}

// ─── AI Pipeline ─────────────────────────────────────────────────────────────
// Runs after the entry is saved. Updates the entry progressively.
// On any failure, the entry stays unpublished and can be retried later.
async function runAIPipeline(entryId: string, content: string) {
  try {
    // Step 1: Moderation — must pass before anything is published
    const moderation = await moderateEntry(content)

    if (!moderation.safe) {
      await prisma.entry.update({
        where: { id: entryId },
        data: { isFlagged: true, flagReason: moderation.reason ?? 'flagged' },
      })
      return // do not publish flagged entries
    }

    // Step 2: Mood tagging + empathy reflection (run in parallel for speed)
    const [mood, aiReflection] = await Promise.all([tagMood(content), generateReflection(content)])

    // Step 3: Publish the entry with AI enrichment
    await prisma.entry.update({
      where: { id: entryId },
      data: {
        mood: mood ?? undefined,
        aiReflection: aiReflection ?? undefined,
        isPublished: true,
      },
    })
  } catch (error) {
    console.error('[ai-pipeline]', entryId, error)
    // Entry stays unpublished — no user-facing error since pipeline is async
  }
}
