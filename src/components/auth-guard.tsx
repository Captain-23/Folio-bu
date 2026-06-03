'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

type AuthGuardProps = {
  children: ReactNode
  /** When true (default), users without onboarding go to /onboarding */
  requireOnboarding?: boolean
}

export function AuthGuard({ children, requireOnboarding = true }: AuthGuardProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (requireOnboarding && !user.onboardingComplete) {
      router.replace('/onboarding')
    }
  }, [loading, user, router, requireOnboarding])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center font-body-md">
        Loading...
      </div>
    )
  }

  if (!user || (requireOnboarding && !user.onboardingComplete)) {
    return null
  }

  return <>{children}</>
}
