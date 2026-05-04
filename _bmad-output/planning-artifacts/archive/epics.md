---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# 3D Hub - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for 3D Hub, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visitors can register for an account using email and password
FR2: Registered users can log in with their email and password
FR3: Authenticated users can log out
FR4: The system maintains authenticated sessions across page navigation
FR5: Authenticated users can initiate a new model listing via a guided multi-step upload wizard
FR6: Creators can upload one or more STL or 3MF model files per listing
FR7: Creators can upload one or more real-world printed photos per listing
FR8: The system requires at least one printed photo before a model can be published
FR9: Creators can enter a title, description, and structured print metadata (layer height, infill %, support requirements, filament type) per listing
FR10: Creators can assign predefined platform tags and unlimited custom tags to a listing
FR11: Creators can preview how their model listing will appear before publishing
FR12: Creators can save an in-progress upload as a draft and resume it later
FR13: Creators must confirm a license declaration (free-to-download, original work) before publishing
FR14: After publishing, creators are redirected to the live model page
FR15: The system enforces a maximum file size limit of 25MB per uploaded file
FR16: Visitors can browse a paginated grid of published model cards on the homepage
FR17: The homepage displays a featured/trending section of models
FR18: Visitors can navigate models by category
FR19: Visitors can search models by name, tag, category, or uploader
FR20: Search results default to sorting by download count
FR21: Visitors can filter search results by category
FR22: A persistent search input is accessible from all pages
FR23: Visitors can view a model page showing printed photos, description, and print metadata
FR24: Authenticated users can download model files in one click
FR25: Unauthenticated visitors are prompted to register before downloading
FR26: The system records a download count increment for each completed download
FR27: Each registered user has a public profile page displaying their published models
FR28: Authenticated users can view their private download history
FR29: Non-uploading users see a contextual prompt encouraging them to upload a model
FR30: The system accepts only STL and 3MF file formats for model uploads
FR31: The system rejects uploaded files exceeding the per-file size limit
FR32: The system rejects files with executable characteristics regardless of extension
FR33: A published DMCA takedown contact path is accessible to all users
FR34: User passwords are stored using secure hashing — never plain text
FR35: Each model page has unique title, meta description, and Open Graph tags
FR36: Category and tag pages are server-rendered and indexable by search engines
FR37: A sitemap is generated covering all public model and category pages
FR38: Model card thumbnails display a real printed photo
FR39: The platform layout is responsive and usable on mobile browsers
FR40: The homepage grid contains at least 50 seeded models at public launch
FR41: Registered users can bookmark a model to their Library without downloading it; unauthenticated visitors who attempt to bookmark are prompted to register
FR42: The model card grid layout is consistent across homepage, category pages, search results, and user profile pages

### NonFunctional Requirements

**Performance:**
NFR1: Homepage initial page load under 2 seconds on a standard broadband connection
NFR2: Model page load under 2 seconds; printed photos lazy-load below the fold
NFR3: File download initiation under 1 second after the download button is clicked
NFR4: Upload wizard step transitions under 500ms
NFR5: File upload: progress indicator displayed for any upload taking longer than 2 seconds
NFR6: Printed photo thumbnails served at optimized resolution; full-size photos available on model page

**Security:**
NFR7: User passwords stored using bcrypt or equivalent secure one-way hashing — never plain text
NFR8: Authentication sessions use secure, httpOnly cookies; no auth tokens in localStorage or sessionStorage
NFR9: File uploads validated server-side before writing to disk: file type, size, and executable rejection enforced at API layer
NFR10: No personally identifiable information (email, hashed password) exposed in public API responses or client-accessible URLs
NFR11: HTTPS required in all production environments
NFR12: NextAuth.js session configuration must follow library security best practices

**Scalability:**
NFR13: V1 scoped to SQLite and local filesystem storage
NFR14: No concurrent user targets or uptime SLA for V1
NFR15: Data model and API layer designed for future migration to Postgres + S3; no SQLite-specific patterns that cannot be ported
NFR16: Migration triggered by scale, not a fixed timeline; V1 architecture must not block it

**Reliability:**
NFR17: No formal uptime SLA for V1 — solo-hosted
NFR18: Database backup is a manual developer responsibility; required before any schema changes
NFR19: File storage backup is a manual developer responsibility; no automated backup in V1
NFR20: Application errors must be logged server-side; no silent failures on file upload or download

### Additional Requirements

