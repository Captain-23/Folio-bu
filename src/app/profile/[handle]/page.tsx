'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AvatarIcon } from '@/components/avatar-icon'
import { SiteHeader } from '@/components/site-header'
import { AuthGuard } from '@/components/auth-guard'
import { apiFetch } from '@/lib/api-client'
import { isAvatarId } from '@/lib/avatars'

type PublicProfile = {
  id: string
  alias: string
  avatarId: string
  bio: string
  entriesCount: number
  reactionsReceived: number
  streakDays: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isSelf: boolean
  entries: Array<{
    id: string
    content: string
    createdAt: string
    reactionsCount: number
  }>
}

function PublicProfilePageContent() {
  const params = useParams<{ handle: string }>()
  const handle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (!handle) return

    const loadProfile = async () => {
      try {
        const res = await apiFetch(`/api/users/${encodeURIComponent(handle)}`)
        const data = await res.json()
        if (!res.ok) {
          setError(typeof data.error === 'string' ? data.error : 'Could not load profile')
          return
        }

        setProfile(data.profile as PublicProfile)
      } catch {
        setError('Could not load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [handle])

  const toggleFollow = async () => {
    if (!handle || !profile || profile.isSelf) return

    setFollowLoading(true)
    try {
      const res = await apiFetch(`/api/users/${encodeURIComponent(handle)}/follow`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not update follow status')
        return
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: Boolean(data.isFollowing),
              followersCount:
                typeof data.followersCount === 'number' ? data.followersCount : prev.followersCount,
            }
          : prev
      )
    } catch {
      setError('Could not update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-margin-desktop space-y-6">
        <section className="bg-surface-container border-2 border-on-background shadow-[6px_6px_0px_0px_#653d1e] p-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 font-label-lg text-label-lg text-on-surface-variant mb-4 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Feed
          </Link>

          {loading ? (
            <p className="font-body-md text-body-md text-on-surface-variant">Loading profile...</p>
          ) : !profile ? (
            <p className="font-body-md text-body-md text-error">{error || 'Profile not found'}</p>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-6 md:items-start">
                <div className="w-24 h-24 border-4 border-on-background bg-secondary-container p-2 shadow-[4px_4px_0px_0px_#653d1e]">
                  <AvatarIcon id={isAvatarId(profile.avatarId) ? profile.avatarId : 'robot'} />
                </div>

                <div className="flex-1">
                  <h1 className="font-headline-lg text-headline-lg text-primary">@{profile.alias}</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    {profile.bio || 'No bio yet.'}
                  </p>
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <span className="bg-surface px-3 py-2 border-2 border-on-background font-label-sm text-label-sm">
                      Journals: {profile.entriesCount}
                    </span>
                    <span className="bg-surface px-3 py-2 border-2 border-on-background font-label-sm text-label-sm">
                      Reactions: {profile.reactionsReceived}
                    </span>
                    <span className="bg-surface px-3 py-2 border-2 border-on-background font-label-sm text-label-sm">
                      Streak: {profile.streakDays} days
                    </span>
                    <span className="bg-surface px-3 py-2 border-2 border-on-background font-label-sm text-label-sm">
                      Followers: {profile.followersCount}
                    </span>
                    <span className="bg-surface px-3 py-2 border-2 border-on-background font-label-sm text-label-sm">
                      Following: {profile.followingCount}
                    </span>
                  </div>
                </div>

                {!profile.isSelf && (
                  <button
                    type="button"
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`px-4 py-2 border-2 border-on-background font-label-lg text-label-lg uppercase shadow-[4px_4px_0px_0px_#653d1e] transition-all ${
                      profile.isFollowing
                        ? 'bg-surface text-on-background'
                        : 'bg-primary text-on-primary'
                    } disabled:opacity-60`}
                  >
                    {followLoading ? 'Updating...' : profile.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              {error && <p className="mt-4 font-label-sm text-label-sm text-error">{error}</p>}
            </>
          )}
        </section>

        {profile && (
          <section className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary uppercase">Shared Journals</h2>
            {profile.entries.length === 0 ? (
              <div className="bg-surface border-2 border-on-background p-4 text-on-surface-variant">
                No shared journals yet.
              </div>
            ) : (
              profile.entries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  className="block bg-surface border-2 border-on-background shadow-[4px_4px_0px_0px_#653d1e] p-5 hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      ♥ {entry.reactionsCount}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
                    {entry.content}
                  </p>
                </Link>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default function PublicProfilePage() {
  return (
    <AuthGuard>
      <PublicProfilePageContent />
    </AuthGuard>
  )
}
