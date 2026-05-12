# Deferred Work

## Deferred from: code review of 1-1-project-setup-design-system-foundation (2026-05-04)

- `@types/*` packages in `dependencies` instead of `devDependencies` — story spec directed `npm i` without `-D`; acceptable but worth fixing when dependency audit runs
- `next-auth@^5.0.0-beta.31` in production `dependencies` — project-level beta dependency; pin to a stable release when v5 goes GA
- Mobile menu has no focus trap or Escape key handler (`Navbar.tsx`) — story scoped it as "simple toggle for now"; address in Story 1.5 when Navbar becomes session-aware
- Mobile menu stays open when viewport resizes to ≥640px (`Navbar.tsx`) — polish item; add `useEffect` resize listener if UX requires it
- Mobile menu not closed on browser back/forward navigation (`Navbar.tsx`) — polish item; add `popstate` listener or use Next.js router events
- Footer copyright year frozen at build time — acceptable for v1; add client-side hydration if year-boundary accuracy becomes required
- `ALLOWED_MODEL_EXTENSIONS` is case-sensitive; `.STL`/`.3MF` won't match without normalization — upload handler must call `.toLowerCase()` before `includes()` check (Story 2.2)
- `DATABASE_PATH`/`UPLOAD_DIR` relative paths are CWD-dependent — acceptable for local deployment; revisit when deploying to VPS
- `NEXTAUTH_SECRET` placeholder string accepted by NextAuth without error — add startup validation (e.g., check length ≥ 32) in a future hardening pass
- `lang="en"` hardcoded on `<html>` — v1 is English only; update if i18n is added post-launch

## Deferred from: code review of 1-2-database-schema-user-data-layer (2026-05-04)

- Schema (`schema.sql`) re-executed on every connection — intentional `IF NOT EXISTS` design for v1; establish a migration strategy (e.g., numbered migration files or a tool like `node-sqlite-migrations`) before adding any non-idempotent `ALTER TABLE` or `INSERT` statements
- `createUser` throws raw `SqliteError` on UNIQUE constraint violation — Story 1.4 registration route must catch `SQLITE_CONSTRAINT_UNIQUE` and return a typed conflict response (HTTP 409)
- `SELECT *` with `as DbUserRow` unsafe cast in `getUserByEmail`/`getUserByUsername` — acceptable while schema is fully controlled; switch to explicit column list if query complexity or column count grows
- Module-scope DB singleton (`export const db = global.__db ?? createConnection()`) executes at import time — acceptable for local/VPS targets; add lazy initialization or a startup hook before deploying to serverless (Vercel) or multi-worker Docker environments
- `token.userId as string` cast without null guard in NextAuth session callback (`lib/auth.ts`) — add `token.userId ?? ''` or a proper guard before Story 1.5 when session persistence is hardened
- No `toPublicUser`/`toSessionUser` conversion helper in `lib/db/users.ts` — add when Story 1.4 first needs to return safe user data in an API response, to enforce the passwordHash exclusion at the type level

## Deferred from: code review of 1-3-authentication-infrastructure-route-protection (2026-05-04)

- `getUserByEmail` called without `await` inside `async authorize` — correct today with synchronous better-sqlite3; if the function is ever made async the `if (!user)` guard would pass a Promise (always truthy), bypassing auth; add a JSDoc `// synchronous — better-sqlite3` comment to make intent explicit
- `AUTH_SECRET` vs `NEXTAUTH_SECRET` env var name — `next-auth@5.0.0-beta.31` supports `NEXTAUTH_SECRET`; verify the correct name and update `.env.example` and `.env.local` when upgrading to next-auth GA (v5 stable reads `AUTH_SECRET` by default)
- `Session.user` TypeScript augmentation merges with rather than replaces the base NextAuth `{ name?, email?, image? }` type — `session.user.name` and `session.user.image` remain type-valid (both `undefined` at runtime); fix in a type-hardening pass using `Omit` or an explicit re-declaration that drops the base fields
- `authorized` callback in `lib/auth.config.ts` returns an HTML 302 redirect to `/login` for unauthenticated API requests — intentional per AC2 which targets browser navigation; if non-browser API clients are added (Story 2.2+), add a content-type check and return `Response.json({ error: 'Unauthorized' }, { status: 401 })` for `application/json` requests