- **Foundation setup (Epic 1 Story 1 target):** Project already initialized with `create-next-app` (App Router, TypeScript, Tailwind CSS v4, ESLint 9). Additional packages required: `next-auth@beta`, `better-sqlite3`, `@types/better-sqlite3`, `bcryptjs`, `@types/bcryptjs`, `busboy`, `@types/busboy`. shadcn/ui must be initialized via `npx shadcn@latest init`.
- **Database schema:** `lib/db/schema.sql` is the single source of truth. Core tables: `users`, `models`, `model_files`, `model_photos`, `tags`, `model_tags`, `categories`, `user_bookmarks`, `download_events`. FTS5 virtual table: `models_fts` (indexes title, description, concatenated tags).
- **Repository pattern:** One `lib/db/*.ts` file per domain entity (models, users, downloads, bookmarks, search). No direct `better-sqlite3` imports outside `lib/db/index.ts`.
- **Storage abstraction:** All file I/O through `lib/storage/index.ts` only — never `fs` directly in components, pages, or route handlers. Enables future S3 swap.
- **File serving:** All stored files served via `GET /api/files/[...path]` route handler only; filesystem paths never exposed in API responses.
- **Auth + middleware:** NextAuth.js v5 JWT sessions; `middleware.ts` protects `/upload`, `/api/upload/*`, `/api/download/*`, `/api/bookmarks/*`. Auth decisions always server-side — no client-side auth redirects via `useEffect`.
- **API error format:** All route handler errors must return `{ "error": "Human-readable message", "code": "MACHINE_READABLE_CODE" }` with correct HTTP status codes. Standard codes: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `VALIDATION_ERROR`, `INTERNAL_ERROR`.
- **Async state pattern:** Use 4-state `AsyncState = 'idle' | 'loading' | 'success' | 'error'` in all client components — never bare `isLoading: boolean`.
- **Date format:** Stored as Unix timestamps in SQLite; returned as ISO 8601 strings in all API responses.
- **Pagination format:** `?page=1&limit=24`; responses include `{ items, total, page, limit, hasMore }`.
- **Environment config:** `.env.local` (gitignored) with `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_PATH`, `UPLOAD_DIR`; `.env.example` committed to repo.
- **Abandoned upload cleanup:** Temp files under `/uploads/models/temp-*/` cleaned manually in V1.
- **Next.js image serving:** `next.config.ts` requires `unoptimized` prop or custom loader for locally-served photos in V1.
- **Naming conventions:** DB identifiers in `snake_case`; all TypeScript/JSON in `camelCase`; React components in `PascalCase`; constants in `SCREAMING_SNAKE_CASE`.
- **Error logging:** Every route handler catch block must `console.error` before returning the error response — no silent failures.
- **Sitemap + robots:** `app/sitemap.ts` and `app/robots.ts` cover all public model and category pages.

### UX Design Requirements

