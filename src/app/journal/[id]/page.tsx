'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { JournalEntryView } from '@/components/journal-entry-view'
import { apiFetch } from '@/lib/api-client'
import { getFeedEntry, type FeedEntry } from '@/lib/feed-entries'

type ApiEntry = {
  id: string
  content: string
  imageUrl: string | null
  mood: string | null
  aiReflection: string | null
  createdAt: string
  user: { alias: string | null; avatarId: string | null }
  reactionCount: number
  hasReacted: boolean
}

function apiEntryToFeedEntry(data: ApiEntry): FeedEntry {
  const alias = data.user.alias ?? 'anonymous'
  const created = new Date(data.createdAt)
  const timestamp = created.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return {
    id: data.id,
    author: alias,
    authorHandle: `@${alias}`,
    avatarUrl: '',
    timestamp,
    title: data.mood ? `${data.mood} reflection` : 'Journal entry',
    markdownBody: data.content,
    paragraphs: data.content.split(/\n\n+/).filter(Boolean),
    imageUrl: data.imageUrl ?? undefined,
    reactions: data.reactionCount > 0 ? [{ emoji: '♥', count: data.reactionCount }] : [],
    comments: [],
    category: data.mood ?? undefined,
  }
}

function JournalEntryPageContent() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [entry, setEntry] = useState<FeedEntry | null>(null)
  const [entryId, setEntryId] = useState<string | null>(null)
  const [reactionCount, setReactionCount] = useState(0)
  const [hasReacted, setHasReacted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      const mock = getFeedEntry(id)

      try {
        const res = await apiFetch(`/api/entries/${encodeURIComponent(id)}`)
        if (res.ok) {
          const data = (await res.json()) as ApiEntry
          setEntry(apiEntryToFeedEntry(data))
          setEntryId(data.id)
          setReactionCount(data.reactionCount)
          setHasReacted(data.hasReacted)
          setLoading(false)
          return
        }

        if (res.status === 404) {
          setNotFound(true)
          setLoading(false)
          return
        }
      } catch {
        // fall through to mock
      }

      if (mock) {
        setEntry(mock)
        setEntryId(null)
        setLoading(false)
        return
      }

      setNotFound(true)
      setLoading(false)
    }

    void load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center font-body-md">
        Loading entry...
      </div>
    )
  }

  if (notFound || !entry) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center font-body-md">
        Entry not found
      </div>
    )
  }

  return (
    <JournalEntryView
      entry={entry}
      entryId={entryId ?? undefined}
      reactionCount={reactionCount}
      hasReacted={hasReacted}
      onReactionChange={(count, reacted) => {
        setReactionCount(count)
        setHasReacted(reacted)
      }}
    />
  )
}

export default function JournalEntryPage() {
  return (
    <AuthGuard>
      <JournalEntryPageContent />
    </AuthGuard>
  )
}
