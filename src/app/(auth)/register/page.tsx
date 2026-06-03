'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Standalone register route — use /login Join Chronicle tab for email verification signup */
export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center font-body-md text-on-surface-variant">
      Redirecting to sign up...
    </div>
  )
}
