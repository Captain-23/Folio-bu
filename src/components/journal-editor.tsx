'use client'

import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { apiFetch } from '@/lib/api-client'

const MAX_CONTENT = 1000
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type JournalEditorProps = {
  content: string
  onContentChange: (value: string) => void
  imageUrl: string | null
  onImageUrlChange: (url: string | null) => void
  disabled?: boolean
}

function toolbarButtonClass(active = false) {
  return `w-10 h-10 bg-surface border-2 border-on-background shadow-[2px_2px_0px_0px_#805533] flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#805533] transition-all disabled:opacity-50 ${
    active ? 'bg-primary-container' : ''
  }`
}

export function JournalEditor({
  content,
  onContentChange,
  imageUrl,
  onImageUrlChange,
  disabled = false,
}: JournalEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const el = textareaRef.current
      if (!el) return

      const start = el.selectionStart
      const end = el.selectionEnd
      const selected = content.slice(start, end)
      const next =
        content.slice(0, start) + before + selected + after + content.slice(end)

      if (next.length > MAX_CONTENT) return

      onContentChange(next)

      requestAnimationFrame(() => {
        el.focus()
        const cursor = start + before.length + selected.length + after.length
        el.setSelectionRange(cursor, cursor)
      })
    },
    [content, onContentChange]
  )

  const handleBold = () => wrapSelection('**', '**')
  const handleItalic = () => wrapSelection('*', '*')

  const handleImagePick = () => {
    setUploadError('')
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Use JPEG, PNG, WebP, or GIF.')
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError('Image must be 2 MB or smaller.')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await apiFetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        setUploadError(typeof data.error === 'string' ? data.error : 'Upload failed')
        return
      }

      onImageUrlChange(data.url)
    } catch {
      setUploadError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="bg-surface-container-highest border-b-4 border-on-background p-2 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleBold}
            disabled={disabled}
            className={toolbarButtonClass()}
            aria-label="Bold"
            title="Bold (**text**)"
          >
            <span className="material-symbols-outlined text-on-background font-bold">format_bold</span>
          </button>
          <button
            type="button"
            onClick={handleItalic}
            disabled={disabled}
            className={toolbarButtonClass()}
            aria-label="Italic"
            title="Italic (*text*)"
          >
            <span className="material-symbols-outlined text-on-background">format_italic</span>
          </button>
          <button
            type="button"
            onClick={handleImagePick}
            disabled={disabled || uploading}
            className={toolbarButtonClass(!!imageUrl)}
            aria-label="Add image"
            title="Add photo"
          >
            <span className="material-symbols-outlined text-primary">
              {uploading ? 'hourglass_top' : 'add_photo_alternate'}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant px-2 hidden sm:block">
          **bold** · *italic*
        </p>
      </div>

      {uploadError && (
        <p className="px-4 pt-2 font-label-sm text-label-sm text-error">{uploadError}</p>
      )}

      {imageUrl && (
        <div className="px-4 pt-4">
          <div className="relative border-4 border-on-background shadow-[4px_4px_0px_0px_#865046] overflow-hidden bg-surface-container-high">
            <img
              src={imageUrl}
              alt="Journal attachment"
              className="w-full max-h-64 object-cover"
            />
            <button
              type="button"
              onClick={() => onImageUrlChange(null)}
              disabled={disabled}
              className="absolute top-2 right-2 bg-surface border-2 border-on-background px-2 py-1 font-label-sm text-label-sm hover:bg-error-container"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="flex-grow relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value.slice(0, MAX_CONTENT))}
          maxLength={MAX_CONTENT}
          disabled={disabled}
          className="w-full h-full min-h-[400px] bg-transparent border-none focus:ring-0 focus:outline-none resize-none p-4 font-body-lg text-body-lg text-on-background leading-[32px] notebook-lines placeholder-on-surface-variant disabled:opacity-60"
          placeholder="Dear Folio BU..."
        />
        <p className="absolute bottom-2 right-4 font-label-sm text-label-sm text-on-surface-variant">
          {content.length}/{MAX_CONTENT}
        </p>
      </div>
    </>
  )
}
