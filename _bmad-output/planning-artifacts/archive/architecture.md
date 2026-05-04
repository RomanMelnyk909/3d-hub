---
stepsCompleted: ["step-01-init", "step-02-context", "step-03-starter", "step-04-decisions", "step-05-patterns", "step-06-structure", "step-07-validation", "step-08-complete"]
lastStep: 8
status: 'complete'
completedAt: '2026-05-04'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/product-brief-3d-hub.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-03.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-05-03-1200.md"
workflowType: 'architecture'
project_name: '3d-hub'
user_name: 'Romko'
date: '2026-05-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements: 42 FRs across 8 capability areas**

| Area | FRs | Architectural Weight |
|------|-----|----------------------|
| User Account Management | FR1–FR4 | Auth layer, session management |
| Model Upload & Publishing | FR5–FR15 | File pipeline, wizard, storage, validation |
| Model Discovery & Search | FR16–FR22 | SSR pages, search API, URL state, filters |
| Model Consumption | FR23–FR26 | Model page SSR, download handler, auth gate |
| Creator Portfolio & Profile | FR27–FR29 | Public profile SSR, private library CSR |
| Platform Safety & Trust | FR30–FR34 | Server-side validation, password hashing, DMCA page |
| Content Presentation & SEO | FR35–FR39 | Metadata generation, sitemap, responsive layout |
| Bookmarks & Collections | FR41–FR42 | Bookmark API, consistent grid component |

**Non-Functional Requirements: 20 NFRs**

- **Performance (NFR1–NFR6):** 2s page load, 1s download initiation, 500ms wizard transitions, optimized photo thumbnails. Drives SSR for public pages and lazy-loading strategy.
- **Security (NFR7–NFR12):** bcrypt password hashing, httpOnly cookies, server-side file validation before disk write, no PII in public API responses, HTTPS enforced, NextAuth best practices.
- **Scalability (NFR13–NFR16):** V1 scoped to SQLite + local filesystem. Migration to Postgres + S3 is planned — data model and API layer must be migration-ready; no SQLite-specific patterns.
- **Reliability (NFR17–NFR20):** No formal SLA. Server-side error logging required; no silent failures on upload or download. Manual backup responsibility.

### Scale & Complexity

- **Primary domain:** Full-stack web application (Next.js)
- **Complexity level:** Medium — file handling pipeline, auth gates, SSR/CSR split, migration-readiness constraint
- **No real-time requirements** in V1 — no WebSockets, no live collaboration
- **No payment processing** — PCI-DSS out of scope
- **Lightweight compliance** — DMCA contact path + privacy policy (static pages sufficient)
- **Solo developer** — infrastructure decisions must minimize operational overhead

### Technical Constraints & Dependencies

- **Framework:** Next.js + TypeScript (already initialized)
- **Styling:** Tailwind CSS v4 (already installed) + shadcn/ui component layer
- **Auth:** NextAuth.js (email/password only in V1)
- **Database:** better-sqlite3 (temporary; migration to Postgres planned)
- **File storage:** Local filesystem (temporary; migration to S3-compatible storage planned)
- **3D viewer:** Deferred to V1.5 — not in V1 scope
- **Browser support:** Chrome, Firefox, Safari, Edge (latest 2 versions); mobile Chrome/Safari supported
- **Rendering:** SSR/SSG for public pages; CSR for interactive flows

### Cross-Cutting Concerns Identified

1. **Authentication & Authorization** — Login gates on download, bookmark, upload initiation. Read-only access without auth. NextAuth session must be accessible server-side (SSR pages) and client-side (interactive flows).
2. **File Upload & Serving Pipeline** — Server-side validation (type, size, executable check) before disk write. Storage abstraction layer required for future S3 migration. File serving through API route (not direct filesystem URL exposure).
3. **SSR/CSR Rendering Strategy** — Public pages (homepage, model pages, categories, tags, profiles) server-rendered. Upload wizard and profile editing client-rendered. Consistent data-fetching patterns needed.
4. **Storage Abstraction** — All database queries and file I/O must go through abstraction interfaces that can be swapped for Postgres + S3 without rewriting API routes.
5. **Error Handling & Logging** — Server-side logging for all upload/download failures. No silent errors. Client-side error states must be specific and actionable per UX spec.
6. **SEO Metadata Layer** — Unique `<title>`, `<meta description>`, Open Graph tags generated server-side per model, category, and tag page. Sitemap generation for all public pages.
7. **Image Optimization** — All model photos served through Next.js `<Image>` with appropriate `sizes` attribute. Thumbnail vs. full-size distinction maintained throughout.
8. **Search & URL State** — Live suggestions, category filters, and sort order reflected in URL for shareability and browser-back safety. Filter changes update results without full page reload.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (Next.js App Router) — greenfield project already initialized.

