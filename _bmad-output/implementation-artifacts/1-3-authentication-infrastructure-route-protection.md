# Story 1.3: Authentication Infrastructure & Route Protection

Status: review

## Story

As the application,
I want NextAuth.js v5 configured with a credentials provider and middleware protecting all auth-required routes,
so that sessions are created securely on login and unauthorized access to protected pages is blocked.

## Acceptance Criteria

1. **Given** `lib/auth.ts` is created with NextAuth v5 config
   **When** a user submits valid credentials
   **Then** NextAuth creates a JWT session containing only `userId`, `email`, `username` — no sensitive fields
   **And** the session cookie is `httpOnly`, `secure` in production, and `sameSite: lax`
   **And** no auth tokens are written to `localStorage` or `sessionStorage`

2. **Given** `middleware.ts` is configured with a matcher
   **When** an unauthenticated request targets `/upload`, `/api/upload/*`, `/api/download/*`, or `/api/bookmarks/*`
   **Then** the request is redirected to `/login`
   **And** authenticated requests to these paths proceed without interruption

3. **Given** the NextAuth route handler at `app/api/auth/[...nextauth]/route.ts` is in place
   **When** any NextAuth endpoint is called (GET or POST)
   **Then** it responds correctly following NextAuth v5 App Router conventions
   **And** `auth()` is used everywhere sessions are needed — `getServerSession()` is never used

## Tasks / Subtasks