UX-DR1: Implement the sage green design token system — `#4A7C59` brand primary, `#3A6347` hover, `#D4EDDA` light/badges, `#F8FAF8` page background, `#FFFFFF` card background, `#E2EBE4` borders — configured as Tailwind CSS v4 tokens in `globals.css`
UX-DR2: Implement Inter font (Google Fonts) with system-ui fallback; apply the 6-level typography scale (h1: 36px/700, h2: 24px/600, h3: 18px/600, body: 16px/400, small: 14px/400, label: 12px/500) as Tailwind tokens
UX-DR3: Implement responsive card grid layout — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` — with 1280px max content width and 8px base spacing unit
UX-DR4: Implement ModelCard component — photo area 75% of card height via Next.js `<Image>`, title (h3, 2-line truncation), download count stat line, one primary tag chip; hover state (shadow lift, sage green border tint); `role="article"` with `aria-label`
UX-DR5: Implement PrintMetadataBlock component — `<dl>` description list in 2×2 grid showing layer height, infill %, supports required, filament type; muted labels (12px) with medium-weight values (14px); partial-data state shows "—"
UX-DR6: Implement PhotoGallery component — large primary photo, thumbnail strip, photo count indicator, prev/next navigation, lightbox overlay (Escape to close, arrow key navigation); `aria-label="Photo {n} of {total}"`
UX-DR7: Implement UploadWizard 5-step shell — WizardStepIndicator always visible (`aria-current="step"` on active step), Back always enabled, Continue disabled until step validation passes, draft auto-saved on each step advance
UX-DR8: Implement FileUploadZone component — drag-and-drop STL/3MF zone, drag-over state (green border, mint fill), per-file upload progress bars, specific error message per rejected file, success checkmarks
UX-DR9: Implement PhotoUploadZone component — drag-and-drop photo upload, thumbnail grid with remove × per photo, step-lock indicator when empty, positive framing copy ("Show off your printed result")
UX-DR10: Implement TagSelector component — predefined platform chip toggle row (sage green fill when selected, `role="checkbox"`), custom tag text input with removable chips; custom tag additions announced to screen readers
UX-DR11: Implement DownloadButton component — authenticated state (direct download), unauthenticated state (opens RegistrationModal), downloading state (brief loading indicator); never navigates away from the model page
UX-DR12: Implement RegistrationModal component — extends shadcn/ui Dialog, model thumbnail visible in header, Register/Login tab switcher, minimal form (email + password), auto-triggers download after successful auth; focus trap inside modal
UX-DR13: Implement SearchBar component — live suggestions after 2+ characters, suggestions grouped by type (Models/Tags/Creators), sage green focus border, full keyboard navigation through suggestions; `aria-live="polite"` on suggestion list
UX-DR14: Implement category filter pills — horizontally scrollable on mobile, single-select (new selection deselects previous), URL state updated on selection, content updates without full page reload
UX-DR15: Implement mobile-specific layout — stacked nav (logo row + full-width search bar + hamburger drawer), Download button sticky at bottom of viewport on model page mobile view
UX-DR16: Implement desktop model page two-column layout — large photo gallery left, print metadata block + Download CTA in right sidebar (at 1024px+ breakpoint)
UX-DR17: Implement skeleton loading states matching exact ModelCard dimensions for the card grid; skeleton for photo area and metadata block on model page during SSR hydration
UX-DR18: Implement empty states — no search results ("No models found for '[query]'" + "Clear filters" + "Browse all models"); own empty creator profile ("You haven't uploaded any models yet" + Upload CTA); empty download library ("No downloads yet" + Browse CTA)
UX-DR19: Implement global accessibility features — skip link ("Skip to main content") as first focusable element; focus management (move to first element on modal open, return to trigger on close); `prefers-reduced-motion` wrapping all CSS transitions and `@keyframes`
UX-DR20: Implement feedback pattern — success toasts (sage green, auto-dismiss 4s) for "Your model is live!", "Download started", "Draft saved"; field-level inline errors (red, specific message); system-level error toasts (red accent); amber inline banner for draft state

### FR Coverage Map

```
FR1:  Epic 1 — User registration with email + password
FR2:  Epic 1 — User login with email + password
FR3:  Epic 1 — Authenticated logout
FR4:  Epic 1 — Session persistence across page navigation
FR5:  Epic 2 — Upload wizard initiation (authenticated)
FR6:  Epic 2 — STL/3MF model file upload (1+)
FR7:  Epic 2 — Printed photo upload (1+)
FR8:  Epic 2 — Photo enforcement gate before publish
FR9:  Epic 2 — Title, description, structured print metadata entry
FR10: Epic 2 — Predefined + custom tag assignment
FR11: Epic 2 — Live preview step before publishing
FR12: Epic 2 — Save as draft and resume
FR13: Epic 2 — License declaration consent checkbox
FR14: Epic 2 — Post-publish redirect to live model page
FR15: Epic 2 — 25MB per-file size enforcement
FR16: Epic 3 — Paginated model card grid on homepage
FR17: Epic 3 — Featured/trending section on homepage
FR18: Epic 3 — Category navigation
FR19: Epic 3 — Search by name, tag, category, uploader
FR20: Epic 3 — Default sort by download count
FR21: Epic 3 — Category filter on search results
FR22: Epic 3 — Persistent search input on all pages
FR23: Epic 4 — Model page: printed photos, description, print metadata
FR24: Epic 4 — One-click authenticated download
FR25: Epic 4 — Registration gate for unauthenticated download
FR26: Epic 4 — Download count increment on completion
FR27: Epic 5 — Public creator profile page (published models)
FR28: Epic 5 — Private download history (authenticated)
FR29: Epic 5 — Upload nudge for non-uploading users
FR30: Epic 2 — STL/3MF only file type acceptance
FR31: Epic 2 — File size limit rejection (>25MB)
FR32: Epic 2 — Executable file rejection
FR33: Epic 1 — DMCA takedown contact path in Footer
FR34: Epic 1 — Secure password hashing (bcryptjs)
FR35: Epic 4 — Unique OG/meta tags per model page
FR36: Epic 3 — Category/tag pages SSR + crawlable
FR37: Epic 6 — Auto-generated sitemap for all public pages
FR38: Epic 3 — Printed photo thumbnail on model cards
FR39: Epic 1 — Responsive layout foundation (mobile-first CSS)
FR40: Epic 6 — 50+ seeded models at public launch
FR41: Epic 5 — Bookmark model to Library (auth gate for unauthenticated)
FR42: Epic 3 — Consistent model card grid across all page types
```

## Epic List

### Epic 1: Platform Foundation & Authentication
Users can register, log in, log out, and maintain a session. The platform has its design system, navigation, and base layout in place.
**FRs covered:** FR1, FR2, FR3, FR4, FR33, FR34, FR39

### Epic 2: Model Upload & Publishing
Creators can upload 3D model files with printed photos and print metadata through a guided 5-step wizard, and publish to the platform.
**FRs covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR30, FR31, FR32

### Epic 3: Model Discovery & Browsing
Visitors can browse a grid of published models on the homepage, navigate by category, and search by name, tag, category, or uploader.
**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR36, FR38, FR42

### Epic 4: Model Evaluation & Download
Visitors can evaluate a model from printed photos and structured print metadata; authenticated users download in one click; unauthenticated visitors are converted via a registration modal.
**FRs covered:** FR23, FR24, FR25, FR26, FR35

### Epic 5: Creator Profiles & User Collections
Registered users have a public creator profile, a private download history, and can bookmark models for later.
**FRs covered:** FR27, FR28, FR29, FR41

### Epic 6: SEO, Sitemap & Pre-Launch Readiness
The platform is crawlable by search engines, has a sitemap, and contains 50+ quality-seeded models before public launch.
**FRs covered:** FR37, FR40

---

## Epic 1: Platform Foundation & Authentication

Users can register, log in, log out, and maintain a session. The platform has its design system, navigation, and base layout in place.

### Story 1.1: Project Setup & Design System Foundation

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

### Story 1.2: Database Schema & User Data Layer

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

### Story 1.3: Authentication Infrastructure & Route Protection

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

### Story 1.4: User Registration

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

### Story 1.5: User Login & Session Persistence

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

## Epic 2: Model Upload & Publishing

Creators can upload 3D model files with printed photos and print metadata through a guided 5-step wizard, and publish to the platform.

### Story 2.1: Model Database Schema & Repository Layer

As a developer,
I want the model-related database tables created and a typed repository layer in place,
So that uploaded model data can be stored and retrieved by the upload wizard stories.

**Acceptance Criteria:**

**Given** `lib/db/schema.sql` already contains the `users` table from Story 1.2
**When** the schema migration is applied
**Then** the following tables exist: `models`, `model_files`, `model_photos`, `tags`, `model_tags`, `categories`
**And** the `models` table includes: `id TEXT PRIMARY KEY`, `user_id TEXT NOT NULL REFERENCES users(id)`, `title TEXT NOT NULL`, `description TEXT`, `layer_height_mm REAL`, `infill_percent INTEGER`, `supports_required INTEGER`, `filament_type TEXT`, `license TEXT NOT NULL DEFAULT 'free'`, `is_published INTEGER NOT NULL DEFAULT 0`, `is_draft INTEGER NOT NULL DEFAULT 1`, `download_count INTEGER NOT NULL DEFAULT 0`, `created_at INTEGER NOT NULL`, `published_at INTEGER`
**And** `model_files` includes: `id`, `model_id` (FK), `filename`, `file_size_bytes`, `original_name`, `created_at`
**And** `model_photos` includes: `id`, `model_id` (FK), `filename`, `alt_text`, `display_order`, `created_at`
**And** `categories` is seeded with the platform's predefined category list
**And** `tags` and `model_tags` support the hybrid tag system (predefined + custom)
**And** indexes exist on `models.user_id`, `models.is_published`, `models.created_at`

**Given** the schema is applied
**When** `lib/db/models.ts` is implemented
**Then** it exports: `createDraftModel(userId, data): DraftModel`, `updateDraftModel(id, data): Model`, `publishModel(id): Model`, `getModelById(id): Model | null`, `listModelsByUser(userId): Model[]`
**And** `types/model.ts` defines `Model`, `DraftModel`, `ModelFile`, `ModelPhoto`, `PrintMetadata` types with camelCase fields

---

### Story 2.2: File & Photo Upload APIs + Storage Abstraction

As a creator,
I want my STL/3MF model files and printed photos uploaded securely to the server,
So that my model assets are safely stored and ready to attach to a listing.

**Acceptance Criteria:**

**Given** `lib/storage/index.ts` is implemented
**When** a file is saved
**Then** it is written to `UPLOAD_DIR/models/[modelId]/files/[filename]` or `.../photos/[filename]` using only relative paths stored in the DB
**And** `lib/storage/index.ts` is the only module that uses `node:fs` — no direct filesystem access elsewhere
**And** `next.config.ts` is configured so locally-served photos are accessible (using `unoptimized` or a custom loader)

**Given** `POST /api/upload/files` is called with a multipart file
**When** busboy parses the stream
**Then** the file extension AND magic bytes are checked — only STL and 3MF are accepted
**And** any file exceeding 25MB is rejected before being written to disk, returning `{ "error": "File exceeds the 25MB limit", "code": "FILE_TOO_LARGE" }` with HTTP 413
**And** any file whose magic bytes match executable formats is rejected with `{ "error": "Executable files are not permitted", "code": "INVALID_FILE_TYPE" }` with HTTP 422
**And** a valid file is written to a temp directory and returns `{ fileId, filename, size }` with HTTP 200
**And** every error in the route handler catch block is logged with `console.error` before returning the response

**Given** `POST /api/upload/photos` is called with a multipart image file
**When** the upload is processed
**Then** the file is validated for image MIME type and written to the photos temp directory
**And** the response returns `{ photoId, filename, previewUrl }` with HTTP 200

**Given** `lib/constants.ts` is created
**When** it is imported
**Then** it exports `MAX_FILE_SIZE_BYTES = 26214400` (25MB), `ALLOWED_MODEL_EXTENSIONS = ['.stl', '.3mf']`, `PAGE_SIZE = 24`

---

### Story 2.3: Upload Wizard Shell & Steps 1–2 (Files & Photos)

As a creator,
I want to open a guided upload wizard and complete the file and photo upload steps,
So that I have my model files and printed photos attached before filling in metadata.

**Acceptance Criteria:**

**Given** I am authenticated and click "Upload" in the Navbar
**When** I navigate to `/upload`
**Then** the `UploadWizard` opens at Step 1 (Files)
**And** the `WizardStepIndicator` shows 5 steps — Step 1 active (sage green), Steps 2–5 upcoming (gray)
**And** `aria-current="step"` is set on the active step indicator

**Given** I am on Step 1 (Files)
**When** I drag and drop a valid STL or 3MF file onto the `FileUploadZone`
**Then** the zone shows a drag-over state (sage green border, mint fill)
**And** after drop, a per-file upload progress bar appears while `POST /api/upload/files` runs
**And** on success, a checkmark and filename appear in the file list with a remove × button
**And** I can add multiple files; the "Continue" button enables when at least one file is uploaded

**Given** a dropped file is invalid (wrong type or over 25MB)
**When** the file is dropped
**Then** a specific inline error appears for that file: e.g., "Only STL and 3MF files are accepted" or "File exceeds the 25MB limit"
**And** the invalid file is not added to the list
**And** other valid files in the same drop are accepted normally

**Given** I click "Continue" from Step 1
**When** I move to Step 2 (Photos)
**Then** the `WizardStepIndicator` updates — Step 1 shows a checkmark (completed), Step 2 is active
**And** the `PhotoUploadZone` shows copy "Show off your printed result" with an explanation of the photo requirement
**And** the "Continue" button is disabled with a visible reason: "At least 1 photo required"

**Given** I upload at least one photo in Step 2
**When** the photo upload to `POST /api/upload/photos` completes
**Then** a thumbnail preview appears with a remove × button
**And** the "Continue" button enables

**Given** I navigate Back from any step
**When** I return to a previous step
**Then** all previously entered data (uploaded files, photos) is preserved via the Zustand `wizardStore`

---

### Story 2.4: Upload Wizard Steps 3–5 (Metadata, Tags, Preview, Publish)

As a creator,
I want to fill in my model's metadata and tags, preview the listing, consent to the license, and publish — or save as a draft to finish later,
So that my model goes live with complete, accurate information.

**Acceptance Criteria:**

**Given** I advance to Step 3 (Details)
**When** the `ModelMetadataForm` renders
**Then** visible labeled fields appear for: Title (required), Description (required), Layer Height in mm (required), Infill % (required), Supports Required (required, Yes/No select), Filament Type (required, select dropdown)
**And** helper text appears below relevant fields (e.g., "Layer height in mm, e.g. 0.2")
**And** "Continue" is disabled until all required fields are filled

**Given** I advance to Step 4 (Tags)
**When** the `TagSelector` renders
**Then** predefined category chip buttons are shown — clicking toggles them (sage green fill = selected, `role="checkbox"`)
**And** a custom tag text input allows me to type and press Enter to add a tag chip
**And** each added custom tag appears as a removable chip with a × button
**And** screen readers announce each added custom tag

**Given** I advance to Step 5 (Preview & Publish)
**When** the `PublishPreview` renders
**Then** I see a live preview of how my model card will appear in the grid
**And** I see a preview of the full model page with photos, metadata, and tags
**And** a license consent checkbox is shown with text: "I confirm this is my original work and grant free-to-download rights"
**And** "Publish" is disabled until the checkbox is checked

**Given** I check the license consent and click "Publish"
**When** `POST /api/models/[id]/publish` is called
**Then** the model's `is_published` is set to `1` and `is_draft` to `0` in the database
**And** I am redirected to the live model page at `/models/[id]`
**And** a success toast appears: "Your model is live!"

**Given** I click "Save Draft" at any step
**When** the draft save action runs
**Then** all current wizard state is persisted to `POST /api/models` (create) or `PATCH /api/models/[id]` (update)
**And** a quiet toast appears: "Draft saved"
**And** if I later return to `/upload` and have an existing draft, I am offered to resume it

**Given** a publish API call fails
**When** the error response is received
**Then** a system-level error toast appears with the specific message from the API response
**And** I remain on Step 5 — I am not sent back to Step 1

---

## Epic 3: Model Discovery & Browsing

Visitors can browse a grid of published models on the homepage, navigate by category, and search by name, tag, category, or uploader.

### Story 3.1: Search & Discovery Data Layer

As a developer,
I want the model list queries, category data, and FTS5 full-text search table in place,
So that the homepage grid, category pages, and search features have a typed data layer to build against.

**Acceptance Criteria:**

**Given** `lib/db/schema.sql` already contains the `models` and related tables from Story 2.1
**When** the schema update is applied
**Then** a `models_fts` FTS5 virtual table exists that indexes `title`, `description`, and concatenated tag values from `models` and `model_tags`
**And** a `download_events` table exists with columns: `id`, `model_id` (FK), `user_id` (FK), `downloaded_at INTEGER`
**And** `categories` table is populated with the platform's predefined category slugs and display names

**Given** `lib/db/models.ts` is updated
**When** list and search functions are called
**Then** it exports: `listPublishedModels({ page, limit, category?, sort? }): PaginatedResponse<Model>`, `getFeaturedModels(limit): Model[]`
**And** `sort` defaults to `download_count DESC`; also supports `created_at DESC`
**And** responses follow the `{ items, total, page, limit, hasMore }` shape

**Given** `lib/db/search.ts` is implemented
**When** search functions are called
**Then** it exports: `searchModels(query, filters): PaginatedResponse<Model>`, `getSearchSuggestions(query): SearchSuggestion[]`
**And** `searchModels` queries `models_fts` for full-text matches and applies `LIKE` for category/uploader filtering
**And** `getSearchSuggestions` returns up to 5 results grouped by type: Models, Tags, Creators
**And** `types/search.ts` defines `SearchQuery`, `SearchResult`, `SearchSuggestion` types

---

### Story 3.2: Model Card Component & Homepage Grid

As a visitor,
I want to browse a photo-dominant grid of published models on the homepage with a featured section,
So that I can quickly evaluate models by their real printed photos and find something worth downloading.

**Acceptance Criteria:**

**Given** the homepage at `/` is loaded
**When** the Server Component fetches data via `listPublishedModels` and `getFeaturedModels`
**Then** the page renders server-side (SSR) with a featured/trending row and a paginated model card grid below
**And** the initial page load completes in under 2 seconds on a standard broadband connection

**Given** the `ModelCard` component is implemented
**When** it renders a published model
**Then** the photo area occupies ~75% of the card height using `<Image>` with the `sizes` attribute for optimized delivery
**And** below the photo: model title (h3, max 2 lines truncated), download count, and one primary tag chip (sage green Badge)
**And** on hover: a subtle shadow lift and sage green border tint are applied
**And** the entire card surface is a clickable link to `/models/[id]`
**And** `role="article"` and `aria-label="{model title}"` are set; photo uses creator-provided alt text

**Given** the `ModelCardGrid` component is implemented
**When** it renders a list of models
**Then** the grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` responsive classes
**And** while data is loading, Skeleton cards matching the exact ModelCard dimensions are shown (no layout shift)
**And** the grid is identical in layout whether rendered on the homepage, category pages, search results, or profile pages

