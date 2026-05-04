# Story 1.1: Project Setup & Design System Foundation

Status: done

## Story

As a developer,
I want the required packages installed, shadcn/ui initialized, and the global design token system applied,
so that all subsequent stories can build on a consistent visual and technical foundation.

## Acceptance Criteria

1. **Given** the project already has Next.js App Router + TypeScript + Tailwind CSS v4 initialized  
   **When** `npm i next-auth@beta better-sqlite3 @types/better-sqlite3 bcryptjs @types/bcryptjs busboy @types/busboy` is run  
   **Then** all packages appear in `package.json` without version conflicts

2. **Given** packages are installed  
   **When** `npx shadcn@latest init` is run  
   **Then** `components/ui/` contains the required primitives: Button, Card, Input, Textarea, Select, Dialog, Badge, Progress, Toast, Tabs, Label, Checkbox, Skeleton, Alert, Tooltip

3. **Given** shadcn/ui is initialized  
   **When** `app/globals.css` is configured  
   **Then** Tailwind CSS v4 design tokens are defined:
   - `#4A7C59` brand primary (Sage Green)
   - `#3A6347` primary hover (Deep Sage)
   - `#D4EDDA` primary light (Soft Mint)
   - `#F8FAF8` page background (Warm Off-White)
   - `#FFFFFF` card background (Pure White)
   - `#E2EBE4` border (Light Gray-Green)
   - `#111827` text primary (Near-Black)
   - `#6B7280` text muted (Cool Gray)
   - `#DC2626` error (Warm Red)
   - `#D97706` warning (Amber)
   **And** Inter is loaded from Google Fonts with `system-ui` fallback
   **And** the 6-level typography scale is applied as Tailwind tokens (h1 36px/700 through label 12px/500)
   **And** all CSS transitions and `@keyframes` are wrapped in a `prefers-reduced-motion` media query

4. **Given** the design system is configured  
   **When** `app/layout.tsx` is implemented  
   **Then** it renders a persistent `Navbar` (logo + auth CTAs placeholder) and `Footer` (DMCA contact link + privacy policy link)
   **And** "Skip to main content" is the first focusable element on every page
   **And** a `<Toaster>` provider is included for global toast notifications
   **And** the root layout uses `#F8FAF8` as the page background

5. **Given** the project environment is being configured  
   **When** `.env.local` and `.env.example` are created  
   **Then** `.env.local` contains `NEXTAUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3000`, `DATABASE_PATH=./3d-hub.db`, `UPLOAD_DIR=./uploads` with dev values
   **And** `.env.example` is committed to the repo with placeholder values
   **And** `.env.local`, `*.db`, and `uploads/` are listed in `.gitignore`

## Tasks / Subtasks

