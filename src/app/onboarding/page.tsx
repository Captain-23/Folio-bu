'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AvatarPicker } from '@/components/avatar-picker'
import type { AvatarId } from '@/lib/avatars'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [pseudonym, setPseudonym] = useState('')
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }
    if (status === 'authenticated' && session?.user?.onboardingComplete) {
      router.replace('/feed')
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!pseudonym.trim()) {
      setError('Enter a display name')
      return
    }
    if (!avatarId) {
      setError('Choose one of the 8 character avatars for your profile picture')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudonym: pseudonym.trim(), avatarId }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not save profile')
        return
      }

      await update({
        alias: data.alias,
        avatarId: data.avatarId,
        onboardingComplete: true,
      })

      router.push('/feed')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center font-body-md">
        Loading...
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.onboardingComplete) {
    return null
  }

  return (
    <div className="bg-surface-container-low text-on-background min-h-screen flex items-center justify-center p-4 font-body-md">
      <main className="w-full max-w-lg">
        <div className="bg-surface border-4 border-on-background shadow-[8px_8px_0px_0px_#805533] p-8">
          <div className="text-center mb-6">
            <h1 className="font-headline-lg text-headline-lg uppercase text-primary tracking-tighter">
              Create Your Character
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Name yourself anything you like. Your profile picture must be one of the
              characters below.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container border-2 border-on-background text-on-error-container font-label-sm text-label-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="pseudonym"
                className="font-label-lg text-label-lg text-on-background uppercase"
              >
                Display name
              </label>
              <input
                id="pseudonym"
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                placeholder="Anything you want — not your real name"
                autoComplete="off"
                maxLength={32}
                className="w-full bg-surface-container-lowest border-t-4 border-l-4 border-b-2 border-r-2 border-t-on-background border-l-on-background border-b-outline border-r-outline focus:outline-none focus:border-primary p-3 font-body-md text-body-md text-on-background"
              />
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Any name you choose (up to 32 characters). Do not use your real name.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-label-lg text-label-lg text-on-background uppercase">
                Profile picture (pick one character)
              </span>
              <p className="font-label-sm text-label-sm text-on-surface-variant -mt-1">
                Only these 8 non-human characters — no photo uploads.
              </p>
              <AvatarPicker value={avatarId} onChange={setAvatarId} />
            </div>

            <button
              type="submit"
              disabled={loading || !pseudonym.trim() || !avatarId}
              className="w-full bg-secondary text-on-secondary border-2 border-on-background font-label-lg text-label-lg uppercase py-4 shadow-[4px_4px_0px_0px_#653d1e] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Enter the Village'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