**Given** the homepage loads with no published models
**When** the grid renders
**Then** a neutral empty state message appears — no broken layout or JavaScript errors

---

### Story 3.3: Category Pages & Navigation

As a visitor,
I want to filter models by category from the homepage navigation and browse dedicated category pages,
So that I can find models relevant to a specific topic without searching.

**Acceptance Criteria:**

**Given** categories are seeded in the database
**When** the homepage and Navbar render
**Then** category filter pills are visible below the Navbar on the homepage (horizontally scrollable on mobile, no wrapping)
**And** the Navbar contains a visible path to category browsing accessible on all pages

**Given** I click a category pill on the homepage
**When** the filter is applied
**Then** the URL updates to reflect the selected category (e.g., `/?category=tools`) without a full page reload
**And** the model card grid refreshes to show only models in that category
**And** the selected pill shows sage green fill and white text; clicking it again clears the filter

**Given** I navigate to `/categories/[slug]`
**When** the Server Component fetches models for that category
**Then** the page is server-rendered and crawlable by search engines (no client-only rendering)
**And** the page title and meta description reflect the category name
**And** the same `ModelCardGrid` component renders with the category's models
**And** pagination works the same as the homepage grid

**Given** a category slug in the URL does not match any seeded category
**When** the page is requested
**Then** a `404` response is returned

