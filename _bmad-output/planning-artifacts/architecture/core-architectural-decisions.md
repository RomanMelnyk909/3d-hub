# Core Architectural Decisions

## Decision Priority Analysis

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

## Data Architecture

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

## Authentication & Security

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

## API & Communication Patterns

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

## Frontend Architecture

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

## Infrastructure & Deployment

**Hosting: Local only (V1)**
- No cloud deployment for V1 — running locally during development and initial use
- SQLite database file and `/uploads` directory persist on local machine
- VPS or similar deployment deferred until storage strategy is updated for Postgres + S3

**Logging: console.error / console.warn**
- Server-side errors logged via `console.error` in all Route Handlers
- No silent failures: every catch block in upload and download paths logs before returning error response
- Structured logging library (e.g., Pino) deferred to V2

---

## Decision Impact Analysis

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
