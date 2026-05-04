import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db/users'
import { authConfig } from './auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      userId: string
      email: string
      username: string
    }
  }
  interface User {
    username?: string
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId?: string
    username?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = getUserByEmail(credentials.email as string)
        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          username: user.username,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string
        token.username = user.username
      }
      return token
    },
    session({ session, token }) {
      session.user.userId = token.userId as string
      session.user.username = token.username as string
      return session
    },
  },
})