- [x] Create `lib/auth.ts` — NextAuth v5 config (AC: #1, #3)
  - [x] Import `NextAuth` from `next-auth` and `Credentials` from `next-auth/providers/credentials`
  - [x] Import `getUserByEmail` from `@/lib/db/users` and `bcryptjs` from `bcryptjs`
  - [x] Configure credentials provider with `email` and `password` credential fields
  - [x] `authorize()`: call `getUserByEmail`, verify password with `bcrypt.compare`, return `{ id, email, username }` or `null`
  - [x] Add `jwt` callback: on first sign-in (`user` present), write `token.userId = user.id` and `token.username = user.username`
  - [x] Add `session` callback: copy `token.userId` → `session.user.userId`, `token.username` → `session.user.username`
  - [x] Set `session: { strategy: 'jwt' }`
  - [x] Set `pages: { signIn: '/login' }` so middleware redirects to the correct page
  - [x] Export named exports: `{ handlers, auth, signIn, signOut }`
  - [x] Add TypeScript module augmentation blocks for `Session`, `User`, and `JWT` types

- [x] Create `app/api/auth/[...nextauth]/route.ts` — route handler (AC: #3)
  - [x] Create the directory `app/api/auth/[...nextauth]/`
  - [x] Import `handlers` from `@/lib/auth`
  - [x] Export `const { GET, POST } = handlers`

- [x] Create `middleware.ts` — route protection (AC: #2)
  - [x] Export `auth as middleware` from `@/lib/auth`
  - [x] Export `config` with `matcher` array: `['/upload', '/api/upload/:path*', '/api/download/:path*', '/api/bookmarks/:path*']`

- [x] Verify (AC: #1, #2, #3)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors, 0 warnings (`npm run lint`)

## Dev Notes

### Files Overview

| File | Action | Notes |
|------|--------|-------|
| `lib/auth.ts` | CREATE | NextAuth v5 config — single source of auth truth |
| `app/api/auth/[...nextauth]/route.ts` | CREATE | NextAuth App Router handler |
| `middleware.ts` | CREATE | Route protection at project root (same level as `package.json`) |

### `lib/auth.ts` — Complete Implementation

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db/users'

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

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    username?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
})
```

**Critical details:**
- `getUserByEmail` is synchronous (better-sqlite3) — do NOT `await` it
- `bcrypt.compare` IS async — must `await`
- `authorize` returns `null` for both "user not found" and "wrong password" — never reveal which
- `user.id` in the `jwt` callback is the `id` field returned from `authorize` (= `users.id` UUID from DB)
- `token.userId` is set (not `token.id`) to match `SessionUser.userId` from `types/user.ts` established in Story 1.2
- Cookie security (httpOnly, secure:prod, sameSite:lax) is NextAuth's default — no manual config needed

### `app/api/auth/[...nextauth]/route.ts` — Complete Implementation

```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

This is the entire file. NextAuth v5 App Router convention requires exporting named `GET` and `POST`.

### `middleware.ts` — Complete Implementation

```typescript
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    '/upload',
    '/api/upload/:path*',
    '/api/download/:path*',
    '/api/bookmarks/:path*',
  ],
}
```

`middleware.ts` lives at the **project root** (same level as `package.json` and `next.config.ts`), NOT inside `app/`.

When an unauthenticated request hits any matched route, NextAuth redirects to `pages.signIn` = `/login`. The `/login` page does not exist yet (Story 1.5 creates it) — the redirect target is correct, the page just isn't built yet.

### TypeScript Module Augmentation

The `declare module` blocks in `lib/auth.ts` extend NextAuth's built-in types:
- `Session.user` is narrowed to `{ userId, email, username }` — exactly the `SessionUser` shape from `types/user.ts`
- `User.username` is added so the `jwt` callback can read `user.username` from `authorize()` without a type error
- `JWT.userId` and `JWT.username` are added so the `session` callback can read them without `token as any` casts

### Environment Variables

`NEXTAUTH_SECRET` is already set in `.env.local` (created in Story 1.1). NextAuth v5 reads it automatically. No additional env vars needed for this story.

### SessionUser Type Contract

Story 1.2 defined `SessionUser` in `types/user.ts` as:
```typescript
export interface SessionUser {
  userId: string  // ← NOTE: 'userId', not 'id'
  email: string
  username: string
}
```

Story 1.3's `Session.user` shape MUST match this exactly — including `userId` (not `id`). This contract is enforced by the `declare module 'next-auth'` augmentation.

### How `auth()` Is Used Downstream

Stories 1.4+ use `auth()` from `@/lib/auth` to read the session:

```typescript
// In a Server Component or Route Handler
import { auth } from '@/lib/auth'

const session = await auth()
if (!session) {
  // unauthenticated
}
// session.user.userId, session.user.email, session.user.username available
```

`getServerSession()` from next-auth/next is the NextAuth v4 API — never use it.

### Architecture Compliance Checklist

- Only `lib/auth.ts` configures NextAuth — never split auth config across files
- `auth()` is the only session accessor — used in Server Components, Route Handlers, and middleware
- No client-side auth redirects via `useEffect` + `router.push` — all auth decisions server-side
- `better-sqlite3` is not imported in `lib/auth.ts` — uses `lib/db/users.ts` functions only
- JWT strategy — no `sessions` table required in the DB schema (intentional V1 decision)

### Anti-Patterns to Avoid

- ❌ `getServerSession()` — NextAuth v4 API; not available in v5; will throw
- ❌ `import { getSession } from 'next-auth/react'` in Server Components — client-only API
- ❌ `await getUserByEmail(...)` — better-sqlite3 is synchronous; `await` silently does nothing and misleads
- ❌ Putting `middleware.ts` inside `app/` — must be at project root to intercept Next.js routing
- ❌ Returning `user.passwordHash` from `authorize()` — return only `{ id, email, username }`
- ❌ Storing session data in localStorage or sessionStorage — NextAuth handles cookies
- ❌ Using `token.id` in JWT callback — use `token.userId` to match `SessionUser` contract from Story 1.2

### No UI in This Story

This story is pure infrastructure. No pages, no components, no forms. The `/login` and `/register` pages and their forms are built in Stories 1.4 and 1.5.

### What Stays Unchanged

The `Navbar.tsx` in `components/layout/Navbar.tsx` still shows static placeholder "Sign up" / "Log in" links from Story 1.1. Story 1.5 makes these session-aware. Do NOT modify `Navbar.tsx` in this story.

### References

- NextAuth v5 credentials provider pattern: [Source: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#authentication--security`]
- `auth()` as single session accessor: [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#process-patterns`]
- Protected routes list: [Source: `_bmad-output/planning-artifacts/epics/epic-1-platform-foundation-authentication.md#story-13`]
- `middleware.ts` at project root: [Source: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#complete-project-directory-structure`]
- `SessionUser` type shape (`userId`, not `id`): [Source: `_bmad-output/implementation-artifacts/1-2-database-schema-user-data-layer.md#typesuserts`]
- JWT strategy (no sessions table): [Source: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#authentication--security`]
- No client-side auth redirects: [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#process-patterns`]
- `NEXTAUTH_SECRET` already in `.env.local`: [Source: `_bmad-output/implementation-artifacts/1-1-project-setup-design-system-foundation.md#completion-notes-list`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `declare module 'next-auth/jwt'` caused TS2664 ("module cannot be found") — fixed by using `declare module '@auth/core/jwt'` (the underlying auth.js package where `JWT` interface is defined)
- `export { auth as middleware }` from `lib/auth.ts` caused Edge Runtime build errors: `lib/db/index.ts` uses `fs`, `path`, `process.cwd()` which are Node.js-only — fixed by splitting config into `lib/auth.config.ts` (Edge-safe, no DB imports) + `lib/auth.ts` (Node.js, full config). Middleware now imports only `auth.config.ts`
- `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` — Next.js 16 deprecation warning for `middleware.ts`; functionality is unchanged; renaming to `proxy.ts` deferred until Next.js 16 stabilizes

### Completion Notes List

- `lib/auth.config.ts` created (NEW) — Edge-safe config: `pages.signIn: '/login'`, `session.strategy: 'jwt'`, `authorized` callback, empty providers array; no Node.js imports
- `lib/auth.ts` created — full NextAuth v5 config: spreads `authConfig`, adds credentials provider with `getUserByEmail` + bcryptjs, `jwt` and `session` callbacks writing `userId`/`username` into token and session; TypeScript module augmentation for `Session`, `User`, and `@auth/core/jwt.JWT`
- `app/api/auth/[...nextauth]/route.ts` created — 2-line file exporting `{ GET, POST }` from handlers
- `middleware.ts` created — imports `NextAuth(authConfig).auth` (Edge-safe path), matcher guards `/upload`, `/api/upload/*`, `/api/download/*`, `/api/bookmarks/*`
- TypeScript: 0 errors; build: successful (1 non-critical NFT warning pre-existing from story 1.2); ESLint: 0 errors, 0 warnings

### File List

- `lib/auth.config.ts` (created — Edge-safe NextAuth config for middleware)
- `lib/auth.ts` (created — full NextAuth v5 config with credentials provider)
- `app/api/auth/[...nextauth]/route.ts` (created — NextAuth App Router handler)
- `middleware.ts` (created — route protection)

## Change Log

- 2026-05-04: Story 1.3 implemented — NextAuth v5 auth infrastructure: split Edge/Node config, credentials provider, JWT sessions, route protection middleware (claude-sonnet-4-6)