## Deferred from: code review of 1-4-user-registration (2026-05-05)

- No rate limiting on `POST /api/auth/register` — endpoint enables email enumeration via 409 responses and bcrypt CPU exhaustion under parallel load; address with a rate-limiting middleware or edge-function guard before production launch
- Check-then-insert race condition for email/username uniqueness — no database transaction wraps the lookup + insert; SQLite UNIQUE constraint is the actual guard (throws, caught as 500); story explicitly accepts this as an extremely rare edge case; revisit with a wrapping transaction if the DB layer moves to PostgreSQL

## Deferred from: code review of 1-5-user-login-session-persistence (2026-05-05)

- Empty-string `userId` guard (`?? ''`) in `lib/auth.ts` creates a phantom session risk — if `user.id` or `token.userId` is ever null/undefined, a session with blank userId is issued rather than rejecting the auth; this is the intended minimal fix per the deferred-work note from Story 1.2; proper fix is narrowing the NextAuth `User.id` type to non-nullable or adding an explicit null return in the jwt callback
- Mobile drawer has no focus trap (`NavbarActions.tsx`) — keyboard users can tab into content behind the open drawer; a full WCAG 2.1 §2.1.2 compliant implementation would require a focus trap; story scope was limited to the Escape key handler
- `setState('idle')` before `router.push` in `LoginForm.tsx` allows a sub-frame window where the submit button re-enables — negligible in practice due to React batching; revisit if UX testing reveals a perceived double-submit issue
- `signIn` CredentialsSignin error code not server-side logged — error is intentionally collapsed to a generic message to prevent email enumeration; structured logging (e.g., Pino) deferred to V2 per architecture decisions
- Derived username collision loop runs only once in `app/api/auth/register/route.ts` — pre-existing from Story 1.4; a second collision throws a SQLite UNIQUE constraint error surfaced as 500; add a retry loop or deterministic suffix when the DB layer approaches scale

## Deferred from: code review of 2-1-model-database-schema-repository-layer (2026-05-05)

- `infillPercent` / `layer_height_mm` have no DB-level range constraints in `schema.sql` — application-layer validation (form/API) is the intended guard; add `CHECK` constraints if a data migration or integrity audit requires it
- `license` field is free-text `TEXT` with only a default value — no `CHECK (license IN (...))` in schema or union type in TypeScript; enforce valid values at the API layer when license options are finalized
- `is_published` + `is_draft` dual-column design — no `CHECK` constraint prevents `is_published = 1, is_draft = 1` simultaneously; `publishModel` sets both atomically so the risk is low; consider collapsing to a single `status` enum column if a future migration is needed

## Deferred from: code review of 2-2-file-photo-upload-apis-storage-abstraction (2026-05-05)

- `updateDraftModel`/`publishModel` have no `user_id` ownership filter — pre-existing from Story 2-1; Stories 2-3/2-4 API routes must add `AND user_id = ?` to their WHERE clauses or wrap DB calls with an ownership check before updating/publishing a model
- `/api/files/[...path]` intentionally unauthenticated — pre-publish draft files are publicly accessible by UUID; acceptable for V1 local; must add auth or signed-URL gating before VPS/CDN deployment to prevent enumeration of unpublished model assets

## Deferred from: code review of 2-3-upload-wizard-shell-steps-1-2-files-photos (2026-05-06)

- Duplicate file uploads not deduplicated — same file can be uploaded multiple times; server creates duplicate fileId entries per upload; add a dedup check in FileUploadZone against the store's files array before calling addFile
- res.json() on non-JSON server error response (e.g., HTML 500 page) throws before the `!res.ok` check, caught by outer try-catch, surfacing a generic "Upload failed" message — consider validating Content-Type header before calling res.json() for better error UX
- previewUrl from POST /api/upload/photos response passed directly to next/image src without client-side origin validation — architectural concern for when photo storage moves to external CDN/signed URLs; validate previewUrl is a relative path or known-origin URL
- No form or fieldset wrapper around upload zones — keyboard users cannot reach or activate file inputs via Enter/Return; address in a dedicated accessibility pass
- formatBytes utility defined locally in FileUploadZone.tsx — should be extracted to lib/utils if needed by PhotoUploadZone or other components