---

### Story 3.4: Search Bar, Filters & Empty States

As a visitor,
I want to search for models by name, tag, category, or uploader from any page, and filter results by category,
So that I can find exactly what I'm looking for without browsing the entire grid.

**Acceptance Criteria:**

**Given** the `SearchBar` component is rendered in the Navbar (visible on all pages)
**When** I type 2 or more characters
**Then** a suggestion dropdown appears with results grouped: Models, Tags, Creators
**And** an inline spinner shows while suggestions are fetching
**And** full keyboard navigation works through suggestions (arrow keys to select, Enter to navigate, Escape to close)
**And** the input has sage green border on focus and `aria-live="polite"` on the suggestion list

**Given** I submit a search (press Enter or select a suggestion)
**When** the search results page renders
**Then** results are fetched via `GET /api/search?q=...` using the FTS5 `searchModels` function
**And** results default to sort by download count (Most Downloaded)
**And** a result count is displayed: e.g., "24 results for 'cable organizer'"
**And** the `ModelCardGrid` renders the results using the same consistent card component

**Given** search results are showing
**When** I interact with the `SearchFilters` component
**Then** a sort dropdown is visible: Most Downloaded (default), Newest, A–Z
**And** category filter pills allow single-select filtering (selecting one deselects the previous)
**And** all filter state is reflected in the URL (e.g., `?q=tools&category=workshop&sort=newest`)
**And** changing a filter updates results without a full page reload
**And** the URL is shareable and browser-back-safe

