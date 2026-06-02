'use client'

import React, { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'

export default function WritePage() {
  const [currentDate, setCurrentDate] = useState('')
  const [prompt, setPrompt] = useState<string | null>(null)
  const [promptLoading, setPromptLoading] = useState(true)
  const [promptError, setPromptError] = useState('')

  useEffect(() => {
    setCurrentDate(new Date().toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const res = await fetch('/api/prompt/today')
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

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md antialiased pb-[80px] md:pb-0">
      <SiteHeader />

      {/* Main Canvas */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-margin-desktop flex flex-col items-center">
        {/* Notebook Frame */}
        <article className="w-full max-w-3xl bg-surface border-4 border-on-background shadow-[8px_8px_0px_0px_#805533] flex flex-col relative overflow-hidden">
          {/* Spiral Edge Decoration */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-surface-container border-r-4 border-on-background flex flex-col items-center py-4 gap-4 z-10">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-4 border-on-background bg-background shadow-[inset_2px_2px_0px_0px_#805533]"
              />
            ))}
          </div>

          <div className="ml-8 flex flex-col h-full min-h-[614px]">
            {/* Toolbar */}
            <div className="bg-surface-container-highest border-b-4 border-on-background p-2 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  className="w-10 h-10 bg-surface border-2 border-on-background shadow-[2px_2px_0px_0px_#805533] flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#805533] active:bg-primary-container transition-all"
                  aria-label="Bold"
                >
                  <span className="material-symbols-outlined text-on-background">format_bold</span>
                </button>
                <button
                  type="button"
                  className="w-10 h-10 bg-surface border-2 border-on-background shadow-[2px_2px_0px_0px_#805533] flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#805533] active:bg-primary-container transition-all"
                  aria-label="Italic"
                >
                  <span className="material-symbols-outlined text-on-background">format_italic</span>
                </button>
                <button
                  type="button"
                  className="w-10 h-10 bg-surface border-2 border-on-background shadow-[2px_2px_0px_0px_#805533] flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#805533] active:bg-primary-container transition-all"
                  aria-label="Add emoji"
                >
                  <span className="material-symbols-outlined text-primary">sentiment_satisfied</span>
                </button>

                <button
                  type="button"
                  className="bg-surface-container-low border-2 border-on-background p-2 shadow-[2px_2px_0px_0px_#805533] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center"
                  aria-label="Add photo"
                >
                  <span className="material-symbols-outlined text-xl text-on-background">
                    add_photo_alternate
                  </span>
                </button>
              </div>
              <div className="font-headline-md text-headline-md text-primary tracking-tight px-4 bg-surface-container border-2 border-on-background shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                {currentDate}
              </div>
            </div>

            {/* Reflection Prompt */}
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
                    <p className="font-body-md text-body-md text-on-background">
                      {prompt}
                    </p>
                  ) : (
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {promptError || 'What made you smile today?'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Title Input Area */}
            <div className="p-4 border-b-2 border-outline-variant border-dashed flex flex-wrap items-center gap-4">
              <div className="hidden sm:block w-[2px] h-8 bg-on-background opacity-10" />

              <input
                className="flex-grow bg-transparent border-none font-headline-lg text-headline-lg focus:ring-0 focus:outline-none placeholder-on-surface-variant text-on-background"
                placeholder="Entry Title..."
                type="text"
              />
            </div>

            {/* Writing Area */}
            <div className="flex-grow relative">
              <div className="absolute bottom-4 right-4 opacity-30 pointer-events-none rotate-12">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">edit</span>
              </div>
              <textarea
                className="w-full h-full min-h-[400px] bg-transparent border-none focus:ring-0 focus:outline-none resize-none p-4 font-body-lg text-body-lg text-on-background leading-[32px] notebook-lines placeholder-on-surface-variant"
                placeholder="Dear Folio BU..."
              />
            </div>

            {/* Footer Action */}
            <div className="bg-surface-container-low border-t-4 border-on-background p-4 flex justify-end">
              <button
                type="button"
                className="bg-primary text-on-primary border-2 border-on-background shadow-[4px_4px_0px_0px_#1e1b16] hover:shadow-[2px_2px_0px_0px_#1e1b16] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75 px-6 py-3 font-headline-md text-headline-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined">save</span>
                SAVE ENTRY
              </button>
            </div>
          </div>
        </article>
      </main>

      {/* BottomNavBar (Mobile Only) */}
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
          href="#"
        >
          <span className="material-symbols-outlined text-2xl">photo_library</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Memories</span>
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
