'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api-client'
import {
  clearClientSession,
  getStoredToken,
  getStoredUser,
  setClientSession,
  type StoredAuthUser,
} from '@/lib/auth/client-session'
import type { SafeUser } from '@/lib/serializers/safe-user'
import type { AvatarId } from '@/lib/avatars'

type AuthPurpose = 'login' | 'signup'

type SendCodePayload =
  | {
      purpose: 'login'
      email: string
      password: string
    }
  | {
      purpose: 'signup'
      email: string
      password: string
      agreedToRules: boolean
      alias?: string
      avatarId?: AvatarId
    }

type AuthContextValue = {
  user: StoredAuthUser | null
  loading: boolean
  isAuthenticated: boolean
  sendAuthCode: (payload: SendCodePayload) => Promise<{ devCode?: string }>
  confirmAuthCode: (email: string, code: string, purpose: AuthPurpose) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUserLocal: (user: SafeUser, onboardingComplete: boolean) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function applyAuthResponse(
  data: { token: string; user: SafeUser; onboardingComplete?: boolean },
  fallbackOnboarding = true
) {
  const onboardingComplete = data.onboardingComplete ?? fallbackOnboarding
  setClientSession(data.token, data.user, onboardingComplete)
  return { ...data.user, onboardingComplete }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<StoredAuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const res = await apiFetch('/api/auth/me')
    if (!res.ok) {
      clearClientSession()
      setUser(null)
      return
    }
    const data = (await res.json()) as {
      user: SafeUser
      onboardingComplete: boolean
    }
    const token = getStoredToken()
    if (token) {
      setClientSession(token, data.user, data.onboardingComplete)
    }
    setUser({ ...data.user, onboardingComplete: data.onboardingComplete })
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredUser()
      if (stored) {
        setUser(stored)
      }
      try {
        await refreshUser()
      } finally {
        setLoading(false)
      }
    }
    void bootstrap()
  }, [refreshUser])

  const sendAuthCode = useCallback(async (payload: SendCodePayload) => {
    const body =
      payload.purpose === 'login'
        ? {
            purpose: 'login' as const,
            email: payload.email.trim().toLowerCase(),
            password: payload.password,
          }
        : {
            purpose: 'signup' as const,
            email: payload.email.trim().toLowerCase(),
            password: payload.password,
            agreedToRules: true,
            acceptedCommunityRules: true,
            ...(payload.alias ? { alias: payload.alias } : {}),
            ...(payload.avatarId ? { avatarId: payload.avatarId } : {}),
          }

    const res = await fetch('/api/auth/verify/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = (await res.json()) as { error?: string; devCode?: string }

    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Could not send code')
    }

    return { devCode: data.devCode }
  }, [])

  const confirmAuthCode = useCallback(
    async (email: string, code: string, purpose: AuthPurpose) => {
      const res = await fetch('/api/auth/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
          purpose,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Verification failed')
      }

      const success = data as {
        token: string
        user: SafeUser
        onboardingComplete?: boolean
      }
      const nextUser = applyAuthResponse(success, success.onboardingComplete === true)
      setUser(nextUser)
      router.push(nextUser.onboardingComplete ? '/feed' : '/onboarding')
    },
    [router]
  )

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' })
    clearClientSession()
    setUser(null)
    router.push('/login')
  }, [router])

  const setUserLocal = useCallback((next: SafeUser, onboardingComplete: boolean) => {
    const token = localStorage.getItem('folio_bu_token')
    if (token) {
      setClientSession(token, next, onboardingComplete)
    }
    setUser({ ...next, onboardingComplete })
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      sendAuthCode,
      confirmAuthCode,
      logout,
      refreshUser,
      setUserLocal,
    }),
    [user, loading, sendAuthCode, confirmAuthCode, logout, refreshUser, setUserLocal]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export function useOptionalAuth() {
  return useContext(AuthContext)
}