### Project Foundation

**Already initialized:** `create-next-app` with App Router, TypeScript, Tailwind CSS v4, ESLint 9.

**Initialization command used:**

```bash
npx create-next-app@latest 3d-hub --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript 5.x — strict typing throughout; all components, API routes, and utilities typed
- Node.js runtime — Next.js App Router runs on Node.js by default (not Edge Runtime)

**Styling Solution:**
- Tailwind CSS v4 + PostCSS — already configured; utility-first, mobile-first
- shadcn/ui added via `npx shadcn@latest init` — component layer on top of Radix UI primitives (to be run as first setup story)

**Build Tooling:**
- Next.js built-in compiler (SWC) — fast TypeScript/JSX compilation
- Turbopack available via `next dev --turbo` for faster local development

**Code Organization:**
- App Router: `app/` directory at project root (no `src/` wrapper)
- Route-based file colocation: page, layout, loading, error files per route segment
- API routes: `app/api/[...]/route.ts` convention

**Development Experience:**
- Hot reload with Next.js dev server
- ESLint 9 + eslint-config-next for Next.js-specific rules
- TypeScript strict mode enabled via tsconfig.json

### Additional Packages Required

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `next-auth` | v5 (Auth.js) | Auth + session management | `npm i next-auth@beta` |
| `better-sqlite3` | 12.9.0 | SQLite database (V1) | `npm i better-sqlite3 @types/better-sqlite3` |
| `bcryptjs` | 3.0.3 | Password hashing | `npm i bcryptjs @types/bcryptjs` |
| `busboy` | 1.6.0 | File upload stream parsing | `npm i busboy @types/busboy` |

**bcryptjs rationale:** Pure JavaScript implementation; no native bindings that break in Next.js serverless/edge contexts. Functionally identical to `bcrypt` for V1 scale.

**busboy rationale:** Streaming multipart parser with no Express dependency; works directly with Next.js App Router `Request` objects in Route Handlers.

**Note:** Project foundation is in place. Package installation and shadcn/ui initialization should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data storage: Raw SQL + better-sqlite3 with repository pattern
- Auth: NextAuth.js v5 JWT sessions + middleware protection
- File pipeline: busboy streaming + API route serving
- Search: SQLite FTS5

**Important Decisions (Shape Architecture):**
- Frontend data fetching: React Server Components + SWR
- Wizard state: Zustand
- Forms: React Hook Form
- Error format: `{ error, code }` JSON standard

**Deferred Decisions (Post-MVP):**
- Hosting/deployment: Local only for now; VPS + persistent storage TBD when ready to deploy
- External logging: console.error for V1; structured logging service in V2+
- Session revocation: JWT for V1; database sessions if needed in V2

---

### Data Architecture

**ORM Strategy: Raw SQL (no ORM)**
- Direct better-sqlite3 queries wrapped in a `lib/db/` service layer
- Repository pattern: one file per domain entity (models, users, downloads, bookmarks)
- No Prisma, no Drizzle — avoids ORM-specific patterns that complicate Postgres migration
- All queries are portable standard SQL; migration path is clean

**Search: SQLite FTS5**
- FTS5 virtual table for full-text search across model title, description, and tags
- `LIKE` queries for category and uploader filtering
- FTS5 → Postgres `tsvector`/`tsquery` is a well-documented migration path

**File Storage Structure:**
```
/uploads/
  models/[model-id]/
    files/      ← STL and 3MF model files
    photos/     ← Real-world printed photos
