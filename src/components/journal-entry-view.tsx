'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { JournalMarkdown } from '@/components/journal-markdown'
import { SiteHeader } from '@/components/site-header'
import { apiFetch } from '@/lib/api-client'
import type { FeedEntry } from '@/lib/feed-entries'
import { AVATAR_DISPLAY } from '@/lib/avatar-display'

type ApiComment = {
  id: string
  content: string
  createdAt: string
  user: { alias: string | null; avatarId: string | null }
}

type JournalEntryViewProps = {
  entry: FeedEntry
  entryId?: string
  reactionCount?: number
  hasReacted?: boolean
  onReactionChange?: (count: number, reacted: boolean) => void
}

export function JournalEntryView({
  entry,
  entryId,
  reactionCount: initialCount = 0,
  hasReacted: initialReacted = false,
  onReactionChange,
}: JournalEntryViewProps) {
  const [comments] = useState(entry.comments)
  const [apiComments, setApiComments] = useState<ApiComment[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [posting, setPosting] = useState(false)
  const [reactions, setReactions] = useState(entry.reactions)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [apiReactionCount, setApiReactionCount] = useState(initialCount)
  const [apiHasReacted, setApiHasReacted] = useState(initialReacted)
  const [reacting, setReacting] = useState(false)

  // Fetch real comments for DB entries
  useEffect(() => {
    if (!entryId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch(`/api/entries/${encodeURIComponent(entryId)}/comments`)
        if (res.ok && !cancelled) {
          const data = (await res.json()) as { comments: ApiComment[] }
          setApiComments(data.comments)
        }
      } catch {
        // silently ignore — message board just stays empty
      }
    })()
    return () => { cancelled = true }
  }, [entryId])

  const REACTION_OPTIONS = ['❤️', '💙', '👏', '🔥', '😢', '🌱'] as const

  const handleApiResonate = async () => {
    if (!entryId || reacting) return

    setReacting(true)
    try {
      const res = await apiFetch(`/api/entries/${encodeURIComponent(entryId)}/react`, {
        method: 'POST',
      })
      const data = (await res.json()) as {
        reacted?: boolean
        reactionCount?: number
        error?: string
      }

      if (res.ok && typeof data.reactionCount === 'number' && typeof data.reacted === 'boolean') {
        setApiReactionCount(data.reactionCount)
        setApiHasReacted(data.reacted)
        onReactionChange?.(data.reactionCount, data.reacted)
      }
    } finally {
      setReacting(false)
    }
  }

  const handlePostMessage = async () => {
    if (!messageInput.trim() || posting) return

    // Mock entries — no backend
    if (!entryId) {
      console.log('Posting message:', messageInput)
      setMessageInput('')
      return
    }

    setPosting(true)
    try {
      const res = await apiFetch(
        `/api/entries/${encodeURIComponent(entryId)}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ content: messageInput.trim() }),
        }
      )
      if (res.ok) {
        const data = (await res.json()) as { comment: ApiComment }
        setApiComments((prev) => [...prev, data.comment])
        setMessageInput('')
      }
    } finally {
      setPosting(false)
    }
  }

  const handleReaction = (emoji: string) => {
    const isSameReaction = selectedReaction === emoji

    setReactions((prev) => {
      const next = [...prev]
      const selectedIndex = selectedReaction ? next.findIndex((r) => r.emoji === selectedReaction) : -1

      if (selectedIndex >= 0) {
        const updated = { ...next[selectedIndex], count: Math.max(0, next[selectedIndex].count - 1) }
        if (updated.count === 0) {
          next.splice(selectedIndex, 1)
        } else {
          next[selectedIndex] = updated
        }
      }

      if (isSameReaction) {
        return next
      }

      const targetIndex = next.findIndex((r) => r.emoji === emoji)
      if (targetIndex >= 0) {
        next[targetIndex] = { ...next[targetIndex], count: next[targetIndex].count + 1 }
      } else {
        next.push({ emoji, count: 1 })
      }

      return next
    })

    setSelectedReaction(isSameReaction ? null : emoji)
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-margin-desktop md:py-margin-desktop flex flex-col md:flex-row gap-8">
        <article className="flex-grow max-w-3xl mx-auto w-full">
          <header className="mb-8 relative">
            <Link
              className="inline-flex items-center gap-2 font-label-lg text-label-lg text-on-surface-variant mb-6 hover:text-primary transition-colors"
              href="/feed"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                arrow_back
              </span>
              Back to Feed
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Link
                href={`/profile/${entry.authorHandle.replace(/^@/, '').toLowerCase()}`}
                className="font-label-lg text-label-lg text-primary underline hover:text-secondary transition-colors"
              >
                {entry.authorHandle}
              </Link>
              {entry.category && (
                <span className="bg-secondary text-on-secondary font-label-sm text-label-sm px-2 py-1 border-2 border-on-background uppercase">
                  {entry.category}
                </span>
              )}
              <span className="font-body-md text-body-md text-on-surface-variant">
                {entry.timestamp}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg md:font-headline-lg md:text-headline-lg text-on-background mb-6">
              {entry.title}
            </h1>

            {entry.imageUrl && (
              <div className="w-full h-64 md:h-96 border-4 border-on-background shadow-[4px_4px_0px_0px_#865046] mb-8 relative overflow-hidden bg-surface-container-high">
                <img
                  alt={entry.imageAlt ?? entry.title}
                  className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply"
                  src={entry.imageUrl}
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
              </div>
            )}

            <div className="h-1 bg-[linear-gradient(to_right,#1e1b16_50%,transparent_50%)] bg-[length:8px_100%] w-full mb-8" />
          </header>

          <div className="font-body-lg text-body-lg text-on-background space-y-6 leading-relaxed relative bg-surface-container p-6 md:p-12 border-4 border-on-background shadow-[4px_4px_0px_0px_#865046]">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(transparent 27px, rgba(30, 27, 22, 0.1) 28px)',
                backgroundSize: '100% 28px',
                backgroundPosition: '0 8px',
              }}
            />

            <JournalMarkdown
              content={entry.markdownBody ?? entry.paragraphs.join('\n\n')}
              className="relative z-10"
            />

            {entry.quote && (
              <blockquote className="relative z-10 border-l-4 border-primary pl-4 italic text-on-surface-variant font-body-md text-body-md my-8">
                &ldquo;{entry.quote.text}&rdquo; — {entry.quote.attribution}
              </blockquote>
            )}

            {entry.tags && entry.tags.length > 0 && (
              <div className="relative z-10 flex flex-wrap gap-2 pt-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-surface px-2 py-1 border-2 border-on-background font-label-sm text-label-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {entryId && (
            <div className="mt-12 flex flex-wrap items-center gap-4 bg-surface p-4 border-2 border-on-background">
              <span className="font-label-lg text-label-lg text-on-surface-variant mr-2">
                Resonate:
              </span>
              <button
                type="button"
                onClick={handleApiResonate}
                disabled={reacting}
                className={`flex items-center gap-1 px-4 py-2 border-2 border-on-background shadow-[2px_2px_0px_0px_#865046] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform disabled:opacity-50 ${
                  apiHasReacted
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-highest text-primary'
                }`}
              >
                <span className="font-label-lg text-label-lg">
                  ♥ {apiReactionCount}
                  {apiHasReacted ? ' · you' : ''}
                </span>
              </button>
            </div>
          )}

          {!entryId && (
          <div className="mt-12 flex flex-wrap items-center gap-4 bg-surface p-4 border-2 border-on-background">
            <span className="font-label-lg text-label-lg text-on-surface-variant mr-2">
              Reactions:
            </span>
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                onClick={() => handleReaction(reaction.emoji)}
                className={`flex items-center gap-1 px-3 py-1 border-2 border-on-background shadow-[2px_2px_0px_0px_#865046] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform group ${
                  selectedReaction === reaction.emoji
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-highest text-primary'
                }`}
              >
                <span className="font-label-sm text-label-sm">
                  {reaction.emoji} {reaction.count}
                </span>
              </button>
            ))}
          </div>
          )}

          {!entryId && (
          <div className="mt-4 bg-surface-container p-4 border-2 border-on-background">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-3">
              Add your reaction
            </p>
            <div className="flex flex-wrap gap-2">
              {REACTION_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReaction(emoji)}
                  className={`px-3 py-2 border-2 border-on-background shadow-[2px_2px_0px_0px_#865046] transition-all ${
                    selectedReaction === emoji
                      ? 'bg-primary text-on-primary translate-x-[1px] translate-y-[1px] shadow-none'
                      : 'bg-surface hover:translate-x-[1px] hover:translate-y-[1px]'
                  }`}
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          )}

          <div className="h-1 bg-[linear-gradient(to_right,#1e1b16_50%,transparent_50%)] bg-[length:8px_100%] w-full my-12" />

          <section className="mt-8">
            <h3 className="font-headline-md text-headline-md text-on-background mb-6 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                forum
              </span>
              Message Board ({entryId ? apiComments.length : comments.length})
            </h3>

            <div className="bg-surface-container p-4 border-4 border-on-background mb-8">
              <label className="block font-label-lg text-label-lg text-on-background mb-2">
                Leave a message...
              </label>
              <textarea
                className="w-full bg-surface-bright border-2 border-on-background p-3 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary resize-none h-24 mb-4"
                placeholder="Write your thoughts here..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePostMessage}
                  disabled={posting || !messageInput.trim()}
                  className="bg-secondary text-on-secondary font-label-lg text-label-lg px-4 py-2 border-2 border-on-background shadow-[2px_2px_0px_0px_#4b6546] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75 disabled:opacity-50"
                >
                  {posting ? 'Posting...' : 'Post Message'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Mock comments for mock entries */}
              {!entryId && comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div
                    className={`w-12 h-12 ${comment.avatarBg} border-2 border-on-background flex-shrink-0 flex items-center justify-center ${comment.avatarTextColor} font-headline-md`}
                  >
                    {comment.avatar}
                  </div>
                  <div className="flex-grow bg-surface p-4 border-2 border-on-background relative">
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-surface border-l-2 border-t-2 border-on-background transform -rotate-45" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className={`font-label-lg text-label-lg ${comment.authorColor}`}>
                        {comment.author}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-background relative z-10">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Real comments for DB entries */}
              {entryId && apiComments.map((comment) => {
                const display = AVATAR_DISPLAY[comment.user.avatarId ?? ''] ?? AVATAR_DISPLAY._default
                const alias = comment.user.alias ?? 'anonymous'
                const ts = new Date(comment.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <div key={comment.id} className="flex gap-4">
                    <div
                      className={`w-12 h-12 ${display.bg} border-2 border-on-background flex-shrink-0 flex items-center justify-center ${display.text} font-headline-md`}
                    >
                      {display.letter}
                    </div>
                    <div className="flex-grow bg-surface p-4 border-2 border-on-background relative">
                      <div className="absolute -left-2 top-4 w-4 h-4 bg-surface border-l-2 border-t-2 border-on-background transform -rotate-45" />
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="font-label-lg text-label-lg text-primary">
                          {alias}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {ts}
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-background relative z-10">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </article>
      </main>

      <footer className="bg-surface-container-highest border-t-4 border-on-background border-dashed w-full py-margin-desktop px-gutter flex flex-col items-center gap-4 text-center mt-auto mb-[72px] md:mb-0">
        <div className="font-headline-md text-primary">Folio BU</div>
        <div className="font-body-md text-body-md text-on-surface-variant">
          © 199X CHRONICLE8. BIT-PERFECT JOURNALING.
        </div>
      </footer>
    </div>
  )
}
