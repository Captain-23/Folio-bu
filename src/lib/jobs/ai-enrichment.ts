// Async AI pipeline for entries — never call from request handlers inline.

import { prisma } from '@/lib/prisma'
import { moderateEntry, tagMood, generateReflection } from '@/lib/gemini'

export function enqueueEntryAiEnrichment(entryId: string, content: string) {
  void runEntryAiEnrichment(entryId, content)
}

async function runEntryAiEnrichment(entryId: string, content: string) {
  try {
    const moderation = await moderateEntry(content)

    if (!moderation.safe) {
      await prisma.entry.update({
        where: { id: entryId },
        data: { isFlagged: true, flagReason: moderation.reason ?? 'flagged' },
      })
      return
    }

    const [mood, aiReflection] = await Promise.all([tagMood(content), generateReflection(content)])

    await prisma.entry.update({
      where: { id: entryId },
      data: {
        mood: mood ?? undefined,
        aiReflection: aiReflection ?? undefined,
        isPublished: true,
      },
    })
  } catch (error) {
    console.error('[ai-enrichment:entry]', entryId, error)
  }
}
