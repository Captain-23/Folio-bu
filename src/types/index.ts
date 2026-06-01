// Global type definitions for the application.

import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    alias: string
    avatarId: string
    role: string
    onboardingComplete: boolean
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    alias: string
    avatarId: string
    role: string
    onboardingComplete: boolean
  }
}
