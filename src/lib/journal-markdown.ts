// Lightweight markdown subset for journal entries: **bold**, *italic*, line breaks.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function formatJournalMarkdown(text: string): string {
  let html = escapeHtml(text)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/\n/g, '<br />')
  return html
}
