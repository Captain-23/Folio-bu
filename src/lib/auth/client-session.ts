import type { SafeUser } from '@/lib/serializers/safe-user'
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants'

const TOKEN_KEY = 'folio_bu_token'
const USER_KEY = 'folio_bu_user'
const ONBOARDING_KEY = 'folio_bu_onboarding_complete'

export type StoredAuthUser = SafeUser & {
  onboardingComplete: boolean
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): StoredAuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const user = JSON.parse(raw) as SafeUser
    const onboardingComplete = localStorage.getItem(ONBOARDING_KEY) === 'true'
    return { ...user, onboardingComplete }
  } catch {
    return null
  }
}

export function setClientSession(token: string, user: SafeUser, onboardingComplete: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(ONBOARDING_KEY, onboardingComplete ? 'true' : 'false')
}

export function clearClientSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ONBOARDING_KEY)
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`
}