## Deferred from: code review of 2-4-upload-wizard-steps-3-5-metadata-tags-preview-publish (2026-05-06)

- `aria-live` region in `TagSelector.tsx` does not announce pre-existing chips restored from localStorage rehydration — minor a11y gap for resumed sessions; address in a dedicated accessibility pass
- `getModelById` uses `SELECT *` instead of an explicit column list in `lib/db/models.ts` — safe while schema is fully controlled; switch to explicit columns if query complexity grows
- `PREDEFINED_TAGS` IDs (`tag-001` through `tag-015`) in `lib/constants.ts` are hardcoded and must match DB seed values — `setModelTags` silently skips missing IDs; add a startup validation check before the DB grows divergent
- Storage path construction in `createModelFiles` (`lib/db/models.ts`) duplicates path logic from the storage layer — refactor to a shared path-builder utility before the path format changes
- No standalone `clearDraftId` store action — `reset()` clears `draftId` for the main flow, but edge paths (e.g. publish success without reset) may leave a stale `draftId`; add `clearDraftId` if those paths are introduced

## Deferred from: code review of 3-1-search-discovery-data-layer (2026-05-06)

- `models_fts` orphan rows on model deletion — FTS5 virtual tables don't participate in FK cascades; any future model-delete function must issue an explicit `DELETE FROM models_fts WHERE model_id = ?` before or alongside deleting the model row (`lib/db/schema.sql`)
- TOCTOU gap between `db.exec(schema)` and ALTER TABLE in `createConnection` — on concurrent cold-starts SQLite's file lock prevents corruption but the race error is silently caught; acceptable for single-process dev/VPS but flag if moving to multi-worker serverless (`lib/db/index.ts:~24-30`)
- Creator username enumeration via unauthenticated search suggestions — `getSearchSuggestions` exposes all usernames via LIKE query with no auth or rate limit; by design for a public creator-discovery platform; revisit if privacy requirements change (`lib/db/search.ts:~89-93`)

## Deferred from: code review of 3-3-category-pages-navigation (2026-05-07)

- Double `getCategoryBySlug` DB calls per request — `generateMetadata` and the page body each issue a separate prepared-statement query for the same slug; no deduplication (`app/categories/[slug]/page.tsx`)
- Prepared statements created inline instead of at module scope — `db.prepare()` inside `listCategories` and `getCategoryBySlug` recompiles on every call; move to module-level constants for performance (`lib/db/categories.ts`)
- No slug/category input length or format validation — URL params forwarded to SQL as-is; parameterized queries prevent injection but allow unbounded-length strings; add a format guard at the route level before going to production under load
- Loading skeleton hardcodes 6 pill skeletons — actual category count is 11; the mismatch causes minor CLS on homepage load (`app/(marketing)/loading.tsx`)
- Category page has no "All models" / deselect affordance — `/categories/[slug]` has no breadcrumb or back link to the unfiltered view; users must use the browser Back button or Navbar (`app/categories/[slug]/page.tsx`)
- Empty `categories` table renders an empty scrollable gap — `CategoryPills` outputs a `<div>` with margin/scroll styles but no children when DB has no categories; add `categories.length > 0` guard or an empty-state message (`components/model/CategoryPills.tsx`)

## Deferred from: code review of 3-2-model-card-component-homepage-grid (2026-05-07)

