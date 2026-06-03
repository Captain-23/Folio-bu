const WORDS_PER_MINUTE = 200

/** Compute word count and estimated read time before persisting an entry. */
export function computeEntryMetrics(content: string) {
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  const readTimeSecs = Math.max(1, Math.ceil((wordCount / WORDS_PER_MINUTE) * 60))

  return { wordCount, readTimeSecs }
}
