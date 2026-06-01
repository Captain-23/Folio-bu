// NextAuth configuration.
// Exports authOptions used by both the [...nextauth] route handler
// and getServerSession() in all protected API routes.

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { isBennettEmail, normalizeEmail } from './bennett-email'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = normalizeEmail(credentials.email)
        if (!isBennettEmail(email)) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) return null

        const onboardingComplete = user.onboardingComplete || !!user.alias

        return {
          id: user.id,
          email: user.email,
          alias: user.alias ?? '',
          avatarId: user.avatarId ?? '',
          role: user.role,
          onboardingComplete,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.alias = user.alias
        token.avatarId = user.avatarId
        token.role = user.role
        token.onboardingComplete = user.onboardingComplete
      }

      if (trigger === 'update' && session) {
        if (session.alias !== undefined) token.alias = session.alias as string
        if (session.avatarId !== undefined) token.avatarId = session.avatarId as string
        if (session.onboardingComplete !== undefined) {
          token.onboardingComplete = session.onboardingComplete as boolean
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.alias = (token.alias as string) ?? ''
        session.user.avatarId = (token.avatarId as string) ?? ''
        session.user.role = token.role as string
        session.user.onboardingComplete = Boolean(token.onboardingComplete)
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
}
