# Epic 1: Platform Foundation & Authentication

Users can register, log in, log out, and maintain a session. The platform has its design system, navigation, and base layout in place.

## Story 1.1: Project Setup & Design System Foundation

As a developer,
I want the required packages installed, shadcn/ui initialized, and the global design token system applied,
So that all subsequent stories can build on a consistent visual and technical foundation.

**Acceptance Criteria:**

**Given** the project already has Next.js App Router + TypeScript + Tailwind CSS v4 initialized
**When** `npm i next-auth@beta better-sqlite3 @types/better-sqlite3 bcryptjs @types/bcryptjs busboy @types/busboy` is run
**Then** all packages appear in `package.json` without version conflicts

**Given** packages are installed
**When** `npx shadcn@latest init` is run
**Then** `components/ui/` contains the required primitives: Button, Card, Input, Textarea, Select, Dialog, Badge, Progress, Toast, Tabs, Label, Checkbox, Skeleton, Alert, Tooltip

**Given** shadcn/ui is initialized
**When** `app/globals.css` is configured
**Then** Tailwind CSS v4 design tokens are defined: `#4A7C59` brand primary, `#3A6347` hover, `#D4EDDA` light, `#F8FAF8` page background, `#FFFFFF` card background, `#E2EBE4` border, `#111827` text primary, `#6B7280` text muted, `#DC2626` error, `#D97706` warning
**And** Inter is loaded from Google Fonts with `system-ui` fallback
**And** the 6-level typography scale is applied as Tailwind tokens (h1 36px/700 through label 12px/500)
**And** all CSS transitions and `@keyframes` are wrapped in a `prefers-reduced-motion` media query

**Given** the design system is configured
**When** `app/layout.tsx` is implemented
**Then** it renders a persistent `Navbar` (logo + auth CTAs placeholder) and `Footer` (DMCA contact link + privacy policy link)
**And** "Skip to main content" is the first focusable element on every page
**And** a `<Toaster>` provider is included for global toast notifications
**And** the root layout uses `#F8FAF8` as the page background

**Given** the project environment is being configured
**When** `.env.local` and `.env.example` are created
**Then** `.env.local` contains `NEXTAUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3000`, `DATABASE_PATH=./3d-hub.db`, `UPLOAD_DIR=./uploads` with dev values
**And** `.env.example` is committed to the repo with placeholder values
**And** `.env.local`, `*.db`, and `uploads/` are listed in `.gitignore`

---

## Story 1.2: Database Schema & User Data Layer

As a developer,
I want the database schema initialized with a `users` table and a typed repository layer,
So that user accounts can be stored and retrieved by the authentication stories that follow.

**Acceptance Criteria:**

**Given** `DATABASE_PATH` is set in `.env.local`
**When** the Next.js application starts for the first time
**Then** `lib/db/index.ts` creates a `better-sqlite3` connection singleton and executes `lib/db/schema.sql`

**Given** `lib/db/schema.sql` is executed
**When** the schema runs
**Then** a `users` table exists with columns: `id TEXT PRIMARY KEY`, `email TEXT UNIQUE NOT NULL`, `username TEXT UNIQUE NOT NULL`, `password_hash TEXT NOT NULL`, `created_at INTEGER NOT NULL`
**And** indexes `idx_users_email` and `idx_users_username` exist

**Given** the schema is initialized
**When** `lib/db/users.ts` is implemented
**Then** it exports `createUser(email, username, passwordHash): User`, `getUserByEmail(email): User | null`, `getUserByUsername(username): User | null`
**And** all functions accept and return camelCase TypeScript objects — not raw DB row snake_case
**And** `types/user.ts` defines `User`, `PublicUser` (no `passwordHash`), and `SessionUser` (userId, email, username) types

**Given** a row exists in the `users` table
**When** `getUserByEmail` or `getUserByUsername` is called
**Then** the returned object converts `created_at` Unix timestamp to an ISO 8601 `createdAt` string
**And** `passwordHash` is excluded from `PublicUser` and `SessionUser` — never returned in API responses

---

## Story 1.3: Authentication Infrastructure & Route Protection

As the application,
I want NextAuth.js v5 configured with a credentials provider and middleware protecting all auth-required routes,
So that sessions are created securely on login and unauthorized access to protected pages is blocked.

**Acceptance Criteria:**

**Given** `lib/auth.ts` is created with NextAuth v5 config
**When** a user submits valid credentials
**Then** NextAuth creates a JWT session containing only `userId`, `email`, `username` — no sensitive fields
**And** the session cookie is `httpOnly`, `secure` in production, and `sameSite: lax`
**And** no auth tokens are written to `localStorage` or `sessionStorage`

**Given** `middleware.ts` is configured with a matcher
**When** an unauthenticated request targets `/upload`, `/api/upload/*`, `/api/download/*`, or `/api/bookmarks/*`
**Then** the request is redirected to `/login`
**And** authenticated requests to these paths proceed without interruption

**Given** the NextAuth route handler at `app/api/auth/[...nextauth]/route.ts` is in place
**When** any NextAuth endpoint is called (GET or POST)
**Then** it responds correctly following NextAuth v5 App Router conventions
**And** `auth()` is used everywhere sessions are needed — `getServerSession()` is never used

---

## Story 1.4: User Registration

As a visitor,
I want to create an account with my email and password,
So that I can access platform features that require authentication.

**Acceptance Criteria:**

**Given** I am unauthenticated and visit `/register`
**When** the page loads
**Then** a form renders with visible `<Label>` elements above the Email and Password fields (not placeholder-only)
**And** a "Create account" button and a "Already have an account? Log in" link are visible

**Given** I submit valid credentials (valid email format, password ≥ 8 characters)
**When** `POST /api/auth/register` processes the request
**Then** my password is hashed with `bcryptjs` before storage — the plain-text password never touches the database
**And** a new row is inserted into `users`
**And** I am automatically signed in via NextAuth and redirected to the homepage
**And** a success toast appears: "Welcome to 3D Hub!"

**Given** I submit an email that is already registered
**When** the API responds
**Then** a `409` response is returned with `{ "error": "Email already in use", "code": "VALIDATION_ERROR" }`
**And** a field-level error appears below the Email field
**And** a "Log in instead" link is shown

**Given** I submit with a missing or invalid field
**When** client-side form validation runs on submit (not on blur)
**Then** specific inline errors appear below each offending field
**And** no API request is made until all fields are valid

**Given** I am already authenticated and visit `/register`
**When** the page loads
**Then** I am redirected to the homepage

---

## Story 1.5: User Login & Session Persistence

As a registered user,
I want to log in with my email and password and remain recognized across page navigation,
So that I don't need to re-authenticate on every page visit.

**Acceptance Criteria:**

**Given** I am unauthenticated and visit `/login`
**When** the page loads
**Then** a form renders with visible labels for Email and Password
**And** a "Log in" button and a "Create account" link are visible

**Given** I submit valid credentials
**When** NextAuth processes sign-in
**Then** a session cookie is set and I am redirected to the homepage (or the page I came from)
**And** the Navbar updates to show my username and a "Log out" option instead of "Sign up" / "Log in"

**Given** I am authenticated and navigate between multiple pages
**When** each Server Component reads the session via `auth()`
**Then** I remain recognized without re-prompting for credentials

**Given** I click "Log out"
**When** `signOut()` is called
**Then** my session cookie is cleared and I am redirected to the homepage
**And** the Navbar reverts to unauthenticated state

**Given** I submit incorrect credentials
**When** NextAuth rejects them
**Then** an inline error appears: "Incorrect email or password"
**And** no session is created

---