**Given** my search returns no results
**When** the empty state renders
**Then** the message "No models found for '[query]'" appears
**And** a "Clear filters" link and a "Browse all models" link are both visible
**And** no dead-end state is reachable — there is always a path forward

**Given** the mobile viewport (< 640px)
**When** the Navbar renders
**Then** a hamburger menu icon is visible; tapping it opens a drawer containing auth links and the Upload action
**And** the SearchBar is visible below the logo row (stacked layout, full width)
**And** category pills on the homepage scroll horizontally without wrapping

---

## Epic 4: Model Evaluation & Download

Visitors can evaluate a model from printed photos and structured print metadata; authenticated users download in one click; unauthenticated visitors are converted via a registration modal.

### Story 4.1: Model Detail Page

As a visitor,
I want to open a model page and see its printed photos, description, and structured print metadata above the fold,
So that I can confidently decide whether the model will work for my printer and settings before downloading.

**Acceptance Criteria:**

**Given** I click a model card or navigate directly to `/models/[id]`
**When** the Server Component fetches model data via `getModelById`
**Then** the page renders server-side with the model's photos, title, description, print metadata, and tags
**And** the page load completes in under 2 seconds
**And** photos below the first one lazy-load as I scroll

**Given** the `PrintMetadataBlock` component renders
**When** all four metadata fields are present
**Then** it displays a 2×2 grid as a `<dl>` description list: Layer Height (mm) · Infill % · Supports Required · Filament Type
**And** labels use the muted `label` text style (12px/500); values use `small` weight (14px/medium)
**And** any missing field shows "—" in muted style rather than an empty gap

**Given** the `PhotoGallery` component renders
**When** the model has multiple photos
**Then** a large primary photo is displayed with a thumbnail strip below and a photo count indicator (e.g., "1 / 3")
**And** prev/next navigation buttons appear when there are multiple photos
**And** clicking a photo opens a lightbox overlay (full-screen)
**And** in the lightbox: Escape key closes it, arrow keys navigate between photos, `aria-label="Photo {n} of {total}"` is set

**Given** I am on a desktop viewport (≥ 1024px)
**When** the model page renders
**Then** a two-column layout is used: large photo gallery on the left, print metadata block + Download CTA in the right sidebar
**And** the Download button is prominently positioned in the sidebar above the fold

