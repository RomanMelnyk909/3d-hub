import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db/users'
import { authConfig } from './auth.config'

// Constant-time guard: always run bcrypt even when user is not found,
// preventing email enumeration via response-time differences.
const DUMMY_HASH = bcrypt.hashSync('__placeholder__', 10)

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

        // synchronous — better-sqlite3
        const user = getUserByEmail(credentials.email as string)
        const hash = user?.passwordHash ?? DUMMY_HASH
        const isValid = await bcrypt.compare(credentials.password as string, hash)

        if (!user || !isValid) return null

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
      return {
        ...session,
        user: {
          email: session.user.email,
          userId: token.userId as string,
          username: token.username as string,
        },
      }
    },
  },
})
