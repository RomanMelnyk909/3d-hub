import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    '/upload',
    '/api/upload/:path*',
    '/api/download/:path*',
    '/api/bookmarks/:path*',
  ],
}
