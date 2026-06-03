'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { JournalEditor } from '@/components/journal-editor'
import { SiteHeader } from '@/components/site-header'
import { apiFetch } from '@/lib/api-client'

function WritePageContent() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<string | null>(null)
  const [promptLoading, setPromptLoading] = useState(true)
  const [promptError, setPromptError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setCurrentDate(new Date().toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const res = await apiFetch('/api/prompt/today')
        if (!res.ok) {
          setPromptError('Could not load today’s prompt.')
          return
        }
        const data = (await res.json()) as { prompt: string | null }
        setPrompt(data.prompt)
      } catch {
        setPromptError('Could not load today’s prompt.')
      } finally {
        setPromptLoading(false)
      }
    }

    loadPrompt()
  }, [])

  const handleSave = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      setSaveError('Write something before saving.')
      return
    }

    setSaveError('')
    setSaving(true)

    try {
      const res = await apiFetch('/api/entries', {
        method: 'POST',
        body: JSON.stringify({
          content: trimmed,
          ...(imageUrl ? { imageUrl } : {}),
        }),
      })

      const data = (await res.json()) as { error?: string; entry?: { id: string } }

      if (!res.ok) {
        setSaveError(typeof data.error === 'string' ? data.error : 'Could not save entry')
        return
      }

      if (data.entry?.id) {
        router.push(`/journal/${data.entry.id}`)
        return
      }

      router.push('/feed')
    } catch {
      setSaveError('Could not save entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md antialiased pb-[80px] md:pb-0">
      <SiteHeader />

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-margin-desktop flex flex-col items-center">
        <article className="w-full max-w-3xl bg-surface border-4 border-on-background shadow-[8px_8px_0px_0px_#805533] flex flex-col relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-surface-container border-r-4 border-on-background flex flex-col items-center py-4 gap-4 z-10">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-4 border-on-background bg-background shadow-[inset_2px_2px_0px_0px_#805533]"
              />
            ))}
          </div>

          <div className="ml-8 flex flex-col h-full min-h-[614px]">
            <div className="bg-surface-container-highest border-b-4 border-on-background p-2 flex justify-end">
              <div className="font-headline-md text-headline-md text-primary tracking-tight px-4 bg-surface-container border-2 border-on-background shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                {currentDate}
              </div>
            </div>

            <div className="px-4 pt-4">
              <div className="bg-surface-container-low border-2 border-on-background px-4 py-3 flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-secondary mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1 tracking-wide">
                    Reflection prompt
                  </p>
                  {promptLoading ? (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Fetching today&apos;s idea...
                    </p>
                  ) : prompt ? (
                    <p className="font-body-md text-body-md text-on-background">{prompt}</p>
                  ) : (
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {promptError || 'What made you smile today?'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <JournalEditor
              content={content}
              onContentChange={setContent}
              imageUrl={imageUrl}
              onImageUrlChange={setImageUrl}
              disabled={saving}
            />

            {saveError && (
              <p className="px-4 font-label-sm text-label-sm text-error">{saveError}</p>
            )}

            <div className="bg-surface-container-low border-t-4 border-on-background p-4 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="bg-primary text-on-primary border-2 border-on-background shadow-[4px_4px_0px_0px_#1e1b16] hover:shadow-[2px_2px_0px_0px_#1e1b16] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75 px-6 py-3 font-headline-md text-headline-md flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">save</span>
                {saving ? 'SAVING...' : 'SAVE ENTRY'}
              </button>
            </div>
          </div>
        </article>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface-container dark:bg-surface-dim border-t-4 border-on-background pb-safe">
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-full hover:bg-secondary-container transition-colors"
          href="/feed"
        >
          <span className="material-symbols-outlined text-2xl">grid_view</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Feed</span>
        </a>
        <a
          className="flex flex-col items-center justify-center bg-primary text-on-primary border-2 border-on-background p-1 translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full active:scale-95 transition-transform"
          href="/write"
        >
          <span className="material-symbols-outlined text-2xl">edit_square</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Journal</span>
        </a>
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-full hover:bg-secondary-container transition-colors"
          href="/profile"
        >
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Profile</span>
        </a>
      </nav>
    </div>
  )
}

export default function WritePage() {
  return (
    <AuthGuard>
      <WritePageContent />
    </AuthGuard>
  )
}