**Given** I am on a mobile viewport (< 640px)
**When** the model page renders
**Then** the Download button is sticky at the bottom of the viewport (`position: sticky; bottom: 0`)
**And** photos and metadata are stacked full-width above it

**Given** `generateMetadata()` is implemented for the model page
**When** the page is crawled by a search engine or shared on social media
**Then** a unique `<title>`, `<meta name="description">`, `og:title`, `og:description`, and `og:image` (first model photo) are present per model
**And** no two model pages share identical metadata

**Given** I navigate to `/models/[id]` for a model ID that does not exist
**When** the Server Component cannot find the model
**Then** a `404` page is returned — no blank or error-thrown page

---

### Story 4.2: Download Flow & Registration Gate

As a visitor,
I want to download a model file in one click — and if I'm not yet registered, be prompted to create an account with minimal friction before the download proceeds automatically,
So that I get the file I came for without unnecessary steps.

**Acceptance Criteria:**

**Given** I am authenticated and click the `DownloadButton` on a model page
**When** `GET /api/download/[modelId]` is called
**Then** the server validates my session, increments `download_count` in the `models` table via `lib/db/downloads.ts`, and streams the model file with appropriate `Content-Disposition` headers
**And** the file download begins in under 1 second after the button click
**And** the button briefly shows a loading indicator during streaming; it never navigates away from the model page

**Given** I am unauthenticated and click the `DownloadButton`
**When** the click is handled client-side
**Then** the `RegistrationModal` opens over the current page — the model page remains visible behind the modal
**And** the modal header shows the model thumbnail and title so I know what I'm about to get
**And** a Register tab (default) and a Log In tab are both visible

**Given** I complete registration in the `RegistrationModal`
**When** account creation succeeds
**Then** the modal closes automatically and the download begins without any additional click
**And** a brief "Download started" toast appears
**And** `download_count` is incremented for this model

**Given** I switch to the Log In tab in the `RegistrationModal` and enter valid credentials
**When** sign-in succeeds
**Then** the modal closes and the download begins automatically — same behaviour as registration

**Given** I submit the registration form with an email already in use
**When** the API responds with `409`
**Then** an inline error appears below the Email field: "Email already in use — log in instead"
**And** a link switches me to the Log In tab without closing or reloading the modal

**Given** the `RegistrationModal` is open
**When** I press Escape or click the backdrop
**Then** the modal closes and I am returned to the model page — focus returns to the `DownloadButton`

**Given** the download Route Handler encounters an error
**When** the catch block runs
**Then** `console.error({ path, userId, modelId, error })` is logged before any response is returned
**And** the client receives `{ "error": "Download failed", "code": "INTERNAL_ERROR" }` with HTTP 500

---

## Epic 5: Creator Profiles & User Collections

Registered users have a public creator profile, a private download history, and can bookmark models for later.

### Story 5.1: Public Creator Profile Page

As a registered user,
I want a public profile page that showcases all the models I've published,
So that people who discover my work can browse everything I've shared and follow the link to download.

**Acceptance Criteria:**

**Given** I navigate to `/users/[username]`
**When** the Server Component fetches the user's published models via `listModelsByUser(userId, { publishedOnly: true })`
**Then** the page renders server-side with the creator's username, join date, and a `ModelCardGrid` of their published models
**And** the grid uses the same consistent `ModelCard` component as the homepage and category pages

**Given** the profile belongs to a creator who has published at least one model
**When** the page renders
**Then** all their published models appear in the grid in reverse-chronological order
**And** each card links to the model's detail page

**Given** I am viewing my own profile and have not uploaded anything
**When** the grid is empty
**Then** an empty state renders: "You haven't uploaded any models yet" with a prominent "Upload your first model" CTA button

**Given** I am viewing another user's profile and they have no published models
**When** the grid is empty
**Then** a neutral empty state renders: "No published models yet" — no upload CTA is shown

**Given** I am authenticated and viewing my own profile with zero published models
**When** a banner check runs server-side
**Then** an upload nudge banner renders above the grid: "Share your prints with the community — upload your first model" with an Upload CTA
**And** the banner does not appear for users who have at least one published model

**Given** I navigate to `/users/[username]` for a username that does not exist
**When** the Server Component queries the DB
**Then** a `404` page is returned

---

### Story 5.2: Download History Library

As an authenticated user,
I want to view all the models I've previously downloaded in a private library tab on my profile,
So that I can find and re-download files I've used before without searching again.

**Acceptance Criteria:**

**Given** I am authenticated and visit my own profile at `/users/[username]`
**When** the page renders
**Then** a `Tabs` component appears with two tabs: "Published" (default) and "Library"
**And** the "Library" tab is only visible to me — it does not appear when others view my profile

**Given** I click the "Library" tab
**When** the download history is fetched via `getDownloadHistory(userId)`
**Then** a grid of model cards renders showing every model I have downloaded, sorted by most recently downloaded
**And** each card links to the model's current detail page

**Given** I have not downloaded any models yet
**When** the Library tab renders
**Then** an empty state renders: "No downloads yet — browse models to find something to print" with a "Browse models" CTA

**Given** `lib/db/downloads.ts` is implemented
**When** it is imported
**Then** it exports: `incrementDownloadCount(modelId, userId): void`, `getDownloadHistory(userId): Model[]`
**And** `incrementDownloadCount` inserts a row into `download_events` and updates `models.download_count` atomically in a single transaction

