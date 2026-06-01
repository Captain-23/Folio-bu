import { notFound } from 'next/navigation'
import { JournalEntryView } from '@/components/journal-entry-view'
import { getFeedEntry } from '@/lib/feed-entries'

type JournalEntryPageProps = {
  params: { id: string }
}

export default function JournalEntryPage({ params }: JournalEntryPageProps) {
  const entry = getFeedEntry(params.id)

  if (!entry) {
    notFound()
  }

  return <JournalEntryView entry={entry} />
}
