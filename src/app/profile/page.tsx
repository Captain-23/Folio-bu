'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AvatarIcon } from '@/components/avatar-icon'
import { AvatarPicker } from '@/components/avatar-picker'
import { SiteHeader } from '@/components/site-header'
import { isAvatarId, type AvatarId } from '@/lib/avatars'

type CalendarCell = {
  day: number
  inCurrentMonth: boolean
  isToday: boolean
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [stats, setStats] = useState({
    entriesCount: 0,
    reactionsReceived: 0,
    streakDays: 0,
    loading: true,
  })
  const [now, setNow] = useState(new Date())
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profile, setProfile] = useState({
    alias: '',
    avatarId: 'robot' as AvatarId,
    bio: '',
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadMilestones = async () => {
      try {
        const res = await fetch('/api/profile/milestones')
        if (!res.ok) return

        const data = (await res.json()) as {
          entriesCount: number
          reactionsReceived: number
          streakDays: number
        }

        setStats({
          entriesCount: data.entriesCount ?? 0,
          reactionsReceived: data.reactionsReceived ?? 0,
          streakDays: data.streakDays ?? 0,
          loading: false,
        })
      } catch {
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }

    loadMilestones()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) return

        const data = (await res.json()) as {
          alias?: string
          avatarId?: string
          bio?: string
        }

        setProfile({
          alias: data.alias ?? session?.user?.alias ?? 'anonymous',
          avatarId: data.avatarId && isAvatarId(data.avatarId) ? data.avatarId : 'robot',
          bio: data.bio ?? '',
        })
      } catch {
        setProfile((prev) => ({
          ...prev,
          alias: session?.user?.alias ?? prev.alias,
          avatarId:
            session?.user?.avatarId && isAvatarId(session.user.avatarId)
              ? session.user.avatarId
              : prev.avatarId,
        }))
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [session?.user?.alias, session?.user?.avatarId])

  const milestones = useMemo(
    () => [
      {
        id: 'first-journal',
        title: 'First Journal',
        subtitle: 'Publish your first memory',
        icon: 'auto_stories',
        unlocked: stats.entriesCount >= 1,
      },
      {
        id: 'ten-journals',
        title: '10 Journals',
        subtitle: `${Math.min(stats.entriesCount, 10)}/10 written`,
        icon: 'collections_bookmark',
        unlocked: stats.entriesCount >= 10,
      },
      {
        id: 'fifty-journals',
        title: '50 Journals',
        subtitle: `${Math.min(stats.entriesCount, 50)}/50 written`,
        icon: 'library_books',
        unlocked: stats.entriesCount >= 50,
      },
      {
        id: 'week-streak',
        title: '7-Day Streak',
        subtitle: `${Math.min(stats.streakDays, 7)}/7 day streak`,
        icon: 'local_fire_department',
        unlocked: stats.streakDays >= 7,
      },
      {
        id: 'month-streak',
        title: '30-Day Streak',
        subtitle: `${Math.min(stats.streakDays, 30)}/30 day streak`,
        icon: 'whatshot',
        unlocked: stats.streakDays >= 30,
      },
      {
        id: 'century-hearts',
        title: '100 Hearts',
        subtitle: `${Math.min(stats.reactionsReceived, 100)}/100 reactions`,
        icon: 'favorite',
        unlocked: stats.reactionsReceived >= 100,
      },
    ],
    [stats.entriesCount, stats.reactionsReceived, stats.streakDays]
  )

  const nextStreakUnlock = stats.streakDays < 7 ? 7 : stats.streakDays < 30 ? 30 : 50
  const monthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const today = useMemo(() => {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    return date
  }, [now])

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const startWeekday = firstDayOfMonth.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const cells: CalendarCell[] = []

    for (let i = startWeekday - 1; i >= 0; i -= 1) {
      const day = daysInPrevMonth - i
      cells.push({
        day,
        inCurrentMonth: false,
        isToday: false,
      })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const candidate = new Date(year, month, day)
      candidate.setHours(0, 0, 0, 0)
      cells.push({
        day,
        inCurrentMonth: true,
        isToday: candidate.getTime() === today.getTime(),
      })
    }

    const totalSlots = Math.ceil(cells.length / 7) * 7
    const nextMonthDays = totalSlots - cells.length
    for (let day = 1; day <= nextMonthDays; day += 1) {
      cells.push({
        day,
        inCurrentMonth: false,
        isToday: false,
      })
    }

    return cells
  }, [calendarMonth, today])

  const handlePrevMonth = () => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    )
  }

  const handleSaveProfile = async () => {
    setProfileError('')
    setProfileSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarId: profile.avatarId,
          bio: profile.bio.trim(),
        }),
      })

      const data = (await res.json()) as {
        error?: string
        alias?: string
        avatarId?: string
        bio?: string
      }

      if (!res.ok) {
        setProfileError(data.error ?? 'Could not update profile')
        return
      }

      const nextAvatarId =
        data.avatarId && isAvatarId(data.avatarId) ? data.avatarId : profile.avatarId

      setProfile({
        alias: data.alias ?? profile.alias,
        avatarId: nextAvatarId,
        bio: data.bio ?? '',
      })

      await update({ avatarId: nextAvatarId })
      setIsEditingProfile(false)
    } catch {
      setProfileError('Could not update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased selection:bg-secondary-container selection:text-on-secondary-container pb-24 md:pb-0">
      <SiteHeader />

      {/* Main Canvas */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-margin-mobile md:py-margin-desktop flex flex-col gap-8">
        {/* Profile Header (Bento Box) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar & Bio Card */}
          <div className="md:col-span-2 bg-surface-container border-2 border-on-background shadow-[6px_6px_0px_0px_#653d1e] p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
            {/* Retro Corner Accent */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-primary border-b-2 border-l-2 border-on-background"></div>

            {/* Avatar */}
            <div className="shrink-0 w-32 h-32 border-4 border-on-background bg-secondary-container shadow-[4px_4px_0px_0px_#653d1e] p-2">
              <AvatarIcon id={profile.avatarId} />
            </div>

            {/* Info */}
            <div className="flex flex-col text-center md:text-left flex-1">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">
                @{profileLoading ? 'loading...' : profile.alias || 'anonymous'}
              </h1>
              {isEditingProfile ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    maxLength={240}
                    rows={3}
                    className="w-full bg-surface border-2 border-on-background p-3 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary"
                    placeholder="Write a short bio..."
                  />
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {profile.bio.length}/240
                  </p>
                  <AvatarPicker
                    value={profile.avatarId}
                    onChange={(avatarId) => setProfile((prev) => ({ ...prev, avatarId }))}
                  />
                  {profileError && (
                    <p className="font-label-sm text-label-sm text-error">{profileError}</p>
                  )}
                  <div className="flex gap-2 justify-center md:justify-start">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="px-4 py-2 border-2 border-on-background bg-primary text-on-primary font-label-lg text-label-lg uppercase disabled:opacity-60"
                    >
                      {profileSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false)
                        setProfileError('')
                      }}
                      className="px-4 py-2 border-2 border-on-background bg-surface font-label-lg text-label-lg uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4 whitespace-pre-wrap">
                    {profile.bio || 'No bio yet. Add one to personalize your profile.'}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="font-label-sm text-label-sm bg-secondary px-2 py-1 text-on-secondary border-2 border-on-background uppercase"
                    >
                      Edit Bio
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="font-label-sm text-label-sm bg-tertiary px-2 py-1 text-on-tertiary border-2 border-on-background uppercase"
                    >
                      Change Avatar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Block (Inventory Style) */}
          <div className="md:col-span-1 grid grid-cols-2 gap-4">
            <div className="bg-surface-bright border-2 border-on-background shadow-[4px_4px_0px_0px_#653d1e] p-4 flex flex-col items-center justify-center text-center">
              <span
                className="material-symbols-outlined text-primary mb-2 text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                book
              </span>
              <span className="font-headline-md text-headline-md text-on-background">
                {stats.loading ? '...' : stats.entriesCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">
                Entries
              </span>
            </div>

            <div className="bg-surface-bright border-2 border-on-background shadow-[4px_4px_0px_0px_#653d1e] p-4 flex flex-col items-center justify-center text-center">
              <span
                className="material-symbols-outlined text-secondary mb-2 text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span className="font-headline-md text-headline-md text-on-background">
                {stats.loading ? '...' : stats.reactionsReceived}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">
                Reactions
              </span>
            </div>

            <div className="bg-surface-bright border-2 border-on-background shadow-[4px_4px_0px_0px_#653d1e] p-4 flex flex-col items-center justify-center text-center col-span-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">
                Current Streak
              </span>
              <div className="w-full bg-surface-variant h-4 border-2 border-on-background relative overflow-hidden mt-2">
                {/* Progress Bar */}
                <div
                  className="absolute top-0 left-0 h-full bg-secondary border-r-2 border-on-background"
                  style={{
                    width: `${Math.min(100, Math.round((stats.streakDays / nextStreakUnlock) * 100))}%`,
                  }}
                ></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-background mt-2">
                {stats.loading ? 'Loading...' : `${stats.streakDays} Days / Next Unlock: ${nextStreakUnlock}`}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-4 border-on-background pb-2">
            <h2 className="font-headline-md text-headline-md text-on-background uppercase tracking-tight">
              Milestones
            </h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Pixel badge progress
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((milestone) => (
              <article
                key={milestone.id}
                className={`border-2 border-on-background p-4 shadow-[4px_4px_0px_0px_#653d1e] ${
                  milestone.unlocked
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-surface-bright text-on-surface-variant'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`material-symbols-outlined text-[28px] ${
                      milestone.unlocked ? 'text-secondary' : 'text-outline'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {milestone.icon}
                  </span>
                  <span
                    className={`font-label-sm text-label-sm uppercase border px-2 py-0.5 ${
                      milestone.unlocked
                        ? 'border-on-background bg-primary text-on-primary'
                        : 'border-outline bg-surface text-on-surface-variant'
                    }`}
                  >
                    {milestone.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <h3 className="font-label-lg text-label-lg uppercase">{milestone.title}</h3>
                <p className="font-body-sm text-body-sm mt-1">{milestone.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Journal Archive (Inventory Grid) */}
        <section className="mt-4 flex flex-col gap-4">
          <div className="flex justify-between items-end border-b-4 border-on-background pb-2">
            <h2 className="font-headline-md text-headline-md text-on-background uppercase tracking-tight">
              Memory Inventory
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="btn-retro p-1 border-2 border-on-background bg-surface shadow-[2px_2px_0px_0px_#1e1b16]"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_left</span>
              </button>
              <span className="font-label-lg text-label-lg self-center px-2 uppercase">{monthLabel}</span>
              <button
                onClick={handleNextMonth}
                className="btn-retro p-1 border-2 border-on-background bg-surface shadow-[2px_2px_0px_0px_#1e1b16]"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_right</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container border-4 border-on-background shadow-[8px_8px_0px_0px_#653d1e] p-4 md:p-6">
            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2 text-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant">S</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">M</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">T</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">W</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">T</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">F</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">S</span>
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {calendarCells.map((cell, index) => (
                <div
                  key={`${cell.day}-${cell.inCurrentMonth}-${index}`}
                  className={`aspect-square border-2 relative ${
                    cell.inCurrentMonth
                      ? 'bg-surface border-on-background/30'
                      : 'bg-surface border-surface-variant opacity-70'
                  } ${cell.isToday ? 'shadow-[inset_0_0_0_2px_theme(colors.primary)]' : 'inset-shadow'}`}
                >
                  <span
                    className={`font-label-sm text-label-sm absolute top-1 right-1 ${
                      cell.inCurrentMonth ? 'text-on-background' : 'text-on-surface-variant'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {cell.isToday && (
                    <div className="absolute inset-0 border-2 border-primary animate-pulse pointer-events-none"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface border-t-4 border-on-background pb-safe pt-2">
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-secondary-container dark:hover:bg-secondary-fixed-dim"
          href="/feed"
        >
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Feed</span>
        </a>

        <a
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-secondary-container dark:hover:bg-secondary-fixed-dim"
          href="/journal"
        >
          <span className="material-symbols-outlined">edit_square</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Journal</span>
        </a>

        <a
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-secondary-container dark:hover:bg-secondary-fixed-dim"
          href="#"
        >
          <span className="material-symbols-outlined">photo_library</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Memories</span>
        </a>

        {/* Active Tab */}
        <a
          className="flex flex-col items-center justify-center bg-primary text-on-primary border-2 border-on-background p-1 translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-95 transition-transform"
          href="/profile"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Profile</span>
        </a>
      </nav>
    </div>
  )
}
