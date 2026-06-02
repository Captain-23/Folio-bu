'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { EXPLORE_FEED_IDS, TODAY_STRIP_IDS, getFeedEntry } from '@/lib/feed-entries'

function stripCardClasses(variant?: 'secondary' | 'primary' | 'surface') {
  switch (variant) {
    case 'secondary':
      return 'bg-secondary-container'
    case 'primary':
      return 'bg-primary-container'
    default:
      return 'bg-surface-container-highest'
  }
}

function stripTextClasses(variant?: 'secondary' | 'primary' | 'surface') {
  switch (variant) {
    case 'secondary':
      return {
        author: 'text-on-secondary-container',
        meta: 'text-on-secondary-container/70',
      }
    case 'primary':
      return {
        author: 'text-on-primary-container',
        meta: 'text-on-primary-container/70',
      }
    default:
      return {
        author: 'text-on-surface-variant',
        meta: 'text-on-surface-variant/70',
      }
  }
}

export default function FeedPage() {
  const stripEntries = TODAY_STRIP_IDS.map((id) => getFeedEntry(id)!)
  const exploreEntries = EXPLORE_FEED_IDS.map((id) => getFeedEntry(id)!)
  const [weeklyDigest, setWeeklyDigest] = useState<
    Array<{
      id: string
      content: string
      mood: string | null
      createdAt: string
      user: { alias: string | null }
      _count: { reactions: number }
    }>
  >([])
  const [digestLoading, setDigestLoading] = useState(true)

  useEffect(() => {
    const loadWeeklyDigest = async () => {
      try {
        const res = await fetch('/api/entries/weekly-digest')
        if (!res.ok) return

        const data = (await res.json()) as {
          entries?: Array<{
            id: string
            content: string
            mood: string | null
            createdAt: string
            user: { alias: string | null }
            _count: { reactions: number }
          }>
        }
        setWeeklyDigest(Array.isArray(data.entries) ? data.entries : [])
      } catch {
        setWeeklyDigest([])
      } finally {
        setDigestLoading(false)
      }
    }

    loadWeeklyDigest()
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <SiteHeader />

      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-margin-desktop space-y-margin-desktop">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <h2 className="font-headline-md text-headline-md text-primary uppercase tracking-wide">
              Today&apos;s Journals
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
            {stripEntries.map((entry) => {
              const text = stripTextClasses(entry.stripVariant)
              return (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  className={`min-w-[280px] snap-start ${stripCardClasses(entry.stripVariant)} pixel-border p-4 pixel-shadow shrink-0 pixel-shadow-hover transition-all cursor-pointer block hover:translate-x-[2px] hover:translate-y-[2px]`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-surface pixel-border-thin overflow-hidden">
                      <img
                        alt=""
                        className="w-full h-full object-cover pixelated"
                        src={entry.avatarUrl}
                      />
                    </div>
                    <div>
                      <p className={`font-label-lg text-label-lg ${text.author}`}>
                        {entry.authorHandle}
                      </p>
                      <p className={`font-label-sm text-label-sm ${text.meta}`}>
                        {entry.timestamp}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-2">{entry.title}</h3>
                  <div className="flex gap-2 mt-4">
                    {entry.reactions.map((r) => (
                      <span
                        key={r.emoji}
                        className="bg-surface px-2 py-1 pixel-border-thin font-label-sm text-label-sm"
                      >
                        {r.emoji} {r.count}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calendar_month
            </span>
            <h2 className="font-headline-md text-headline-md text-primary uppercase tracking-wide">
              Weekly Digest
            </h2>
          </div>
          {digestLoading ? (
            <div className="bg-surface-container-highest pixel-border p-5 text-on-surface-variant">
              Loading this week&apos;s highlights...
            </div>
          ) : weeklyDigest.length === 0 ? (
            <div className="bg-surface-container-highest pixel-border p-5 text-on-surface-variant">
              No reacted entries yet this week.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weeklyDigest.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  className="bg-surface-container pixel-border pixel-shadow pixel-shadow-hover transition-all p-5 block hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-label-lg text-label-lg text-on-surface">
                      @{entry.user.alias ?? 'anonymous'}
                    </p>
                    <span className="bg-surface px-2 py-1 pixel-border-thin font-label-sm text-label-sm">
                      ♥ {entry._count.reactions}
                    </span>
                  </div>
                  {entry.mood && (
                    <p className="font-label-sm text-label-sm text-primary uppercase mb-3">
                      Mood: {entry.mood}
                    </p>
                  )}
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-4">
                    {entry.content}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              explore
            </span>
            <h2 className="font-headline-md text-headline-md text-primary uppercase tracking-wide">
              Explore Entries
            </h2>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {exploreEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="break-inside-avoid bg-surface-container pixel-border pixel-shadow pixel-shadow-hover transition-all cursor-pointer group block hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                {entry.imageUrl && (
                  <div className="h-48 border-b-4 border-on-background overflow-hidden relative">
                    <img
                      alt={entry.imageAlt ?? entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={entry.imageUrl}
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-secondary-container pixel-border-thin overflow-hidden">
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        src={entry.avatarUrl}
                      />
                    </div>
                    <p className="font-label-lg text-label-lg text-on-surface">
                      {entry.authorHandle}
                    </p>
                  </div>
                  {entry.title && !entry.imageUrl && (
                    <h3 className="font-headline-md text-headline-md mb-3">{entry.title}</h3>
                  )}
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4 leading-relaxed">
                    {entry.paragraphs[0]}
                  </p>
                  {entry.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-surface px-2 py-1 pixel-border-thin font-label-sm text-label-sm text-on-surface"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t-2 border-on-background/20 pt-3">
                    <div className="flex gap-2">
                      {entry.reactions.map((r) => (
                        <span
                          key={r.emoji}
                          className="bg-surface px-2 py-1 pixel-border-thin font-label-sm text-label-sm"
                        >
                          {r.emoji} {r.count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface border-t-[4px] border-[#8B5E3C] pb-safe pt-2">
        <Link
          className="flex flex-col items-center justify-center bg-primary text-on-primary border-2 border-on-background p-1 translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-95 transition-transform w-16 h-14"
          href="/feed"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            grid_view
          </span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Feed</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-secondary-container dark:hover:bg-secondary-fixed-dim w-16 h-14"
          href="/write"
        >
          <span className="material-symbols-outlined">edit_square</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Journal</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-secondary-container dark:hover:bg-secondary-fixed-dim w-16 h-14"
          href="/profile"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
