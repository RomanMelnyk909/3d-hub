import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        if (!auth?.user) {
          return Response.json(
            { error: 'Authentication required', code: 'UNAUTHENTICATED' },
            { status: 401 }
          )
        }
        return true
      }
      return !!auth?.user
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  providers: [],
} satisfies NextAuthConfig