- `MODEL_CARD_FIELDS` SQL constant hardcodes table alias `m` — any future caller that omits `FROM models m` will get a runtime SQL error with no compile-time warning (`lib/db/models.ts:44`)
- `error.tsx` discards `error.digest` entirely — production incidents cannot be correlated with server logs; at minimum log to console or render in a `<details>` block (`app/(marketing)/error.tsx`)
- `ModelCardGrid` grid `<div>` has no ARIA role or label — screen reader users navigating by landmarks find nothing; consider `<ul>`/`<li>` structure or explicit role for accessibility (`components/model/ModelCardGrid.tsx:19`)
- Loading skeleton shows featured section unconditionally while page.tsx conditionally hides it when `getFeaturedModels` returns empty — causes minor layout shift when featured list is empty (`app/(marketing)/loading.tsx:22`)
- `<article>` wraps `<Link>` — article's border ring is outside the anchor hit target; sub-pixel UX impact but technically violates AC2 "entire card surface is a clickable link" (`components/model/ModelCard.tsx:12`)
- No `focus-within` on `<article>` — hover shadow/border styles do not activate on keyboard focus; add `focus-within:shadow-md focus-within:border-brand-primary/30` for keyboard users (`components/model/ModelCard.tsx:12`)
- Stale or oversized `?page=N` bookmark renders empty main grid with misleading "No models available yet" message instead of redirecting to page 1 (`app/(marketing)/page.tsx:39`)

## Deferred from: code review of 4-1-model-detail-page (2026-05-12)

- `/api/files/` endpoint is unauthenticated — draft/unpublished model photos publicly accessible by UUID; tracked in deferred-work from Story 2-2; must add auth or signed-URL gating before VPS/CDN deployment
- `db.prepare()` called inline inside `getModelPhotos`, `getModelFiles`, `getModelTagNames` — compiles a new SQLite statement on every invocation; move to module-level constants for performance (existing pattern in project)
- `SELECT *` with unchecked TypeScript cast in `getModelPhotos`/`getModelFiles` — schema column rename would silently produce undefined at runtime; switch to explicit column list if schema evolves
- `created_at * 1000` conversion without null guard in `getModelPhotos`/`getModelFiles` — `new Date(null).toISOString()` would throw; DB `NOT NULL` constraint is the actual guard; add explicit check if DB constraints are ever loosened
- Race condition between `generateMetadata` and page render — model could be deleted/unpublished in the milliseconds between the two `getModelById` calls; theoretical with synchronous single-file SQLite; accept or re-check model status in page if concurrent deletions become realistic
- `<h1>` title placed in right sidebar rather than spanning the full page width — layout design choice; download button is visible above fold on typical viewport heights; revisit if UX testing shows confusion
- Lightbox CLS concern — `<Image fill>` inside `max-w-4xl max-h-screen p-12` container; constraints mitigate layout shift but no explicit `aspect-ratio` on the wrapper
- `description` rendered with `whitespace-pre-wrap` but no `overflow-wrap: break-word` — very long unbroken strings can overflow container on narrow mobile viewports; add `break-words` class if content policy allows arbitrary descriptions
- Long tag names can overflow the `flex-wrap` badge container — no max-length validation at DB level; add `truncate` or `max-w-[Xrem]` to `<Badge>` if tag names can be user-defined
- Thumbnail strip has no scroll indicator for 10+ photo models — `overflow-x-auto` enables scrolling but no fade/arrow hints; UX improvement deferred

## Deferred from: code review of 3-4-search-bar-filters-empty-states (2026-05-07)

- Double SearchBar instances both mounted — desktop and mobile bars each fire a separate debounced fetch per keystroke; fix requires context-based shared state or dynamic rendering (`components/layout/Navbar.tsx`)
- `sort` parameter cast without runtime validation — invalid sort values silently fall through to FTS rank sort; add an allowlist check at both API and page boundary (`app/api/search/route.ts:24`, `app/search/page.tsx:25`)
- Creator suggestions query returns all users regardless of published status — users with no published models appear in autocomplete (`lib/db/search.ts`)
- `SearchFilters` Suspense `fallback={null}` — filter controls entirely absent during SSR/hydration pass, causing layout shift; replace with a skeleton fallback (`app/search/page.tsx:69`)
- `SEARCH_CARD_FIELDS` duplicates `MODEL_CARD_FIELDS` from `models.ts` — two identical SQL constant definitions; extract to shared constant if photo/tag query logic ever needs to change (`lib/db/search.ts:8`)
- Very large `page` parameter (e.g. `?page=999999999`) computes an enormous SQLite OFFSET, causing an expensive no-op table scan; add a max-page guard (`app/api/search/route.ts`, `app/search/page.tsx`)
