// NextAuth middleware — protects all routes except login, register, and public assets.
// Unauthenticated requests are redirected to /login automatically.

export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    // '/feed/:path*', // temporarily disabled for dev
    // '/journal/:path*', // temporarily disabled for dev
    '/api/entries/:path*',
    '/api/journal/:path*',
    '/api/mood/:path*',
    '/api/prompt/:path*',
    '/api/reflection/:path*',
    '/api/admin/:path*',
  ],
}
