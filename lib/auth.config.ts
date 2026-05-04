import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  providers: [],
} satisfies NextAuthConfig