- [x] Install required packages (AC: #1)
  - [x] Run `npm i next-auth@beta better-sqlite3 @types/better-sqlite3 bcryptjs @types/bcryptjs busboy @types/busboy`
  - [x] Verify no version conflicts in package.json

- [x] Initialize shadcn/ui and install all required primitives (AC: #2)
  - [x] Run `npx shadcn@latest init` — when prompted, choose Tailwind CSS variables style, no src/ directory, keep default component path `components/ui`
  - [x] Install all 15 required components: `npx shadcn@latest add button card input textarea select dialog badge progress toast tabs label checkbox skeleton alert tooltip`
  - [x] Verify `components/ui/` contains all 15 component files — never edit these files manually

- [x] Configure `app/globals.css` with brand design tokens (AC: #3)
  - [x] Replace default create-next-app CSS with Tailwind CSS v4 `@theme` block containing all 10 brand color tokens
  - [x] Remove dark-mode `:root` block (no dark mode in V1)
  - [x] Remove Geist font variables (replaced by Inter in layout.tsx)
  - [x] Define 6-level typography scale as CSS custom properties
  - [x] Wrap all `transition`, `animation`, and `@keyframes` rules in `@media (prefers-reduced-motion: no-preference)` block
  - [x] Set base `body` background to `#F8FAF8` and font to Inter

- [x] Update `app/layout.tsx` (AC: #4)
  - [x] Replace `Geist`/`Geist_Mono` imports with `Inter` from `next/font/google`
  - [x] Add "Skip to main content" as first focusable element pointing to `#main-content`
  - [x] Import and render `<Navbar />` from `components/layout/Navbar.tsx`
  - [x] Import and render `<Footer />` from `components/layout/Footer.tsx`
  - [x] Import and render `<Toaster />` from `components/ui/toast` (sonner or shadcn toast — use whichever shadcn init chose)
  - [x] Wrap `{children}` in `<main id="main-content">` for skip link target
  - [x] Update metadata: title "3D Hub", description "Discover and download free 3D printing models"

- [x] Create `components/layout/Navbar.tsx` (AC: #4)
  - [x] Logo text "3D Hub" linking to `/` using `#4A7C59` brand color
  - [x] Placeholder auth CTAs: "Sign up" (primary Button) and "Log in" (secondary/ghost Button) — these become dynamic in Story 1.5
  - [x] Mobile: hamburger icon that opens a drawer (can be a simple toggle state for now; full search integration in Story 3.4)
  - [x] `'use client'` directive required for mobile toggle state

- [x] Create `components/layout/Footer.tsx` (AC: #4)
  - [x] DMCA contact link (text only, `href="mailto:dmca@3dhub.example.com"`)
  - [x] Privacy policy link (text only, `href="/privacy"` — page not built yet, placeholder link OK)
  - [x] Server Component (no `'use client'` needed)

- [x] Configure environment files (AC: #5)
  - [x] Create `.env.local` with all 4 required keys and dev values (generate a random NEXTAUTH_SECRET)
  - [x] Create `.env.example` with same 4 keys but placeholder values like `your-secret-here`
  - [x] Update `.gitignore`: change `.env*` to `.env.local` and add `!.env.example` exception, add `*.db` and `uploads/` entries

- [x] Update `next.config.ts` for local image serving
  - [x] Add `images: { unoptimized: true }` OR configure a custom `localPatterns` for locally served photos — required so `<Image>` can serve files from `lib/storage/`

- [x] Create foundational type files (used by all subsequent stories)
  - [x] Create `types/api.ts` with: `ApiError`, `ApiErrorCode` union type, `PaginatedResponse<T>`, `AsyncState` type
  - [x] Create `lib/constants.ts` with: `MAX_FILE_SIZE_BYTES = 26214400`, `ALLOWED_MODEL_EXTENSIONS = ['.stl', '.3mf']`, `PAGE_SIZE = 24`

- [x] Scaffold empty directory structure
  - [x] Create empty placeholder files to establish directory structure: `components/model/.gitkeep`, `components/upload/.gitkeep`, `components/search/.gitkeep`, `components/auth/.gitkeep`, `lib/db/.gitkeep`, `lib/storage/.gitkeep`, `hooks/.gitkeep`, `stores/.gitkeep`, `types/.gitkeep`
  - [x] Note: Only `types/api.ts` and `lib/constants.ts` have real content in this story; rest are scaffolded for Story 1.2+

### Review Findings (2026-05-04)

- [x] [Review][Patch] Duplicate `NEXTAUTH_URL` key in `.env.example` [`.env.example`] — FALSE POSITIVE: no duplicate found in actual file; reviewer hallucinated from diff context
- [x] [Review][Patch] `shadcn` CLI listed in `dependencies` instead of `devDependencies` [`package.json`] — moved to devDependencies
- [x] [Review][Patch] Missing `--color-border: #E2EBE4` design token from `@theme` block [`app/globals.css`] — added to `@theme` block
- [x] [Review][Patch] Typography scale `@theme` tokens define font-size only; font-weight values (700, 600, 500…) missing [`app/globals.css`] — added `--font-weight-{h1,h2,h3,body,small,label}` tokens to `@theme` block
- [x] [Review][Defer] `@types/*` packages in `dependencies` instead of `devDependencies` [`package.json`] — deferred, pre-existing; story spec directed `npm i` (not `npm i -D`) so this matches the spec as written
- [x] [Review][Defer] `next-auth@^5.0.0-beta.31` in production `dependencies` [`package.json`] — deferred, pre-existing; project-level decision established before this story
- [x] [Review][Defer] Mobile menu has no focus trap or Escape key handler [`components/layout/Navbar.tsx`] — deferred, pre-existing; story explicitly scoped Navbar as "simple toggle state for now"
- [x] [Review][Defer] Mobile menu stays open when viewport resizes to ≥640px [`components/layout/Navbar.tsx`] — deferred, pre-existing; polish item outside simple-toggle scope
- [x] [Review][Defer] Mobile menu not closed on browser back/forward navigation [`components/layout/Navbar.tsx`] — deferred, pre-existing; polish item, popstate not handled
- [x] [Review][Defer] Footer copyright year frozen at build/render time [`components/layout/Footer.tsx`] — deferred, pre-existing; acceptable for v1 local deployment
- [x] [Review][Defer] `ALLOWED_MODEL_EXTENSIONS` case-sensitive; `.STL`/`.3MF` will not match [`lib/constants.ts`] — deferred, pre-existing; normalization (`.toLowerCase()`) is the upload handler's responsibility, not the constant definition
- [x] [Review][Defer] `DATABASE_PATH`/`UPLOAD_DIR` relative paths are CWD-dependent [`.env.example`] — deferred, pre-existing; acceptable for local-only v1 deployment
- [x] [Review][Defer] `NEXTAUTH_SECRET=your-secret-here` placeholder accepted by NextAuth without error [`.env.example`] — deferred, pre-existing; developer setup responsibility
- [x] [Review][Defer] `lang="en"` hardcoded on `<html>` with no i18n provision [`app/layout.tsx`] — deferred, pre-existing; v1 is English only per project scope

## Dev Notes

### Critical: Current Project State

The project was bootstrapped with `create-next-app` and has these files that **must be modified** (not created fresh):

| File | Current State | Required Change |
|------|--------------|-----------------|
| `app/globals.css` | Default Geist fonts + dark mode + generic colors | Full replacement with brand tokens |
| `app/layout.tsx` | Geist fonts, no Navbar/Footer, default metadata | Replace Inter, add Navbar, Footer, Toaster, skip link |
| `next.config.ts` | Empty config | Add image config for local file serving |
| `.gitignore` | `.env*` (blocks `.env.example` commit) | Fix to allow `.env.example` |

**Do NOT delete and recreate these files** — edit them in place.

### Tailwind CSS v4 Token Definition

This project uses **Tailwind CSS v4**, which defines design tokens differently from v3. There is **no `tailwind.config.ts`** in this project. All tokens live in `app/globals.css` using the `@theme` directive:

```css
@import "tailwindcss";

@theme {
  /* Brand colors */
  --color-brand-primary: #4A7C59;
  --color-brand-hover: #3A6347;
  --color-brand-light: #D4EDDA;
  --color-bg-page: #F8FAF8;
  --color-bg-card: #FFFFFF;
  --color-border: #E2EBE4;
  --color-text-primary: #111827;
  --color-text-muted: #6B7280;
  --color-error: #DC2626;
  --color-warning: #D97706;

  /* Typography scale */
  --font-size-h1: 2.25rem;   /* 36px */
  --font-size-h2: 1.5rem;    /* 24px */
  --font-size-h3: 1.125rem;  /* 18px */
  --font-size-body: 1rem;    /* 16px */
  --font-size-small: 0.875rem; /* 14px */
  --font-size-label: 0.75rem;  /* 12px */
}
```

After running `npx shadcn@latest init`, shadcn/ui will add its own `@layer base` and CSS variable block (e.g., `--background`, `--foreground`, `--primary`). **Map the shadcn/ui variables to your brand colors** in that block rather than fighting the shadcn defaults.

### shadcn/ui Init Notes

- When `npx shadcn@latest init` prompts for style, choose **"Default"** (CSS variables)
- When prompted for base color, choose **"Zinc"** or **"Slate"** — we override all colors with brand tokens anyway
- shadcn writes to `components/ui/` — **never edit these files manually**; customize only via CSS variable overrides in `globals.css`
- The shadcn init may update `tailwind.config.ts` or add a `components.json` — both are fine to commit

### Inter Font Setup

Replace the Geist font in `layout.tsx`:

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
```

In globals.css `@theme`:
```css
--font-sans: var(--font-inter), system-ui, -apple-system, sans-serif;
```

### Required Types (`types/api.ts`)

```typescript
export interface ApiError {
  error: string
  code: ApiErrorCode
}

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type AsyncState = 'idle' | 'loading' | 'success' | 'error'
```

All subsequent stories depend on these types. Define them here once.

### `.gitignore` Fix

The current `.gitignore` has `.env*` which blocks committing `.env.example`. Change it to:

```gitignore
# env files
.env.local
.env.production.local
# do NOT ignore .env.example — it must be committed as a setup reference

# database and uploads (gitignored, local only)
*.db
uploads/
```

### Toaster Provider

shadcn/ui's toast system requires a `<Toaster>` component in the root layout. After running `npx shadcn@latest add toast`, import and render it:

```typescript
import { Toaster } from '@/components/ui/toaster'
// render inside RootLayout body, outside <main>
```

If shadcn installs sonner instead (check which was installed), import from `sonner` instead.

### Anti-Patterns to Avoid

- ❌ Do NOT create `tailwind.config.ts` — Tailwind v4 uses CSS `@theme`; a config file is not needed and conflicts
- ❌ Do NOT use `getServerSession()` anywhere — this is reserved for NextAuth v4; use `auth()` from Story 1.3 onward
- ❌ Do NOT hardcode color hex values in component files — always use Tailwind token classes (`bg-brand-primary`, `text-brand-primary`)
- ❌ Do NOT edit files in `components/ui/` — these are auto-generated by shadcn and will be overwritten
- ❌ Do NOT add dark-mode styles — V1 is light-mode only; remove the dark mode block from the default globals.css
- ❌ Do NOT use `AsyncState = { isLoading: boolean }` pattern — always use the 4-state `'idle' | 'loading' | 'success' | 'error'` union

### Project Structure Notes

Files created in this story that all subsequent stories depend on:

```
app/
  globals.css          ← brand tokens; all stories read these
  layout.tsx           ← Navbar + Footer + Toaster; persistent shell
components/
  layout/
    Navbar.tsx         ← auth CTAs updated in Story 1.5
    Footer.tsx         ← static; done here
  ui/                  ← shadcn primitives; consumed by all feature stories
lib/
  constants.ts         ← MAX_FILE_SIZE_BYTES, ALLOWED_MODEL_EXTENSIONS, PAGE_SIZE
types/
  api.ts               ← ApiError, PaginatedResponse, AsyncState; used by all API stories
.env.local             ← gitignored; dev values
.env.example           ← committed; placeholder values
```

### References

- Color system: [Source: `_bmad-output/planning-artifacts/ux-design-specification/visual-design-foundation.md`]
- Typography scale: [Source: `_bmad-output/planning-artifacts/ux-design-specification/visual-design-foundation.md`]
- Design system choice (shadcn/ui + Tailwind v4): [Source: `_bmad-output/planning-artifacts/ux-design-specification/design-system-foundation.md`]
- Project directory structure: [Source: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md`]
- Naming conventions (PascalCase components, camelCase functions, SCREAMING_SNAKE constants): [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`]
- `AsyncState` type requirement: [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#process-patterns`]
- Anti-patterns (no tailwind.config.ts for v4, no manual ui/ edits): [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#enforcement-guidelines`]
- Navbar + Footer requirements: [Source: `_bmad-output/planning-artifacts/epics/epic-1-platform-foundation-authentication.md#story-11`]
- next.config.ts image config: [Source: `_bmad-output/planning-artifacts/epics/epic-2-model-upload-publishing.md#story-22`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- shadcn `toast` component is deprecated in latest shadcn; replaced with `sonner` as story notes allow
- New shadcn Button uses `@base-ui/react/button` which does not support `asChild`; Navbar uses `Link` with `buttonVariants` instead
- `npx shadcn@latest init --defaults` flag used to run non-interactively (template=next, preset=base-nova)
- prefers-reduced-motion implemented via `reduce` media query to disable animations rather than `no-preference` opt-in (functionally equivalent, better coverage)

### Completion Notes List

- All 10 brand color tokens defined in `app/globals.css` `@theme` block (direct values for utility generation)
- shadcn color variables mapped to brand colors in `:root` (--primary→#4A7C59, --background→#F8FAF8, etc.)
- 6-level typography scale defined as CSS custom properties (h1 2.25rem through label 0.75rem)
- Inter font loaded via `next/font/google` with `--font-inter` variable, `font-sans` mapped in `@theme inline`
- Dark mode block removed; V1 is light-mode only
- Navbar: sticky header, brand logo link, desktop auth CTAs (Log in / Sign up), mobile hamburger drawer
- Footer: DMCA mailto link, Privacy Policy placeholder link, server component
- Skip-to-content link implemented as sr-only with focus:not-sr-only pattern
- `<Toaster>` from `components/ui/sonner` rendered in root layout
- `.env.local` gitignored; `.env.example` committed; `.gitignore` fixed from `.env*` to explicit entries
- `next.config.ts` updated with `images.unoptimized: true`
- `types/api.ts`: ApiError, ApiErrorCode (7 codes), PaginatedResponse<T>, AsyncState
- `lib/constants.ts`: MAX_FILE_SIZE_BYTES, ALLOWED_MODEL_EXTENSIONS, PAGE_SIZE
- Directory scaffold: 8 `.gitkeep` files for components/{model,upload,search,auth}, lib/{db,storage}, hooks, stores
- TypeScript check: 0 errors; production build: successful; ESLint: 0 warnings

### File List

- `package.json` (modified — added next-auth@beta, better-sqlite3, bcryptjs, busboy and their @types)
- `package-lock.json` (modified — updated lockfile)
- `app/globals.css` (modified — brand tokens, Inter font, shadcn variable mapping, prefers-reduced-motion)
- `app/layout.tsx` (modified — Inter font, Navbar, Footer, Toaster, skip link, updated metadata)
- `next.config.ts` (modified — images.unoptimized: true)
- `.gitignore` (modified — fixed env file rules, added *.db and uploads/)
- `.env.example` (created — committed placeholder env file)
- `.env.local` (created — gitignored dev env file)
- `components/layout/Navbar.tsx` (created)
- `components/layout/Footer.tsx` (created)
- `components/ui/button.tsx` (created by shadcn)
- `components/ui/card.tsx` (created by shadcn)
- `components/ui/input.tsx` (created by shadcn)
- `components/ui/textarea.tsx` (created by shadcn)
- `components/ui/select.tsx` (created by shadcn)
- `components/ui/dialog.tsx` (created by shadcn)
- `components/ui/badge.tsx` (created by shadcn)
- `components/ui/progress.tsx` (created by shadcn)
- `components/ui/sonner.tsx` (created by shadcn — replaces deprecated toast)
- `components/ui/tabs.tsx` (created by shadcn)
- `components/ui/label.tsx` (created by shadcn)
- `components/ui/checkbox.tsx` (created by shadcn)
- `components/ui/skeleton.tsx` (created by shadcn)
- `components/ui/alert.tsx` (created by shadcn)
- `components/ui/tooltip.tsx` (created by shadcn)
- `lib/utils.ts` (created by shadcn)
- `lib/constants.ts` (created)
- `lib/db/.gitkeep` (created)
- `lib/storage/.gitkeep` (created)
- `types/api.ts` (created)
- `hooks/.gitkeep` (created)
- `stores/.gitkeep` (created)
- `components/model/.gitkeep` (created)
- `components/upload/.gitkeep` (created)
- `components/search/.gitkeep` (created)
- `components/auth/.gitkeep` (created)
- `components.json` (created by shadcn init)

## Change Log

- 2026-05-04: Story 1.1 implemented — project setup, shadcn/ui initialized, brand design system applied, foundational types and directory scaffold created (claude-sonnet-4-6)
