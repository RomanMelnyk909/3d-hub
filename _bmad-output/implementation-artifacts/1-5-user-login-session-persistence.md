# Story 1.5: User Login & Session Persistence

Status: done

## Story

As a registered user,
I want to log in with my email and password and remain recognized across page navigation,
so that I don't need to re-authenticate on every page visit.

## Acceptance Criteria

1. **Given** I am unauthenticated and visit `/login`
   **When** the page loads
   **Then** a form renders with visible labels for Email and Password
   **And** a "Log in" button and a "Create account" link are visible

2. **Given** I submit valid credentials
   **When** NextAuth processes sign-in
   **Then** a session cookie is set and I am redirected to the homepage (or the page I came from via `callbackUrl`)
   **And** the Navbar updates to show my username and a "Log out" option instead of "Sign up" / "Log in"

3. **Given** I am authenticated and navigate between multiple pages
   **When** each Server Component reads the session via `auth()`
   **Then** I remain recognized without re-prompting for credentials

4. **Given** I click "Log out"
   **When** `signOut()` is called
   **Then** my session cookie is cleared and I am redirected to the homepage
   **And** the Navbar reverts to unauthenticated state

5. **Given** I submit incorrect credentials
   **When** NextAuth rejects them
   **Then** an inline error appears: "Incorrect email or password"
   **And** no session is created

## Tasks / Subtasks

