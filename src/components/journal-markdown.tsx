'use client'

import { formatJournalMarkdown } from '@/lib/journal-markdown'

type JournalMarkdownProps = {
  content: string
  className?: string
}

export function JournalMarkdown({ content, className = '' }: JournalMarkdownProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: formatJournalMarkdown(content) }}
    />
  )
}
