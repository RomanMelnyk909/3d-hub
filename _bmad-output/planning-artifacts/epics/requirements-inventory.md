# Requirements Inventory

## Functional Requirements

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

## NonFunctional Requirements

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

## Additional Requirements

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

## UX Design Requirements

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

## FR Coverage Map

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
