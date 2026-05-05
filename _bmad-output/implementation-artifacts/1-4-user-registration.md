# Story 1.4: User Registration

Status: done

## Story

As a visitor,
I want to create an account with my email and password,
so that I can access platform features that require authentication.

## Acceptance Criteria

1. **Given** I am unauthenticated and visit `/register`
   **When** the page loads
   **Then** a form renders with visible `<Label>` elements above the Email and Password fields (not placeholder-only)
   **And** a "Create account" button and a "Already have an account? Log in" link are visible

2. **Given** I submit valid credentials (valid email format, password ≥ 8 characters)
   **When** `POST /api/auth/register` processes the request
   **Then** my password is hashed with `bcryptjs` before storage — the plain-text password never touches the database
   **And** a new row is inserted into `users`
   **And** I am automatically signed in via NextAuth and redirected to the homepage
   **And** a success toast appears: "Welcome to 3D Hub!"

3. **Given** I submit an email that is already registered
   **When** the API responds
   **Then** a `409` response is returned with `{ "error": "Email already in use", "code": "VALIDATION_ERROR" }`
   **And** a field-level error appears below the Email field
   **And** a "Log in instead" link is shown

4. **Given** I submit with a missing or invalid field
   **When** client-side form validation runs on submit (not on blur)
   **Then** specific inline errors appear below each offending field
   **And** no API request is made until all fields are valid

5. **Given** I am already authenticated and visit `/register`
   **When** the page loads
   **Then** I am redirected to the homepage

## Tasks / Subtasks