- [x] Add `loginSchema` to `lib/validations.ts` (AC: #1, #5)
  - [x] Export `loginSchema`: `z.object({ email: z.string().email('Invalid email address'), password: z.string().min(1, 'Password is required') })`
  - [x] Export `LoginInput` type: `z.infer<typeof loginSchema>`
  - [x] Do NOT modify the existing `registrationSchema` or `RegistrationInput`

- [x] Create `components/auth/LoginForm.tsx` — client form component (AC: #1, #2, #5)
  - [x] Add `'use client'` directive
  - [x] Accept `callbackUrl?: string` prop (passed from page server component)
  - [x] Import `useForm` from `react-hook-form`, `zodResolver` from `@hookform/resolvers/zod`
  - [x] Import `signIn` from `next-auth/react` and `useRouter` from `next/navigation`
  - [x] Import `Link` from `next/link`, `Button`, `Input`, `Label` from `@/components/ui/...`
  - [x] Import `loginSchema`, `LoginInput` from `@/lib/validations` and `AsyncState` from `@/types/api`
  - [x] Configure form: `useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: 'onSubmit' })`
  - [x] Track `AsyncState` with `useState<AsyncState>('idle')`; track `formError` with `useState<string | null>(null)`
  - [x] Render `<Label>` above each `<Input>` (not placeholder-only); wire via `{...register('email')}` / `{...register('password')}`
  - [x] Show field errors from `formState.errors` below each input
  - [x] Show `formError` as a form-level error above the submit button (for "Incorrect email or password")
  - [x] On submit: set state `'loading'`; clear `formError`; call `signIn('credentials', { email, password, redirect: false })`
  - [x] On `result?.error` (CredentialsSignin): set `formError('Incorrect email or password')`; set state `'error'`; do NOT navigate
  - [x] On success: set state `'idle'`; `router.push(callbackUrl ?? '/')`
  - [x] Disable "Log in" button while `state === 'loading'`
  - [x] Render "Create account" link → `/register`

- [x] Create `app/(auth)/login/page.tsx` — login page (AC: #1, #2, #3)
  - [x] Server Component (no `'use client'`)
  - [x] Import `auth` from `@/lib/auth` and `redirect` from `next/navigation`
  - [x] Import `LoginForm` from `@/components/auth/LoginForm`
  - [x] Accept `{ searchParams }` prop typed as `{ searchParams: Promise<{ callbackUrl?: string }> }`
  - [x] `await searchParams` to extract `callbackUrl`
  - [x] Call `const session = await auth()`; if session exists, call `redirect('/')`
  - [x] Render `<LoginForm callbackUrl={callbackUrl} />` in a centered layout with accessible `<h1>`
  - [x] Layout mirrors `app/(auth)/register/page.tsx` exactly (same container classes)

- [x] Refactor `components/layout/Navbar.tsx` into Server + Client split (AC: #2, #4)
  - [x] Remove `'use client'` from `Navbar.tsx`; convert to `async` Server Component
  - [x] Import `auth` from `@/lib/auth`; call `const session = await auth()`
  - [x] Create `components/layout/NavbarActions.tsx` as the new `'use client'` component
  - [x] `NavbarActions` accepts `user: { username: string } | null` prop
  - [x] Move all `useState`, `Menu`/`X` icons, mobile drawer, and auth CTAs into `NavbarActions`
  - [x] In `NavbarActions`: render desktop nav (hidden sm:flex) with conditional auth display:
    - When `user`: show `<span>{user.username}</span>` + `<button onClick={() => signOut({ callbackUrl: '/' })}>Log out</button>`
    - When no `user`: show "Log in" link + "Sign up" link (identical to current Navbar)
  - [x] In `NavbarActions`: render mobile hamburger + mobile drawer with same conditional auth links
  - [x] Import `signOut` from `next-auth/react` in `NavbarActions` (NOT from `@/lib/auth`)
  - [x] Address deferred item: add `onKeyDown` Escape handler to close mobile menu
  - [x] `Navbar.tsx` renders `<NavbarActions user={session?.user ?? null} />`
  - [x] `app/layout.tsx` remains unchanged — still imports `<Navbar />` as before

- [x] Fix deferred null guard in `lib/auth.ts` (from deferred-work.md — 1.2 code review)
  - [x] In `session` callback: change `userId: token.userId as string` to `userId: (token.userId ?? '') as string`
  - [x] This prevents a type-unsafe cast that would silently return `undefined` as a session userId

- [x] Verify (all AC)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors, 0 warnings (`npm run lint`)
  - [ ] Manual: visit `/login` unauthenticated → form renders with labels, "Log in" button, "Create account" link
  - [ ] Manual: submit valid credentials → session set → redirected to `/` → Navbar shows username + "Log out"
  - [ ] Manual: submit invalid credentials → inline error "Incorrect email or password" → no redirect
  - [ ] Manual: navigate multiple pages while authenticated → remain logged in
  - [ ] Manual: click "Log out" → redirected to `/` → Navbar reverts to "Log in" / "Sign up"
  - [ ] Manual: authenticated user visits `/login` → redirected to `/`
  - [ ] Manual: middleware redirects unauthenticated user from protected route → lands on `/login` → after login, redirected back to original route

### Review Findings

- [x] [Review][Patch] Open redirect via unvalidated callbackUrl — attacker can craft `?callbackUrl=https://evil.com` to redirect off-site after login [`app/(auth)/login/page.tsx:10`, `components/auth/LoginForm.tsx:50`]
- [x] [Review][Patch] signIn `ok:false`/`null` falls through as login success — when NextAuth returns `{ ok: false, error: null }` or resolves to `null`, the error branch is skipped and `router.push` fires without a real session [`components/auth/LoginForm.tsx:43-50`]
- [x] [Review][Patch] `router.refresh()` missing after sign-in — RSC router cache may serve stale Navbar (unauthenticated state) when `callbackUrl` is already the current page [`components/auth/LoginForm.tsx:49-51`]
- [x] [Review][Patch] Password schemas have no `.max()` — arbitrarily long passwords pass validation and hit bcrypt, which is O(n) on input length, enabling a CPU exhaustion DoS [`lib/validations.ts:4,11`]
- [x] [Review][Patch] Mobile drawer Escape handler on non-focusable `div` — `onKeyDown` on a plain `div` without `tabIndex` never fires; keyboard users cannot dismiss the menu with Escape [`components/layout/NavbarActions.tsx:55`]
- [x] [Review][Patch] `token.username` cast to `string` without null guard — inconsistent with the `userId` fix applied in this story; old sessions may have `token.username` as `undefined` [`lib/auth.ts:72`]
- [x] [Review][Patch] Mobile "Log out" button in drawer does not call `setMobileOpen(false)` before `signOut` — on slow connections the drawer remains visibly open during redirect [`components/layout/NavbarActions.tsx:62`]
- [x] [Review][Defer] Empty-string userId guard (`?? ''`) creates phantom session risk — deferred; this is the intended fix per deferred-work.md; broader concern is a NextAuth JWT type-system limitation out of scope for this story [`lib/auth.ts:61,71`]
- [x] [Review][Defer] Mobile drawer has no focus trap (WCAG 2.1 §2.1.2) — deferred; story scope only required Escape key handler, not full focus management
- [x] [Review][Defer] `setState('idle')` before `router.push` allows brief button re-enable — deferred; window is sub-frame and React batches the updates; negligible in practice [`components/auth/LoginForm.tsx:49`]
- [x] [Review][Defer] `signIn` specific error code not server-side logged — deferred; generic message is intentional to prevent email enumeration; structured logging deferred to V2 per architecture [`components/auth/LoginForm.tsx:44`]
- [x] [Review][Defer] Derived username collision loop runs only once (pre-existing from Story 1.4) — deferred; pre-existing issue not introduced by this story

## Dev Notes

### Approach: Server/Client Navbar Split (NOT SessionProvider + useSession)

The Navbar must become session-aware. Two approaches exist; this story uses the **Server/Client split**:

- `Navbar.tsx` becomes an `async` Server Component calling `auth()` — aligns with architecture's "Server Components perform fine-grained session checks"
- `NavbarActions.tsx` is the extracted `'use client'` component receiving session data as a prop
- `app/layout.tsx` is NOT modified (no `SessionProvider` wrapper needed)
- The `signOut` function in `NavbarActions` is imported from `next-auth/react`

This avoids hydration flash (username is server-rendered), requires no `SessionProvider`, and is the pattern aligned with NextAuth v5 + App Router architecture.

### LoginForm vs RegisterForm Differences

| | `LoginForm` | `RegisterForm` |
|---|---|---|
| Schema | `loginSchema` (password min 1) | `registrationSchema` (password min 8) |
| Error display | Form-level `formError` state for bad creds | Field-level email error for 409 |
| signIn call | Direct (no intermediate POST) | Calls `/api/auth/register` first |
| Post-success | `router.push(callbackUrl ?? '/')` | `router.push('/')` always |
| Post-success state reset | `setState('idle')` | `setState('idle')` |

### callbackUrl Handling

The auth.config.ts sets `pages: { signIn: '/login' }`. When NextAuth middleware redirects an unauthenticated user from `/upload`, it appends `?callbackUrl=%2Fupload` to the URL.

Read `callbackUrl` **server-side** in the page component to avoid `useSearchParams` + Suspense boilerplate:

```tsx
// app/(auth)/login/page.tsx
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  const session = await auth()
  if (session) redirect('/')
  return <LoginForm callbackUrl={callbackUrl} />
}
```

Pass `callbackUrl` as a prop to `LoginForm`. After successful login:
```typescript
router.push(callbackUrl ?? '/')
```

### signIn Error Handling

`signIn('credentials', { redirect: false })` returns `{ error, status, ok, url }`. On invalid credentials, `result.error` equals `'CredentialsSignin'`. Do NOT distinguish error subtypes — always show the generic "Incorrect email or password" message to prevent email enumeration:

```typescript
const result = await signIn('credentials', {
  email: data.email,
  password: data.password,
  redirect: false,
})

if (result?.error) {
  setFormError('Incorrect email or password')
  setState('error')
  return
}

setState('idle')
router.push(callbackUrl ?? '/')
```

### loginSchema Password Validation

Login password field uses `min(1, 'Password is required')` — NOT `min(8, ...)`. The 8-character requirement only applies to registration (prevents confusing error if user has a short legacy password or types a valid password that happens to be less than 8 chars in a different context).

### Navbar Refactor — Exact Implementation Plan

**`Navbar.tsx` after refactor (Server Component):**
```tsx
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { NavbarActions } from './NavbarActions'

export async function Navbar() {
  const session = await auth()
  return (
    <header className="border-b border-border bg-bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-brand-primary hover:text-brand-hover transition-colors">
            3D Hub
          </Link>
          <NavbarActions user={session?.user ?? null} />
        </div>
      </div>
    </header>
  )
}
```

**`NavbarActions.tsx` (Client Component — receives user prop):**
```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { buttonVariants } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarActionsProps {
  user: { username: string } | null
}

export function NavbarActions({ user }: NavbarActionsProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // ... desktop nav + mobile drawer with conditional auth display
}
```

The desktop `<nav>` renders:
- If `user`: username text + Log out button calling `signOut({ callbackUrl: '/' })`
- If no `user`: "Log in" link (ghost variant) + "Sign up" link (default variant)

Mobile drawer mirrors desktop auth CTAs.

### Deferred Item: Mobile Menu Escape Key

From deferred-work.md (Story 1.1 code review): "Mobile menu has no focus trap or Escape key handler — address in Story 1.5 when Navbar becomes session-aware."

Add to `NavbarActions`:
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') setMobileOpen(false)
}
// On the mobile drawer container: onKeyDown={handleKeyDown}
```

### lib/auth.ts — Null Guard Fix

From deferred-work.md (Story 1.2 code review): "`token.userId as string` cast without null guard."

In `lib/auth.ts`, the session callback:
```typescript
// Before (unsafe cast):
userId: token.userId as string

// After (null guard):
userId: (token.userId ?? '') as string
```

This is a one-line fix. The `authorize` function always sets `token.userId`, but TypeScript doesn't know this.

### File Locations

| File | Action | Notes |
|------|--------|-------|
| `lib/validations.ts` | MODIFY | Append `loginSchema` + `LoginInput`; keep existing `registrationSchema` intact |
| `app/(auth)/login/page.tsx` | CREATE | `(auth)` route group already exists (`app/(auth)/register/` is there) |
| `components/auth/LoginForm.tsx` | CREATE | Mirrors `RegisterForm.tsx` structure |
| `components/layout/Navbar.tsx` | MODIFY | Remove `'use client'`; make async; call `auth()`; render `<NavbarActions>` |
| `components/layout/NavbarActions.tsx` | CREATE | Extracts all client-side Navbar logic + adds auth-conditional display |
| `lib/auth.ts` | MODIFY | One-line null guard fix (deferred item) |

### What Must NOT Change

- `app/layout.tsx` — Do NOT add `SessionProvider`; import stays `<Navbar />` unchanged
- `app/api/auth/[...nextauth]/route.ts` — No changes
- `middleware.ts` — No changes to protected routes matcher
- `lib/auth.config.ts` — No changes
- `components/auth/RegisterForm.tsx` — No changes
- `lib/db/users.ts` — No changes
- `types/api.ts` — No changes (reuse `AsyncState` as-is)

### AsyncState Usage in LoginForm

```typescript
import type { AsyncState } from '@/types/api'
const [state, setState] = useState<AsyncState>('idle')
const [formError, setFormError] = useState<string | null>(null)
```

Never use `isLoading: boolean`. The `formError` is a separate string state for the "Incorrect email or password" message — it is NOT from React Hook Form's `setError`, because the error is not field-specific (it applies to the combination of email + password).

### Import Boundaries

| Context | signIn / signOut source |
|---------|------------------------|
| Server Component (page.tsx) | `auth` from `@/lib/auth` only |
| Client Component (LoginForm, NavbarActions) | `signIn`, `signOut` from `next-auth/react` |

NEVER import `signIn`/`signOut` from `@/lib/auth` in a `'use client'` component — those are server-only exports.

### Toaster

`sonner` is already installed and `<Toaster>` is mounted in `app/layout.tsx`. No toast needed on login success (no "Welcome back!" toast — that would be awkward for returning users). On login failure, show the inline error only — not a toast.

### Login Page Layout (mirrors Register page exactly)

```tsx
return (
  <main className="flex min-h-screen items-center justify-center px-4">
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Log in to 3D Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back
        </p>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  </main>
)
```

### Previous Story Patterns to Reuse

From Story 1.4 (`RegisterForm.tsx`):
- Same form structure: Label → Input → error paragraph pattern
- Same `handleSubmit(onSubmit)` with `noValidate`
- Same Button disabled state: `disabled={state === 'loading'}`
- Same `'use client'` + React Hook Form + zodResolver pattern
- Same `autoComplete` attributes: `autoComplete="email"` on email field, `autoComplete="current-password"` on password field (not "new-password" like registration)

### Project Structure Notes

- `app/(auth)/` route group already exists — `login/` directory must be created inside it
- `components/auth/` already exists — add `LoginForm.tsx` directly (no subdirectory)
- `components/layout/` already exists — add `NavbarActions.tsx` alongside `Navbar.tsx`
- No new `lib/` files needed — all auth logic flows through existing `lib/auth.ts`

### References

- LoginForm pattern: [Source: `components/auth/RegisterForm.tsx`] (mirror the structure)
- loginSchema placement: [Source: `lib/validations.ts`] (append after registrationSchema)
- `auth()` as sole session accessor: [Source: `_bmad-output/implementation-artifacts/1-3-authentication-infrastructure-route-protection.md`]
- Server/Client split pattern: [Source: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#component-boundaries`]
- `signOut` from `next-auth/react` for client: [Source: `lib/auth.ts`] (counterpart to `signIn` used in RegisterForm)
- `AsyncState` type: [Source: `types/api.ts`]
- Auth page layout: [Source: `app/(auth)/register/page.tsx`] (exact same layout pattern)
- searchParams async access: [Source: Next.js App Router docs — `searchParams` is a Promise in Next.js 15+]
- Deferred Escape key: [Source: `_bmad-output/implementation-artifacts/deferred-work.md`] (Story 1.1 mobile menu)
- Deferred null guard: [Source: `_bmad-output/implementation-artifacts/deferred-work.md`] (Story 1.2 auth.ts)
- `signIn` from `next-auth/react` (client): [Source: `components/auth/RegisterForm.tsx` line 6]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No blockers encountered.

### Completion Notes List

- Added `loginSchema` (password `min(1)`) and `LoginInput` type to `lib/validations.ts`; existing `registrationSchema` unchanged
- Created `components/auth/LoginForm.tsx`: client component using React Hook Form + Zod resolver with `mode: 'onSubmit'`; form-level `formError` state for "Incorrect email or password"; reads `callbackUrl` prop; calls `signIn('credentials', { redirect: false })` from `next-auth/react`; on success `router.push(callbackUrl ?? '/')`; uses `AsyncState` type
- Created `app/(auth)/login/page.tsx`: Server Component; awaits `searchParams` to extract `callbackUrl`; redirects authenticated users to `/`; passes `callbackUrl` to `LoginForm`
- Refactored `components/layout/Navbar.tsx`: removed `'use client'`; converted to `async` Server Component calling `auth()`; passes `session?.user ?? null` to `NavbarActions`; added `relative` class to `<header>` for mobile dropdown positioning
- Created `components/layout/NavbarActions.tsx`: client component receiving `user` prop; conditional desktop auth display (username + "Log out" button vs "Log in" + "Sign up" links); mobile hamburger + absolute-positioned drawer with same conditional display; `signOut({ callbackUrl: '/' })` from `next-auth/react`; Escape key handler on mobile drawer (addresses deferred item from Story 1.1)
- Fixed deferred null guard in `lib/auth.ts`: `user.id` and `token.userId` now use `?? ''` fallback before string cast
- TypeScript: 0 errors; Production build: successful (`/login` route confirmed in build output); ESLint: 0 errors, 0 warnings

### Change Log

- 2026-05-05: Story 1.5 implemented — login page, session-aware Navbar (server/client split), null guard patch

### File List

- `lib/validations.ts` (modified — added loginSchema + LoginInput)
- `components/auth/LoginForm.tsx` (created)
- `app/(auth)/login/page.tsx` (created)
- `components/layout/Navbar.tsx` (modified — server component refactor)
- `components/layout/NavbarActions.tsx` (created)
- `lib/auth.ts` (modified — null guard on userId cast)
