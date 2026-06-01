'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { AvatarIcon } from '@/components/avatar-icon'
import type { AvatarId } from '@/lib/avatars'
import { isAvatarId } from '@/lib/avatars'

export function SiteHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isLoggedIn = status === 'authenticated' && session?.user?.onboardingComplete

  const avatarId: AvatarId =
    session?.user?.avatarId && isAvatarId(session.user.avatarId)
      ? session.user.avatarId
      : 'robot'

  useEffect(() => {
    if (!isLoggedIn) return

    const loadUnread = async () => {
      try {
        const res = await fetch('/api/notifications/unread')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(typeof data.count === 'number' ? data.count : 0)
        }
      } catch {
        setUnreadCount(0)
      }
    }

    loadUnread()
  }, [isLoggedIn, pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleSignOut = () => {
    setMenuOpen(false)
    signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="bg-surface dark:bg-surface-container-low border-b-4 border-on-background dark:border-on-surface-variant sticky top-0 z-40">
      <div className="flex justify-between items-center w-full px-gutter py-4 max-w-container-max mx-auto gap-4">
        <Link
          href="/feed"
          className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black text-primary tracking-tighter uppercase shrink-0 hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75"
        >
          PIXEL_LOG
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                className="relative w-10 h-10 flex items-center justify-center bg-surface border-2 border-on-background shadow-[2px_2px_0px_0px_#653d1e] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#653d1e] transition-all"
              >
                <span className="material-symbols-outlined text-on-background text-[22px]">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center bg-primary text-on-primary border-2 border-on-background font-label-sm text-label-sm leading-none shadow-[2px_2px_0px_0px_#1e1b16]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <Link
                href="/write"
                className="font-label-lg text-label-lg bg-primary text-on-primary border-2 border-on-background px-3 py-2 md:px-4 shadow-[4px_4px_0px_0px_#653d1e] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#653d1e] transition-all duration-75 whitespace-nowrap"
              >
                Write Today
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                  className="w-10 h-10 border-2 border-on-background bg-surface-container shadow-[2px_2px_0px_0px_#653d1e] overflow-hidden hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <AvatarIcon id={avatarId} className="w-full h-full p-0.5" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-48 bg-surface border-2 border-on-background shadow-[4px_4px_0px_0px_#653d1e] z-50 py-1"
                  >
                    {session?.user?.alias && (
                      <p className="px-3 py-2 font-label-sm text-label-sm text-on-surface-variant border-b-2 border-outline-variant truncate">
                        {session.user.alias}
                      </p>
                    )}
                    <Link
                      role="menuitem"
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 font-label-lg text-label-lg text-on-background hover:bg-surface-container-high transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      role="menuitem"
                      href="/journal"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 font-label-lg text-label-lg text-on-background hover:bg-surface-container-high transition-colors"
                    >
                      My Journals
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 font-label-lg text-label-lg text-primary hover:bg-surface-container-high transition-colors border-t-2 border-outline-variant mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="font-label-lg text-label-lg bg-primary text-on-primary border-2 border-on-background px-4 py-2 shadow-[4px_4px_0px_0px_#653d1e] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#653d1e] transition-all duration-75"
            >
              Write Today
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