---

### Story 5.3: Model Bookmarks

As a registered user,
I want to bookmark models I'm interested in so I can save them for later without downloading,
So that I can build a personal shortlist of models to print in future sessions.

**Acceptance Criteria:**

**Given** I am authenticated and viewing a model page
**When** I click the bookmark button
**Then** `POST /api/bookmarks` is called with `{ modelId }`
**And** a row is inserted into `user_bookmarks` via `lib/db/bookmarks.ts`
**And** the bookmark button visually toggles to a filled/active state
**And** a quiet toast appears: "Saved to Library"

**Given** I have already bookmarked a model and click the bookmark button again
**When** `DELETE /api/bookmarks?modelId=[id]` is called
**Then** the bookmark row is removed from `user_bookmarks`
**And** the button toggles back to the unfilled/inactive state
**And** a quiet toast appears: "Removed from Library"

**Given** I am unauthenticated and click the bookmark button on a model page
**When** the click is handled client-side
**Then** the `RegistrationModal` opens — reusing the same component from Epic 4
**And** after successful registration or login, the bookmark action completes automatically

**Given** `lib/db/bookmarks.ts` is implemented
**When** it is imported
**Then** it exports: `addBookmark(userId, modelId): void`, `removeBookmark(userId, modelId): void`, `getBookmarksByUser(userId): Model[]`, `isBookmarked(userId, modelId): boolean`
**And** `user_bookmarks` table schema: `user_id TEXT`, `model_id TEXT`, `created_at INTEGER`, PRIMARY KEY `(user_id, model_id)`

**Given** I visit my own Library tab (from Story 5.2)
**When** the page renders
**Then** bookmarked models appear in the same Library grid alongside downloaded models
**And** each bookmarked card is visually distinguishable (e.g., a bookmark chip or indicator)

---

## Epic 6: SEO, Sitemap & Pre-Launch Readiness

The platform is crawlable by search engines, has a sitemap, and contains 50+ quality-seeded models before public launch.

### Story 6.1: Sitemap, Robots & SEO Metadata Completeness

As a visitor arriving from a search engine,
I want every public model, category, and page to be discoverable and correctly described in search results,
So that I can find 3D Hub content through Google and other search engines without knowing the platform exists.

**Acceptance Criteria:**

**Given** `app/sitemap.ts` is implemented
**When** a search engine crawler requests `/sitemap.xml`
**Then** the sitemap includes URLs for: all published model pages (`/models/[id]`), all category pages (`/categories/[slug]`), the homepage (`/`), and any other public static pages
**And** the sitemap is dynamically generated — newly published models appear without a redeploy

**Given** `app/robots.ts` is implemented
**When** a crawler requests `/robots.txt`
**Then** it permits crawling of all public pages (`/`, `/models/*`, `/categories/*`, `/users/*`)
**And** it disallows crawling of `/upload`, `/api/*`, and auth pages

**Given** each public `page.tsx` has `generateMetadata()` implemented
**When** any public page is loaded in a browser or crawled
**Then** a unique `<title>` and `<meta name="description">` are present (not the Next.js default)
**And** `og:title`, `og:description`, and `og:image` Open Graph tags are present on model pages
**And** category pages have their own unique title and description (e.g., "Workshop Models — 3D Hub")
**And** the homepage has a descriptive title and meta description reflecting the platform's purpose

**Given** `app/api/files/[...path]/route.ts` is implemented
**When** a request is made for a stored photo or model file
**Then** the file is served from `lib/storage/` with correct `Content-Type` headers
**And** the filesystem path is never exposed in the URL or response body

---

### Story 6.2: Pre-Launch Quality Verification & Model Seeding

As the platform developer,
I want to seed the platform with 50+ quality models and verify all critical flows before opening to the public,
So that the first real visitor encounters a credible, fully populated platform with no blocking defects.

**Acceptance Criteria:**

**Given** the upload wizard (Epic 2) is fully functional
**When** the developer seeds models through the wizard
**Then** at least 50 models are published with: a real printed photo, a complete title and description, all four print metadata fields filled, at least one tag, and a valid category
**And** the homepage grid appears populated and credible — no empty or sparse sections visible on first load

**Given** a Lighthouse accessibility audit is run on the homepage, a model page, and the upload wizard
**When** the audit completes
**Then** the accessibility score is 90 or above on all three pages
**And** any score below 90 is treated as a launch blocker and fixed before proceeding

**Given** a keyboard-only navigation walkthrough is performed
**When** a tester completes both critical flows using only Tab, Enter, Escape, and arrow keys
**Then** the full consumer download flow is completable: homepage → model page → RegistrationModal → download
**And** the full creator upload flow is completable: `/upload` → wizard Steps 1–5 → publish
**And** no interactive element is unreachable by keyboard

**Given** the platform is tested across the supported browser matrix
**When** Chrome, Firefox, Safari, and Edge (latest 2 versions each) are tested on the homepage and model page
**Then** layout, photos, and core interactions render correctly in all four browsers
**And** mobile Chrome and Safari are tested on at least one real device (Android + iOS)
**And** any rendering defect is fixed before launch

**Given** all pre-launch checks are complete
**When** the developer reviews the platform
**Then** zero published models have missing photos, incomplete metadata, or broken file links
**And** server error logs show no recurring upload or download failures during seeding
