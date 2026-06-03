import { getStoredToken } from '@/lib/auth/client-session'

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getStoredToken()
  const headers = new Headers(init.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  })
}