- [x] Install missing form dependencies (AC: #2, #4)
  - [x] Run `npm i react-hook-form @hookform/resolvers zod`
  - [x] Verify packages appear in `package.json`

- [x] Create `lib/validations.ts` — shared Zod schemas (AC: #2, #4)
  - [x] Export `registrationSchema`: `z.object({ email: z.string().email('Invalid email address'), password: z.string().min(8, 'Password must be at least 8 characters') })`
  - [x] Export `RegistrationInput` type: `z.infer<typeof registrationSchema>`

- [x] Create `app/api/auth/register/route.ts` — POST handler (AC: #2, #3)
  - [x] Parse body with `req.json()`
  - [x] Validate with `registrationSchema.safeParse(body)`; on failure return 400 `{ error: "Invalid input", code: "VALIDATION_ERROR" }`
  - [x] Call `getUserByEmail(email)` (sync — no `await`); if result is non-null, return 409 `{ error: "Email already in use", code: "VALIDATION_ERROR" }`
  - [x] Derive username from email local part (see Dev Notes); check availability via `getUserByUsername` (sync); append 4-digit suffix on collision
  - [x] Hash password: `const passwordHash = await bcrypt.hash(password, 12)`
  - [x] Call `createUser(email, username, passwordHash)` (sync)
  - [x] Return `NextResponse.json({ success: true }, { status: 201 })`
  - [x] Wrap in try/catch; `console.error` every caught error; return 500 `{ error: "Registration failed", code: "INTERNAL_ERROR" }`

- [x] Create `components/auth/RegisterForm.tsx` — client form component (AC: #1, #2, #3, #4)
  - [x] Add `'use client'` directive
  - [x] Import `useForm` from `react-hook-form`, `zodResolver` from `@hookform/resolvers/zod`
  - [x] Import `signIn` from `next-auth/react`, `useRouter` from `next/navigation`, `toast` from `sonner`
  - [x] Import `Link` from `next/link`, `Button`, `Input`, `Label` from `@/components/ui/...`
  - [x] Configure form: `useForm<RegistrationInput>({ resolver: zodResolver(registrationSchema), mode: 'onSubmit' })`
  - [x] Track `AsyncState` with `useState<AsyncState>('idle')`; track `showLoginLink` with `useState(false)`
  - [x] Render `<Label>` above each `<Input>` (not placeholder-only); wire via `{...register('email')}` / `{...register('password')}`
  - [x] Show field errors from `formState.errors` below each input: `<p className="text-sm text-destructive">`
  - [x] On submit: set state `'loading'`; POST to `/api/auth/register`
  - [x] On 409: `setError('email', { message: 'Email already in use' })`; set `showLoginLink(true)`; set state `'error'`
  - [x] On 201: `await signIn('credentials', { email, password, redirect: false })`; then `toast.success('Welcome to 3D Hub!')`; `router.push('/')`
  - [x] On other errors: `toast.error('Registration failed. Please try again.')`; set state `'error'`
  - [x] Disable "Create account" button while `state === 'loading'`
  - [x] Render always-visible "Already have an account? Log in" link → `/login`
  - [x] Render "Log in instead" link → `/login` only when `showLoginLink === true`

- [x] Create `app/(auth)/register/page.tsx` — register page (AC: #1, #5)
  - [x] Server Component (no `'use client'`)
  - [x] `import { auth } from '@/lib/auth'` and `import { redirect } from 'next/navigation'`
  - [x] Call `const session = await auth()`; if session exists, call `redirect('/')`
  - [x] Render `<RegisterForm />` in a centered layout with an accessible `<h1>` heading

- [x] Verify (all AC)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors, 0 warnings (`npm run lint`)
  - [ ] Manual: register new user → auto signed in → homepage with "Welcome to 3D Hub!" toast
  - [ ] Manual: duplicate email → 409 → field error + "Log in instead" link visible
  - [ ] Manual: empty/invalid fields → no API call → inline errors appear
  - [ ] Manual: authenticated user visits `/register` → redirected to `/`

### Review Findings

- [x] [Review][Patch] Malformed/non-JSON request body returns 500 instead of 400 [`app/api/auth/register/route.ts`]
- [x] [Review][Patch] `state` not reset after `signIn` call — stays `'loading'` during navigation on both success and error paths [`components/auth/RegisterForm.tsx`]
- [x] [Review][Defer] No rate limiting on registration endpoint — endpoint is abusable for email enumeration and bcrypt CPU exhaustion — deferred, pre-existing concern out of scope for this story
- [x] [Review][Defer] Check-then-insert race condition for email/username — SQLite UNIQUE constraint is the actual guard; story explicitly accepts this as an edge case

## Dev Notes

### Dependency Gap — Install First

**`react-hook-form`, `@hookform/resolvers`, and `zod` are NOT in `package.json`** — they must be installed as the first task:

```bash
npm i react-hook-form @hookform/resolvers zod
```

Architecture specifies React Hook Form v7.x for all platform forms. `lib/validations.ts` will hold Zod schemas reused across all future stories (upload wizard metadata, login, etc.).

### Username Auto-Generation

`users` table has `username TEXT UNIQUE NOT NULL` (Story 1.2). The form has only email + password (per FR1 and story ACs). Derive username automatically in the Route Handler:

```typescript
function deriveUsername(email: string): string {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase()
  return base || 'user'
}
```

Collision handling in the Route Handler:
```typescript
let username = deriveUsername(email)
if (getUserByUsername(username)) {
  username = `${username}${Math.floor(1000 + Math.random() * 9000)}`
  // If still taken (extremely rare), the createUser INSERT will throw;
  // catch it and return 500 — acceptable edge case
}
```

Both `getUserByEmail` and `getUserByUsername` are **synchronous** (better-sqlite3). **Never `await` them.**

### Auto-Login After Registration

The Route Handler creates the user and returns 201. The **client** then calls `signIn` with `redirect: false` to get control back for the toast:

```typescript
// RegisterForm.tsx — onSubmit handler (after 201 response)
const result = await signIn('credentials', {
  email,
  password,
  redirect: false,  // CRITICAL: do not use redirect: true — no chance to show toast
})
if (result?.error) {
  // Created but sign-in failed (edge case)
  toast.error('Account created. Please log in.')
  router.push('/login')
} else {
  toast.success('Welcome to 3D Hub!')
  router.push('/')
}
```

`signIn` is imported from `next-auth/react` (client-side). Do NOT import from `@/lib/auth` in a Client Component.

### Toaster

Project uses `sonner` (installed, `<Toaster>` already mounted in `app/layout.tsx`):

```typescript
import { toast } from 'sonner'
toast.success('Welcome to 3D Hub!')
```

Do NOT import from `@/components/ui/toast` (old shadcn pattern, not used in this project).

### Route Group Path

Registration page lives in the `(auth)` route group (does not exist yet — must create directory):

| Filesystem path | URL |
|---|---|
| `app/(auth)/register/page.tsx` | `/register` |
| `app/(auth)/login/page.tsx` | `/login` (Story 1.5) |

The `(auth)` segment is invisible in URLs.

### Server-Side Auth Redirect (AC #5)

```typescript
// app/(auth)/register/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default async function RegisterPage() {
  const session = await auth()
  if (session) redirect('/')
  // ...render form
}
```

Use `auth()` from `@/lib/auth` — **never** `getServerSession()` (NextAuth v4 API; throws in v5).

### React Hook Form Configuration

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
  setError,
} = useForm<RegistrationInput>({
  resolver: zodResolver(registrationSchema),
  mode: 'onSubmit',  // architecture mandates onSubmit, not onChange/onBlur
})
```

Field error display:
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" {...register('email')} />
  {errors.email && (
    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
  )}
</div>
```

### API Route Location

`app/api/auth/register/route.ts` is a **separate** custom Route Handler — it is NOT part of the NextAuth `[...nextauth]` catch-all at `app/api/auth/[...nextauth]/route.ts`. Both can coexist: Next.js resolves the static segment `register` before the dynamic catch-all.

### AsyncState During Submission

Use the project's `AsyncState` type from `types/api.ts`:
```typescript
import type { AsyncState } from '@/types/api'
const [state, setState] = useState<AsyncState>('idle')
```
Disable the submit button and show loading indicator while `state === 'loading'`. Never use bare `isLoading: boolean`.

### Error Response Standard

All Route Handler errors must use:
```json
{ "error": "Human-readable message", "code": "MACHINE_READABLE_CODE" }
```
| Scenario | HTTP | code |
|---|---|---|
| Validation failure (Zod) | 400 | `VALIDATION_ERROR` |
| Email already registered | 409 | `VALIDATION_ERROR` |
| Unexpected server error | 500 | `INTERNAL_ERROR` |

Log every error before returning: `console.error('[POST /api/auth/register]', error)`

### "Log In Instead" Link (AC #3)

Show only when the API returned 409:
```tsx
const [showLoginLink, setShowLoginLink] = useState(false)
// On 409:
setError('email', { message: 'Email already in use' })
setShowLoginLink(true)
// In JSX:
{showLoginLink && (
  <p className="text-sm mt-1">
    <Link href="/login" className="text-brand-primary hover:underline">
      Log in instead
    </Link>
  </p>
)}
```

### bcryptjs Salt Rounds

```typescript
import bcrypt from 'bcryptjs'
const passwordHash = await bcrypt.hash(password, 12)
```

Use async `hash()` with 12 rounds — the Route Handler is already async, no reason to use blocking `hashSync`.

### Navbar — Do NOT Modify

`components/layout/Navbar.tsx` still shows static "Log in" / "Sign up" links. Story 1.5 makes the Navbar session-aware. **Leave Navbar unchanged in this story.**

### `lib/validations.ts` Structure

This file will grow across all future stories. Start with only what this story needs:

```typescript
import { z } from 'zod'

export const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type RegistrationInput = z.infer<typeof registrationSchema>
```

Do not pre-create schemas for future stories — add them when needed.

### Files Overview

| File | Action | Notes |
|------|--------|-------|
| `lib/validations.ts` | CREATE | First Zod schema file; `registrationSchema` + `RegistrationInput` |
| `app/api/auth/register/route.ts` | CREATE | POST: validate → dedup → hash → createUser → 201 |
| `components/auth/RegisterForm.tsx` | CREATE | `'use client'`; React Hook Form; email + password; signIn on 201 |
| `app/(auth)/register/page.tsx` | CREATE | Server Component; auth() check → redirect; renders RegisterForm |

### Project Structure Notes

- `app/(auth)/` directory does not exist yet — create it
- `components/auth/` directory exists (has `.gitkeep`) — add `RegisterForm.tsx` directly
- `lib/validations.ts` does not exist yet — create it
- `app/api/auth/register/` is separate from `app/api/auth/[...nextauth]/` — these coexist without conflict

### References

- React Hook Form + Zod resolver pattern: [Source: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#frontend-architecture`]
- Form validation mode `onSubmit`: [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#communication-patterns`]
- Error response shape `{ error, code }`: [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#format-patterns`]
- `ApiErrorCode` and `AsyncState` types: [Source: `types/api.ts`]
- `auth()` as sole session accessor (never `getServerSession`): [Source: `_bmad-output/implementation-artifacts/1-3-authentication-infrastructure-route-protection.md#anti-patterns-to-avoid`]
- `getUserByEmail` is synchronous — no await: [Source: `_bmad-output/implementation-artifacts/1-3-authentication-infrastructure-route-protection.md#critical-details`]
- Route group `(auth)` path: [Source: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#complete-project-directory-structure`]
- Toaster is `sonner` (mounted in root layout): [Source: `app/layout.tsx`]
- `signIn` exported from `@/lib/auth` (server) / `next-auth/react` (client): [Source: `lib/auth.ts`]
- `username` DB constraint requires unique non-null value: [Source: `lib/db/users.ts`]
- FR1 — email + password registration only: [Source: `_bmad-output/planning-artifacts/prd/functional-requirements.md#user-account-management`]
- Navbar unchanged until Story 1.5: [Source: `_bmad-output/implementation-artifacts/1-3-authentication-infrastructure-route-protection.md#what-stays-unchanged`]
- `components/auth/` component location: [Source: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#complete-project-directory-structure`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No blockers encountered.

### Completion Notes List

- Installed `react-hook-form@^7.75.0`, `@hookform/resolvers@^5.2.2`, `zod@^4.4.3` — all confirmed in `package.json`
- Created `lib/validations.ts` with `registrationSchema` and `RegistrationInput` type
- Created `app/api/auth/register/route.ts`: validates input via Zod, deduplicates email (sync), auto-generates username from email local part with collision suffix, hashes password with bcrypt (12 rounds), inserts user, returns 201
- Created `components/auth/RegisterForm.tsx`: client component using React Hook Form + Zod resolver with `mode: 'onSubmit'`; handles 409 with field-level error + "Log in instead" link; calls `signIn('credentials', { redirect: false })` on 201 then shows toast and navigates to homepage; uses `AsyncState` type for loading state
- Created `app/(auth)/register/page.tsx`: server component that calls `auth()` and redirects authenticated users to `/`; renders `RegisterForm` in centered layout with `<h1>`
- TypeScript: 0 errors; Production build: successful; ESLint: 0 errors
- Both `/api/auth/register` and `/register` routes confirmed in build output

### Change Log

- 2026-05-05: Story 1.4 implemented — user registration flow (packages, validation schema, API route, form component, register page)

### File List

- `package.json` (modified — added react-hook-form, @hookform/resolvers, zod)
- `package-lock.json` (modified — lockfile updated)
- `lib/validations.ts` (created)
- `app/api/auth/register/route.ts` (created)
- `components/auth/RegisterForm.tsx` (created)
- `app/(auth)/register/page.tsx` (created)