```
- All paths stored in DB as relative paths (never absolute)
- File serving exclusively via `GET /api/files/[...path]` Route Handler — filesystem paths never exposed publicly

---

### Authentication & Security

**Sessions: JWT (stateless)**
- NextAuth.js v5 default JWT strategy — no `sessions` table required
- Session data: userId, email, username — no sensitive data in token
- Acceptable for V1; database sessions added in V2 if session revocation is needed

**Route Protection: Middleware + Server-side checks**
- `middleware.ts` guards coarse-grained protected routes: `/upload`, `/api/upload/*`, `/api/download/*`, `/api/bookmarks/*`
- Server Components perform fine-grained session checks for personalized page content
- No client-side auth guards — auth decisions always made server-side

**File Security:**
- File type checked by MIME type + extension on server before write (not client-declared)
- Executable detection: reject any file where magic bytes match executable formats
- 25MB hard limit enforced at the Route Handler level before streaming to disk

---

### API & Communication Patterns

**Design: REST via Next.js Route Handlers**
- All backend operations through `app/api/.../route.ts` files
- Standard HTTP verbs and status codes (400/401/403/404/413/500)

**Error Response Standard:**
```json
{ "error": "Human-readable message", "code": "MACHINE_READABLE_CODE" }
```
Used consistently across all Route Handlers. Client-side code branches on `code` for specific error handling.

**Download Serving: Streaming Route Handler**
- `GET /api/download/[modelId]` — validates auth, increments download count, streams file via `fs.createReadStream`
- No presigned URLs or CDN for V1 local storage
- Migration path: swap stream implementation for S3 presigned URL when storage migrates

---

### Frontend Architecture

**Data Fetching: React Server Components + SWR**
- Public pages (homepage, model pages, categories, profiles): data fetched in Server Components directly from `lib/db/` service layer — no client fetch needed
- Client-side revalidation (search suggestions, download count updates): SWR v2.x
- Pattern: Server Component fetches initial data, passes as props to client components that use SWR for live updates

**Wizard State: Zustand v5.x**
- Single Zustand store scoped to the upload wizard flow
- Persists: uploaded file references, photo references, metadata form values, draft ID, current step
- Cleared on successful publish or explicit abandon

**Form Handling: React Hook Form v7.x**
- Used for: upload wizard Step 3 (metadata), registration modal, login modal
- Integrates with shadcn/ui `Input`, `Textarea`, `Select` via `Controller` wrapper
- Validation: client-side schema validation via React Hook Form + server-side re-validation at API layer

---

### Infrastructure & Deployment

**Hosting: Local only (V1)**
- No cloud deployment for V1 — running locally during development and initial use
- SQLite database file and `/uploads` directory persist on local machine
- VPS or similar deployment deferred until storage strategy is updated for Postgres + S3

**Logging: console.error / console.warn**
- Server-side errors logged via `console.error` in all Route Handlers
- No silent failures: every catch block in upload and download paths logs before returning error response
- Structured logging library (e.g., Pino) deferred to V2

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Package install + shadcn/ui init (foundation)
2. Database schema + `lib/db/` service layer (all features depend on this)
3. NextAuth.js v5 setup + middleware (auth gates everything else)
4. File upload Route Handler + storage structure (core creator flow)
5. Model browsing pages — SSR with Server Components (core consumer flow)
6. Search with FTS5 (discovery)
7. Download Route Handler (conversion)
8. Profile pages + Library (post-core)
9. SEO metadata + sitemap (pre-launch polish)

**Cross-Component Dependencies:**
- Auth middleware must exist before any protected API routes are built
- `lib/db/` service layer must exist before any page fetches data
- File storage structure must be defined before upload API is built
- FTS5 virtual table must be created in schema migration before search API is built

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

9 areas where AI agents could produce incompatible code if not specified:
database naming · API field casing · file/component naming · directory structure ·
API response shape · date format · pagination format · loading state shape · auth check placement

---

### Naming Patterns

**Database Naming (snake_case throughout)**

| Entity | Convention | Example |
|--------|-----------|---------|
| Tables | `snake_case`, plural | `users`, `models`, `model_files`, `model_photos`, `user_bookmarks`, `download_events` |
| Columns | `snake_case` | `user_id`, `created_at`, `layer_height_mm`, `is_published` |
| Foreign keys | `{table_singular}_id` | `user_id`, `model_id` |
| Indexes | `idx_{table}_{columns}` | `idx_models_user_id`, `idx_models_created_at` |
| FTS5 table | `{table}_fts` | `models_fts` |

**API Endpoint Naming (kebab-case URLs, plural nouns)**

```
GET    /api/models              ← collection
GET    /api/models/[id]         ← single resource
POST   /api/models              ← create
PATCH  /api/models/[id]         ← update
DELETE /api/models/[id]         ← delete
POST   /api/models/[id]/publish
GET    /api/users/[username]
GET    /api/files/[...path]     ← file serving catch-all
POST   /api/auth/[...nextauth]  ← NextAuth handler
```

Route parameters always use Next.js `[param]` and `[...param]` conventions.

**Code Naming**

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `ModelCard.tsx`, `UploadWizard.tsx` |
| Hooks | camelCase with `use` prefix | `useModelSearch.ts`, `useWizardStore.ts` |
| Service/DB functions | camelCase | `getModelById`, `createUser`, `incrementDownloadCount` |
| Utility functions | camelCase | `validateFileType`, `formatFileSize` |
| Zustand stores | camelCase with `Store` suffix | `useWizardStore`, `useAuthStore` |
| TypeScript types/interfaces | PascalCase | `Model`, `User`, `ApiError`, `WizardStep` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE_BYTES`, `ALLOWED_FILE_TYPES` |
| Next.js route files | lowercase as required | `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx` |

**API JSON Field Naming: camelCase**
- DB columns are `snake_case`; the `lib/db/` service layer transforms to `camelCase` before returning
- All API responses use `camelCase` field names
- Example: DB column `layer_height_mm` → API field `layerHeightMm`

---

### Structure Patterns

**Directory Layout**

```
app/
  (auth)/               ← route group: login, register pages
  (marketing)/          ← route group: homepage, about
  models/[id]/          ← model detail page
  categories/[slug]/    ← category browse page
  users/[username]/     ← public profile page
  upload/               ← upload wizard (protected)
  api/
    auth/[...nextauth]/
    models/
    files/[...path]/
    download/[modelId]/
    bookmarks/
    search/
components/
  ui/                   ← shadcn/ui components (auto-generated, do not edit manually)
  model/                ← ModelCard, ModelCardGrid, PrintMetadataBlock, PhotoGallery
  upload/               ← UploadWizard, FileUploadZone, PhotoUploadZone, WizardStepIndicator
  search/               ← SearchBar, SearchResults
  auth/                 ← RegistrationModal, LoginForm
  layout/               ← Navbar, Footer
lib/
  db/
    schema.sql          ← single source of truth for DB schema
    index.ts            ← database connection singleton
    models.ts           ← model CRUD functions
    users.ts            ← user CRUD functions
    downloads.ts        ← download tracking functions
    bookmarks.ts        ← bookmark functions
    search.ts           ← FTS5 search functions
  storage/
    index.ts            ← file I/O abstraction (swap for S3 here)
  auth.ts               ← NextAuth config
  validations.ts        ← shared Zod schemas for file/form validation
  constants.ts          ← MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES, etc.
hooks/                  ← custom React hooks
stores/                 ← Zustand stores
types/                  ← shared TypeScript types and interfaces
middleware.ts           ← NextAuth route protection
```

**Co-location Rule:** Tests live next to the file they test — `models.test.ts` beside `models.ts`. No separate `__tests__/` directory.

**shadcn/ui Rule:** Files in `components/ui/` are generated by `npx shadcn add`. Never edit them manually — customize via CSS variables and Tailwind tokens instead.

---

### Format Patterns

**API Response Shapes**

Success — return data directly (no wrapper):
```json
{
  "id": "123",
  "title": "Cable Organizer",
  "downloadCount": 142,
  "createdAt": "2026-05-04T10:00:00Z"
}
```

Success list — array with pagination metadata:
```json
{
  "items": [...],
  "total": 312,
  "page": 1,
  "limit": 24,
  "hasMore": true
}
```

Error — always `{ error, code }`:
```json
{ "error": "File must be STL or 3MF format", "code": "INVALID_FILE_TYPE" }
{ "error": "Authentication required", "code": "UNAUTHENTICATED" }
{ "error": "File exceeds the 25MB limit", "code": "FILE_TOO_LARGE" }
```

Standard error codes: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `VALIDATION_ERROR`, `INTERNAL_ERROR`

**Date Format: ISO 8601 strings**
- Stored in SQLite as Unix timestamps (integers)
- Returned in API responses as ISO 8601 strings (`"2026-05-04T10:00:00Z"`)
- Service layer handles conversion: `new Date(row.created_at * 1000).toISOString()`

**Pagination: page + limit**
- Query params: `?page=1&limit=24`
- Default page size: 24 (model card grid)
- Max page size: 100

---

### Communication Patterns

**Zustand Store Rules**
- One store per domain concern: `useWizardStore` for upload flow, not a monolithic app store
- Immutable updates: always use `set((state) => ({ ...state, field: value }))` pattern
- No async logic inside stores — async operations happen in hooks or components, then call store setters

**SWR Usage Rules**
- Keys must be stable strings or arrays: `'/api/models'`, `['/api/models', { category }]`
- Always provide `fallbackData` from Server Component's initial fetch to avoid loading flash on client
- Mutate SWR cache after write operations — don't rely on revalidation alone for immediate UI updates

**React Hook Form Rules**
- Validation mode: `onSubmit` (not `onChange` or `onBlur`) — avoids premature error anxiety
- Use `Controller` wrapper when integrating with shadcn/ui controlled components
- Field-level errors from form library; system-level API errors go to Toast

---

### Process Patterns

**Error Handling Flow**
```
Route Handler catches error
  → console.error({ path, userId, error })
  → return { error: humanMessage, code: machineCode } with correct HTTP status

Client receives error response
  → field-level errors → inline below the field (React Hook Form setError)
  → system-level errors → Toast notification
  → Never show raw error.message to users
```

**Loading State Shape**

Use a consistent 4-state pattern in client components:
```ts
type AsyncState = 'idle' | 'loading' | 'success' | 'error'
```
Never use bare `isLoading: boolean` — loses the `idle` vs `success` distinction.

**Auth Check Placement**
- `middleware.ts` matcher: routes that always require auth (`/upload`, `/api/upload/*`, `/api/download/*`)
- Server Component `auth()` call: pages that are public but show personalized content when logged in
- Never: client-side auth redirects via `useEffect` + `router.push`

**File Upload Flow**
```
Client → POST /api/upload (multipart)
  → busboy parses stream
  → validate type (extension + magic bytes)
  → validate size (reject if > 25MB before writing)
  → write to /uploads/models/[tempId]/files/[filename]
  → return { fileId, filename, size }

On publish: move temp files to /uploads/models/[finalId]/
On abandon/timeout: cleanup temp files
```

---

### Enforcement Guidelines

**All AI agents MUST:**
- Use `snake_case` for all database identifiers; `camelCase` in all TypeScript/JSON
- Return `{ error, code }` for all API errors — no custom error shapes
- Import DB functions only from `lib/db/` — never query SQLite directly in pages or components
- Import file I/O only from `lib/storage/` — never use `fs` directly outside this module
- Validate file type and size in Route Handler before any disk write
- Log every Route Handler error with `console.error` before returning the error response
- Use ISO 8601 strings for all dates in API responses
- Never expose filesystem paths in API responses

**Anti-Patterns to Avoid:**
- ❌ Direct `import Database from 'better-sqlite3'` outside `lib/db/index.ts`
- ❌ Using `fs.writeFileSync` or `fs.readFileSync` outside `lib/storage/`
- ❌ Returning plain strings as API errors
- ❌ `isLoading: boolean` state — use the 4-state `AsyncState` type instead
- ❌ `camelCase` database column names in SQL
- ❌ Client-side auth redirects using `useEffect` + `router.push`

## Project Structure & Boundaries

### Complete Project Directory Structure

```
3d-hub/
├── .env.local                              ← NEXTAUTH_SECRET, DATABASE_PATH, UPLOAD_DIR
├── .env.example                            ← Template for env setup (committed)
├── .gitignore                              ← /uploads/, *.db, .env.local
├── next.config.ts
├── tailwind.config.ts                      ← Color tokens, spacing, typography scale
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── package.json
├── middleware.ts                           ← NextAuth route protection matcher
│
├── app/
│   ├── globals.css                         ← Tailwind base + shadcn/ui CSS variables
│   ├── layout.tsx                          ← Root layout: Navbar, Toaster provider
│   ├── sitemap.ts                          ← FR37: auto-generated sitemap
│   ├── robots.ts
│   │
│   ├── (marketing)/                        ← Route group: public browsing
│   │   ├── page.tsx                        ← FR16, FR17: homepage grid + featured section
│   │   ├── loading.tsx                     ← Skeleton card grid
│   │   └── error.tsx
│   │
│   ├── (auth)/                             ← Route group: auth pages
│   │   ├── login/
│   │   │   └── page.tsx                    ← FR2: login page
│   │   └── register/
│   │       └── page.tsx                    ← FR1: register page
│   │
│   ├── models/
│   │   └── [id]/
│   │       ├── page.tsx                    ← FR23, FR35: model detail + OG metadata
│   │       ├── loading.tsx
│   │       └── error.tsx
│   │
│   ├── categories/
│   │   └── [slug]/
│   │       ├── page.tsx                    ← FR18, FR36: category browse (SSR + indexable)
│   │       └── loading.tsx
│   │
│   ├── users/
│   │   └── [username]/
│   │       ├── page.tsx                    ← FR27, FR28: public profile + download library
│   │       └── loading.tsx
│   │
│   ├── upload/
│   │   └── page.tsx                        ← FR5–FR15: upload wizard (protected by middleware)
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts                ← NextAuth v5 handler
│       ├── models/
│       │   ├── route.ts                    ← GET (paginated list), POST (create draft)
│       │   └── [id]/
│       │       ├── route.ts                ← GET, PATCH, DELETE
│       │       └── publish/
│       │           └── route.ts            ← POST: publish model (FR14)
│       ├── upload/
│       │   ├── files/
│       │   │   └── route.ts                ← POST: upload STL/3MF (FR6, FR15, FR30–FR32)
│       │   └── photos/
│       │       └── route.ts                ← POST: upload printed photos (FR7, FR8)
│       ├── download/
│       │   └── [modelId]/
│       │       └── route.ts                ← GET: auth check + stream + increment count (FR24, FR26)
│       ├── files/
│       │   └── [...path]/
│       │       └── route.ts                ← GET: serve stored files (photos + model files)
│       ├── search/
│       │   └── route.ts                    ← GET: FTS5 search + suggestions (FR19–FR22)
│       ├── bookmarks/
│       │   └── route.ts                    ← GET, POST, DELETE (FR41)
│       └── categories/
│           └── route.ts                    ← GET: list all platform categories (FR18)
│
├── components/
│   ├── ui/                                 ← shadcn/ui — auto-generated, never edit manually
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── toast.tsx
│   │   ├── tabs.tsx
│   │   ├── label.tsx
│   │   ├── checkbox.tsx
│   │   ├── skeleton.tsx
│   │   ├── alert.tsx
│   │   └── tooltip.tsx
│   │
│   ├── model/                              ← FR16, FR23, FR38, FR42
│   │   ├── ModelCard.tsx                   ← Photo-dominant card (75% photo, count, tag chip)
│   │   ├── ModelCardGrid.tsx               ← Responsive 1→4 col grid with Skeleton loading
│   │   ├── PrintMetadataBlock.tsx          ← Layer height, infill %, supports, filament type
│   │   └── PhotoGallery.tsx                ← Multi-angle printed photos + lightbox
│   │
│   ├── upload/                             ← FR5–FR15
│   │   ├── UploadWizard.tsx                ← 5-step wizard shell + step navigation
│   │   ├── WizardStepIndicator.tsx         ← Visual step progress (1–5)
│   │   ├── FileUploadZone.tsx              ← Step 1: STL/3MF drag-and-drop + validation
│   │   ├── PhotoUploadZone.tsx             ← Step 2: printed photo upload (enforced)
│   │   ├── ModelMetadataForm.tsx           ← Step 3: title, description, print metadata
│   │   ├── TagSelector.tsx                 ← Step 4: predefined chips + custom tags
│   │   └── PublishPreview.tsx              ← Step 5: live preview + license consent
│   │
│   ├── search/                             ← FR19–FR22
│   │   ├── SearchBar.tsx                   ← Persistent search + live suggestion dropdown
│   │   └── SearchFilters.tsx               ← Category pills + sort dropdown (URL state)
│   │
│   ├── auth/                               ← FR1–FR3, FR25
│   │   ├── RegistrationModal.tsx           ← Download gate: register or login
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   └── layout/
│       ├── Navbar.tsx                      ← Logo, SearchBar, auth CTAs (FR22)
│       └── Footer.tsx                      ← DMCA contact + privacy policy links (FR33)
│
├── lib/
│   ├── db/
│   │   ├── schema.sql                      ← Single source of truth: tables, indexes, FTS5
│   │   ├── index.ts                        ← Database singleton; runs schema on init
│   │   ├── models.ts                       ← getModelById, listModels, createModel, publishModel…
│   │   ├── users.ts                        ← createUser, getUserByEmail, getUserByUsername…
│   │   ├── downloads.ts                    ← incrementDownloadCount, getDownloadHistory
│   │   ├── bookmarks.ts                    ← addBookmark, removeBookmark, getBookmarksByUser
│   │   └── search.ts                       ← searchModels (FTS5), getSearchSuggestions
│   │
│   ├── storage/
│   │   └── index.ts                        ← saveModelFile, savePhoto, deleteFile (swap for S3 here)
│   │
│   ├── auth.ts                             ← NextAuth v5 config: credentials provider, JWT, session
│   ├── validations.ts                      ← Zod schemas: file upload, model metadata, auth forms
│   └── constants.ts                        ← MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS, CATEGORIES, PAGE_SIZE
│
├── hooks/
│   ├── useModelSearch.ts                   ← SWR search with URL search params sync
│   └── useDownload.ts                      ← Download trigger: auth check → modal or direct
│
├── stores/
│   └── wizardStore.ts                      ← Zustand: files[], photos[], metadata, tags, draftId, currentStep
│
├── types/
│   ├── model.ts                            ← Model, ModelFile, ModelPhoto, PrintMetadata, DraftModel
│   ├── user.ts                             ← User, PublicUser, SessionUser
│   ├── api.ts                              ← ApiError, ApiErrorCode, PaginatedResponse<T>, AsyncState
│   └── search.ts                           ← SearchQuery, SearchResult, SearchSuggestion
│
├── public/
│   └── favicon.ico
│
└── uploads/                                ← Local file storage (gitignored)
    └── models/
        └── [model-id]/
            ├── files/
            └── photos/
```

### Architectural Boundaries

**API Boundaries**

| Boundary | Rule |
|----------|------|
| Client → Server | All mutations go through `app/api/` Route Handlers |
| Server Component → DB | Pages call `lib/db/` directly — no `fetch()` for initial data |
| Auth | Only `lib/auth.ts` configures NextAuth; `auth()` used everywhere else |
| File I/O | Only `lib/storage/index.ts` touches the filesystem |

**Component Boundaries**

- **Server Components:** `page.tsx`, `layout.tsx` — call `lib/db/` directly, render HTML, no hooks
- **Client Components:** `'use client'` — `UploadWizard`, `SearchBar`, `RegistrationModal`, `TagSelector`, `PhotoGallery`, `SearchFilters`
- **Rule:** `components/ui/` and `components/model/` are pure UI — never import from `lib/db/` or `lib/storage/`

**Data Boundaries**

- `lib/db/*.ts` — only place importing `better-sqlite3`; returns camelCase TypeScript objects
- `lib/storage/index.ts` — only place using `node:fs`; accepts/returns relative paths
- Route Handlers — validate with Zod, call `lib/db/` + `lib/storage/`, return JSON
- Zustand store — transient UI state only; never writes to DB directly

### Requirements to Structure Mapping

| FR Area | Key Files |
|---------|-----------|
| Auth (FR1–FR4) | `app/(auth)/`, `lib/auth.ts`, `components/auth/`, `middleware.ts` |
| Upload (FR5–FR15) | `app/upload/`, `components/upload/`, `app/api/upload/`, `lib/storage/`, `lib/db/models.ts` |
| Discovery (FR16–FR22) | `app/(marketing)/page.tsx`, `app/categories/`, `components/search/`, `app/api/search/` |
| Consumption (FR23–FR26) | `app/models/[id]/`, `app/api/download/`, `components/model/`, `lib/db/downloads.ts` |
| Profile (FR27–FR29) | `app/users/[username]/`, `lib/db/users.ts`, `lib/db/downloads.ts` |
| Safety (FR30–FR34) | `lib/validations.ts`, `lib/constants.ts`, `app/api/upload/*/route.ts`, `components/layout/Footer.tsx` |
| SEO (FR35–FR39) | `generateMetadata()` in each `page.tsx`, `app/sitemap.ts`, `app/robots.ts` |
| Bookmarks (FR41–FR42) | `app/api/bookmarks/route.ts`, `lib/db/bookmarks.ts`, `components/auth/RegistrationModal.tsx` |

### Data Flow

```
Browser request
  → middleware.ts        (NextAuth session check for protected routes)
  → Server Component     (page.tsx calls lib/db/*.ts directly)
  → HTML response        (initial data server-rendered)
  → Client hydration     (interactive components activate)
      → Zustand store    (wizard state, transient UI)
      → SWR hooks        (revalidation: /api/search, /api/models/[id])
      → Route Handlers   (mutations: upload, publish, download, bookmark)
          → lib/db/      (database reads/writes)
          → lib/storage/ (file reads/writes)
          → JSON response
```

### Environment Configuration

```bash
# .env.local (gitignored)
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
DATABASE_PATH=./3d-hub.db
UPLOAD_DIR=./uploads
```

`.env.example` contains all keys with placeholder values — committed to repo as setup reference.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible. Next.js 16 + React 19 + TypeScript 5 form the stable base. NextAuth.js v5 is designed for App Router. SWR v2 works correctly alongside Server Components via `fallbackData`. Zustand v5 and React 19 are compatible. busboy works natively with App Router Route Handler `Request` objects. Tailwind CSS v4 and shadcn/ui (CLI v4) are confirmed compatible. bcryptjs integrates cleanly with NextAuth credentials provider. No version conflicts identified.

**Pattern Consistency:**
Naming conventions are consistent across all layers: `snake_case` in SQL, `camelCase` in TypeScript/JSON throughout. Error format `{ error, code }` is applied uniformly. Date handling (Unix timestamps in DB, ISO 8601 in API) is consistent. Storage abstraction pattern is applied uniformly — `lib/db/` for data, `lib/storage/` for files.

**Structure Alignment:**
App Router directory conventions are correctly applied. Route groups `(auth)/` and `(marketing)/` properly isolate concerns. Component domain grouping matches the FR capability areas. API route paths follow the REST naming pattern established in the patterns section.

---

### Requirements Coverage Validation ✅

**Functional Requirements: 42/42 Covered**

| FR Area | Status | Architectural Support |
|---------|--------|-----------------------|
| Auth (FR1–FR4) | ✅ | NextAuth v5, `app/(auth)/`, `middleware.ts`, JWT sessions |
| Upload (FR5–FR15) | ✅ | `app/upload/`, `components/upload/`, `app/api/upload/`, `lib/storage/`, `lib/db/models.ts` |
| Discovery (FR16–FR22) | ✅ | Homepage SSR, `app/categories/`, SearchBar, FTS5, URL state |
| Consumption (FR23–FR26) | ✅ | `app/models/[id]/`, streaming download Route Handler, auth gate |
| Profile (FR27–FR29) | ✅ | `app/users/[username]/`, `lib/db/users.ts`, `lib/db/downloads.ts` |
| Safety (FR30–FR34) | ✅ | File validation in upload routes, bcryptjs, Footer DMCA link |
| SEO (FR35–FR39) | ✅ | `generateMetadata()` per page, `app/sitemap.ts`, `app/robots.ts`, Next.js `<Image>` |
| Bookmarks (FR41–FR42) | ✅ | `app/api/bookmarks/`, `lib/db/bookmarks.ts`, `RegistrationModal` gate, `ModelCardGrid` consistent |

**Non-Functional Requirements: 20/20 Covered**

- **Performance (NFR1–NFR6):** SSR for fast initial paint; Next.js `<Image>` for optimized thumbnails; streaming download; SWR for client-side revalidation; lazy loading below the fold
- **Security (NFR7–NFR12):** bcryptjs hashing; httpOnly cookies via NextAuth JWT; server-side file validation before disk write; camelCase transform strips internal DB fields from API responses; HTTPS is deployment-level enforcement; NextAuth v5 best practices followed
- **Scalability (NFR13–NFR16):** SQLite V1 with storage abstraction layer; no concurrent user SLA; all queries are portable SQL; `lib/storage/` is the S3 swap point
- **Reliability (NFR17–NFR20):** No SLA accepted; manual backup responsibility documented; `console.error` in all Route Handler catch blocks; no silent failures in upload/download paths

---

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with package versions. Technology stack fully specified. Integration patterns (Server Component → DB → JSON → Client) fully defined.

**Structure Completeness:** Complete directory tree with specific filenames and FR annotations. Every file has a defined purpose. Component, data, and API boundaries are explicit.

**Pattern Completeness:** 9 conflict points identified and resolved. Naming, format, communication, and process patterns all defined with concrete examples and anti-patterns.

---

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps (non-blocking — note for implementation):**

1. **DB table list not enumerated** — `schema.sql` is the source of truth, but expected tables for agent reference:
   - Core tables: `users`, `models`, `model_files`, `model_photos`, `tags`, `model_tags`, `categories`, `user_bookmarks`, `download_events`
   - FTS5 virtual table: `models_fts` (indexes `title`, `description`, concatenated tags)

2. **Draft/temp file cleanup** — abandoned uploads leave orphaned temp directories under `/uploads/models/temp-*/`. V1 resolution: manual periodic cleanup by the developer. No automated cleanup scheduled. Acceptable at solo-dev scale.

3. **Next.js local file serving config** — `next.config.ts` requires configuration to serve photos from the local filesystem through `/api/files/[...path]`. Use `unoptimized` prop on Next.js `<Image>` for locally-served photos in V1, or configure a custom loader.

**Nice-to-Have Gaps:**
- Testing strategy (unit tests for `lib/db/`, integration tests for Route Handlers) — deferred to implementation phase

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

---

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level:** High — all 42 FRs and 20 NFRs have explicit architectural support; all 9 identified conflict points have defined patterns; no critical gaps remain.

**Key Strengths:**
- Storage abstraction layer makes Postgres + S3 migration a contained swap, not a rewrite
- SSR-first rendering for all public pages ensures SEO and fast initial paint without extra configuration
- File serving through a Route Handler means the filesystem path is never exposed; the switch to S3 presigned URLs is a one-file change in `lib/storage/`
- Enforcement guidelines are specific enough to catch anti-patterns during code review

**Areas for Future Enhancement:**
- Testing strategy (unit + integration) — define in V1.5 sprint planning
- Structured logging (Pino or similar) — V2 when logs need to be queried
- Draft cleanup automation — V2 when user volumes make manual cleanup impractical
- Database sessions + session revocation — V2 if security requirements tighten

---

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented — no deviation without updating this document
- Use implementation patterns consistently across all components
- Respect the `lib/db/` and `lib/storage/` abstraction boundaries — no direct DB or filesystem access outside these modules
- Refer to this document for all architectural questions before making implementation choices

**First Implementation Steps:**
```bash
# 1. Install additional packages
npm i next-auth@beta better-sqlite3 @types/better-sqlite3 bcryptjs @types/bcryptjs busboy @types/busboy

# 2. Initialize shadcn/ui
npx shadcn@latest init

# 3. Create lib/db/schema.sql and lib/db/index.ts
# 4. Create lib/auth.ts (NextAuth v5 config)
# 5. Create middleware.ts (route protection)
```
