# Project Structure & Boundaries

## Complete Project Directory Structure

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

## Architectural Boundaries

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

## Requirements to Structure Mapping

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

## Data Flow

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

## Environment Configuration

```bash
# .env.local (gitignored)
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
DATABASE_PATH=./3d-hub.db
UPLOAD_DIR=./uploads
```

`.env.example` contains all keys with placeholder values — committed to repo as setup reference.
