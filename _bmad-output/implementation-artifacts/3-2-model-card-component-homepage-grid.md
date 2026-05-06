# Story 3.2: Model Card Component & Homepage Grid

Status: ready-for-dev

## Story

As a visitor,
I want to browse a photo-dominant grid of published models on the homepage with a featured section,
so that I can quickly evaluate models by their real printed photos and find something worth downloading.

## Acceptance Criteria

1. **Given** the homepage at `/` is loaded
   **When** the Server Component fetches data via `listPublishedModels` and `getFeaturedModels`
   **Then** the page renders server-side (SSR) with a featured/trending row and a paginated model card grid below
   **And** the initial page load completes in under 2 seconds on a standard broadband connection

2. **Given** the `ModelCard` component is implemented
   **When** it renders a published model
   **Then** the photo area occupies ~75% of the card height using `<Image>` with the `sizes` attribute for optimized delivery
   **And** below the photo: model title (h3, max 2 lines truncated), download count, and one primary tag chip (sage green Badge)
   **And** on hover: a subtle shadow lift and sage green border tint are applied
   **And** the entire card surface is a clickable link to `/models/[id]`
   **And** `role="article"` and `aria-label="{model title}"` are set; photo uses model title as alt text

3. **Given** the `ModelCardGrid` component is implemented
   **When** it renders a list of models
   **Then** the grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` responsive classes
   **And** while data is loading, Skeleton cards matching the exact ModelCard dimensions are shown (no layout shift)
   **And** the grid is identical in layout whether rendered on the homepage, category pages, search results, or profile pages

4. **Given** the homepage loads with no published models
   **When** the grid renders
   **Then** a neutral empty state message appears — no broken layout or JavaScript errors

## Tasks / Subtasks

- [ ] Extend types and data layer to include photo + tag data for cards (AC: #1, #2)
  - [ ] Add `ModelCardData` interface to `types/model.ts` extending `Model` with `primaryPhotoFilename: string | null` and `primaryTagName: string | null`
  - [ ] Add optional `primary_photo_filename?: string | null` and `primary_tag_name?: string | null` to `DbModelRow` in `lib/db/models.ts`
  - [ ] Add `mapRowToModelCardData(row: DbModelRow): ModelCardData` helper function in `lib/db/models.ts`
  - [ ] Update `listPublishedModels` query to add correlated subqueries for photo + tag; change return type to `PaginatedResponse<ModelCardData>`
  - [ ] Update `getFeaturedModels` query to add correlated subqueries and use table alias `m`; change return type to `ModelCardData[]`

- [ ] Create `ModelCard` component (AC: #2)
  - [ ] Create `components/model/ModelCard.tsx` — Server Component (no `'use client'`)
  - [ ] Photo area: `<div className="relative aspect-square w-full overflow-hidden bg-muted">` with `<Image fill sizes="..." className="object-cover" />`
  - [ ] No-photo fallback: neutral placeholder div when `primaryPhotoFilename` is null
  - [ ] Info area: `<h3>` with `line-clamp-2`, download count with `.toLocaleString()`, sage green Badge for primary tag
  - [ ] Hover: `transition-all hover:shadow-md hover:border-brand-primary/30` on article wrapper
  - [ ] Full card content wrapped in `<Link href={/models/${model.id}}>` for clickability
  - [ ] `role="article"` and `aria-label={model.title}` on the article element

- [ ] Create `ModelCardGrid` component (AC: #3, #4)
  - [ ] Create `components/model/ModelCardGrid.tsx` — Server Component (no `'use client'`)
  - [ ] Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` — exact classes from AC
  - [ ] Empty state: neutral paragraph (`text-text-muted`) when `models.length === 0`
  - [ ] Render `<ModelCard>` for each model

- [ ] Create `(marketing)` route group with homepage (AC: #1, #3)
  - [ ] Create `app/(marketing)/` directory
  - [ ] Create `app/(marketing)/page.tsx` — SSR Server Component: calls `getFeaturedModels(6)` + `listPublishedModels({ page, sort: 'downloads' })`
  - [ ] Read `searchParams.page` for pagination; await `searchParams` (Next.js 15+: it's a Promise)
  - [ ] Featured section: horizontal scroll strip with up to 6 `ModelCard` items at fixed `w-48` width
  - [ ] Main section: `<ModelCardGrid models={result.items} />`
  - [ ] Pagination controls: prev/next links using `?page=N` URL params, shown only when applicable
  - [ ] **Delete `app/page.tsx`** — it conflicts with `app/(marketing)/page.tsx` at route `/`

- [ ] Create loading and error states (AC: #3)
  - [ ] Create `app/(marketing)/loading.tsx` — skeleton grid matching featured row + 12-card main grid
  - [ ] Create `app/(marketing)/error.tsx` — error boundary with `'use client'` and reset button

- [ ] Verify (AC: all)
  - [ ] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [ ] Production build: successful (`npm run build`)
  - [ ] ESLint: 0 errors (`npm run lint`)

## Dev Notes

### CRITICAL: Delete `app/page.tsx` Before Creating `app/(marketing)/page.tsx`

`app/page.tsx` (the Next.js boilerplate) and `app/(marketing)/page.tsx` BOTH map to route `/`. Next.js will throw a build error if both exist. **Delete `app/page.tsx`** as part of this story.

### CRITICAL: Story 3.1 Changes Are on Disk But NOT Committed

`git log` only shows commits through Story 2.4. Story 3.1 changes are uncommitted but already on disk:
- `lib/db/schema.sql` — has `models_fts`, `download_events`, indexes
- `lib/db/index.ts` — has try/catch ALTER TABLE for `category_id`
- `types/model.ts` — has `categoryId: string | null` on `Model`
- `lib/db/models.ts` — has `listPublishedModels`, `getFeaturedModels`, exported `mapRowToModel`/`DbModelRow`
- `lib/db/search.ts` — new file
- `types/search.ts` — new file

**Do NOT overwrite these files from scratch.** Read them first, then apply targeted modifications.

### `ModelCardData` Type — Add to `types/model.ts`

```typescript
// Add after the existing Model interface
export interface ModelCardData extends Model {
  primaryPhotoFilename: string | null  // null when model has no photos; used for /api/files/ URL
  primaryTagName: string | null        // null when model has no tags; shown as sage Badge on card
}
```

### Data Layer Changes — `lib/db/models.ts`

**Step 1 — Extend `DbModelRow`:**
```typescript
export interface DbModelRow {
  // ... all existing fields remain unchanged ...
  // Add at the end:
  primary_photo_filename?: string | null
  primary_tag_name?: string | null
}
```

**Step 2 — Add mapper function** (after `mapRowToModel`):
```typescript
function mapRowToModelCardData(row: DbModelRow): ModelCardData {
  return {
    ...mapRowToModel(row),
    primaryPhotoFilename: row.primary_photo_filename ?? null,
    primaryTagName: row.primary_tag_name ?? null,
  }
}
```

**Step 3 — Correlated subquery string** (define as a constant near the functions):
```typescript
const MODEL_CARD_FIELDS = `
  m.*,
  (SELECT filename FROM model_photos WHERE model_id = m.id ORDER BY display_order ASC LIMIT 1) AS primary_photo_filename,
  (SELECT t.name FROM tags t JOIN model_tags mt ON t.id = mt.tag_id WHERE mt.model_id = m.id LIMIT 1) AS primary_tag_name
`
```

**Step 4 — Update `listPublishedModels`** (change SELECT and return type):

```typescript
export function listPublishedModels(opts: ListPublishedModelsOptions = {}): PaginatedResponse<ModelCardData> {
  // ... page/limit/offset/orderBy/whereClause/params setup — unchanged ...

  // COUNT query stays simple (no subqueries needed for counting)
  const total = (db.prepare(
    `SELECT COUNT(*) as count FROM models m ${whereClause}`
  ).get(...params) as { count: number }).count

  // Data query uses MODEL_CARD_FIELDS with alias m
  const rows = db.prepare(
    `SELECT ${MODEL_CARD_FIELDS} FROM models m ${whereClause} ${orderByClause} LIMIT ? OFFSET ?`
  ).all(...params, limit, offset) as DbModelRow[]

  return {
    items: rows.map(mapRowToModelCardData),  // <-- changed from mapRowToModel
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
  }
}
```

**Step 5 — Update `getFeaturedModels`** (add alias and subqueries):
```typescript
export function getFeaturedModels(limit: number): ModelCardData[] {
  const safeLimit = Math.min(100, Math.max(1, limit))
  const rows = db.prepare(
    `SELECT ${MODEL_CARD_FIELDS} FROM models m WHERE m.is_published = 1 ORDER BY m.download_count DESC LIMIT ?`
  ).all(safeLimit) as DbModelRow[]
  return rows.map(mapRowToModelCardData)
}
```

Note: Current `getFeaturedModels` uses `models` without alias — the updated version uses alias `m` required by the subqueries. Also import `ModelCardData` type in `models.ts` if needed (it's in `types/model.ts` which already imports `Model`).

### Photo URL Construction

Photos are served via `GET /api/files/[...path]`. The `filename` stored in `model_photos` is a relative path like `models/abc123/photos/photo.jpg`. Construct URL as:

```typescript
const photoUrl = model.primaryPhotoFilename
  ? `/api/files/${model.primaryPhotoFilename}`
  : null
```

`next.config.ts` has `unoptimized: true` — `next/image` still provides layout/sizing utilities but skips server-side image optimization. This is correct for V1.

### `ModelCard` — Exact Implementation

```tsx
// components/model/ModelCard.tsx — Server Component, NO 'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import type { ModelCardData } from '@/types/model'

export function ModelCard({ model }: { model: ModelCardData }) {
  const photoUrl = model.primaryPhotoFilename
    ? `/api/files/${model.primaryPhotoFilename}`
    : null

  return (
    <article
      role="article"
      aria-label={model.title}
      className="flex flex-col bg-bg-card rounded-lg border border-border overflow-hidden transition-all hover:shadow-md hover:border-brand-primary/30"
    >
      <Link href={`/models/${model.id}`} className="flex flex-col h-full">
        {/* Photo area — aspect-square gives ~75% of total card height */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={model.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted text-xs">
              No photo
            </div>
          )}
        </div>
        {/* Info area */}
        <div className="flex flex-col gap-2 p-3 flex-1">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
            {model.title}
          </h3>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="text-xs text-text-muted">
              {model.downloadCount.toLocaleString()} downloads
            </span>
            {model.primaryTagName && (
              <Badge
                variant="secondary"
                className="text-xs shrink-0 bg-brand-light text-brand-primary hover:bg-brand-light"
              >
                {model.primaryTagName}
              </Badge>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
```

### `ModelCardGrid` — Exact Implementation

```tsx
// components/model/ModelCardGrid.tsx — Server Component, NO 'use client'
import { ModelCard } from './ModelCard'
import type { ModelCardData } from '@/types/model'

interface ModelCardGridProps {
  models: ModelCardData[]
}

export function ModelCardGrid({ models }: ModelCardGridProps) {
  if (models.length === 0) {
    return (
      <div className="py-16 text-center text-text-muted">
        <p>No models available yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {models.map(model => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  )
}
```

### `app/(marketing)/page.tsx` — Exact Implementation

```tsx
// app/(marketing)/page.tsx — Server Component
import { listPublishedModels, getFeaturedModels } from '@/lib/db/models'
import { ModelCard } from '@/components/model/ModelCard'
import { ModelCardGrid } from '@/components/model/ModelCardGrid'

interface HomePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams  // Next.js 15+: searchParams is a Promise
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const featured = getFeaturedModels(6)
  const result = listPublishedModels({ page, sort: 'downloads' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Featured / Trending row */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="mb-10">
          <h2 id="featured-heading" className="text-xl font-semibold text-text-primary mb-4">
            Trending
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {featured.map(model => (
              <div key={model.id} className="shrink-0 w-48">
                <ModelCard model={model} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main grid */}
      <section aria-labelledby="all-models-heading">
        <h2 id="all-models-heading" className="text-xl font-semibold text-text-primary mb-4">
          All Models
        </h2>
        <ModelCardGrid models={result.items} />

        {/* Pagination controls */}
        {(page > 1 || result.hasMore) && (
          <div className="mt-8 flex justify-center gap-6">
            {page > 1 && (
              <a href={`/?page=${page - 1}`} className="text-brand-primary hover:text-brand-hover underline">
                ← Previous
              </a>
            )}
            {result.hasMore && (
              <a href={`/?page=${page + 1}`} className="text-brand-primary hover:text-brand-hover underline">
                Next →
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
```

### `app/(marketing)/loading.tsx` — Skeleton Matching ModelCard Dimensions

Skeleton MUST match `ModelCard` exactly: `aspect-square` photo + p-3 info section.

```tsx
// app/(marketing)/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-bg-card rounded-lg border border-border overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Featured row skeleton */}
      <div className="mb-10">
        <Skeleton className="h-7 w-28 mb-4" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-48">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
      {/* Main grid skeleton */}
      <div>
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### `app/(marketing)/error.tsx`

```tsx
// app/(marketing)/error.tsx — MUST have 'use client' for Next.js error boundary
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="text-text-muted mb-4">Something went wrong loading the models.</p>
      <button
        onClick={reset}
        className="text-brand-primary hover:text-brand-hover underline"
      >
        Try again
      </button>
    </div>
  )
}
```

### Important: `components/model/` Directory

The `components/model/` directory does NOT exist yet. Create it as part of this story. Do NOT place `ModelCard.tsx` or `ModelCardGrid.tsx` in `components/ui/` (that is shadcn/ui only).

### Design Tokens Available in Tailwind

From `app/globals.css` `@theme` block:
| Token | Value | Tailwind Class |
|-------|-------|----------------|
| Brand primary | `#4A7C59` | `text-brand-primary`, `border-brand-primary`, `bg-brand-primary` |
| Brand hover | `#3A6347` | `hover:text-brand-hover` |
| Brand light | `#D4EDDA` | `bg-brand-light` |
| BG page | `#F8FAF8` | `bg-bg-page` |
| BG card | `#FFFFFF` | `bg-bg-card` |
| Text primary | `#111827` | `text-text-primary` |
| Text muted | `#6B7280` | `text-text-muted` |
| Border | `#E2EBE4` | `border-border` |

### File Structure

| File | Action | Notes |
|------|--------|-------|
| `types/model.ts` | MODIFY | Add `ModelCardData` interface after `Model` |
| `lib/db/models.ts` | MODIFY | Extend `DbModelRow`, add `MODEL_CARD_FIELDS`, add `mapRowToModelCardData`, update `listPublishedModels` + `getFeaturedModels` |
| `components/model/ModelCard.tsx` | CREATE | Server Component — no `'use client'` |
| `components/model/ModelCardGrid.tsx` | CREATE | Server Component — no `'use client'` |
| `app/(marketing)/page.tsx` | CREATE | SSR homepage — no `'use client'` |
| `app/(marketing)/loading.tsx` | CREATE | Skeleton grid — no `'use client'` |
| `app/(marketing)/error.tsx` | CREATE | Error boundary — requires `'use client'` |
| `app/page.tsx` | DELETE | Conflicts with `app/(marketing)/page.tsx` at `/` |

### Project Structure Notes

- `(marketing)` route group: directory name in parentheses is excluded from the URL; `app/(marketing)/page.tsx` maps to route `/`
- `components/model/` follows architecture spec: `ModelCard.tsx`, `ModelCardGrid.tsx` live here (NOT in `components/ui/`)
- `components/ui/` — shadcn/ui only; `Badge` and `Skeleton` are pre-installed, do not edit
- `error.tsx` MUST have `'use client'` — Next.js Error Boundary API requires it
- `loading.tsx` does NOT need `'use client'` — it's a pure Server Component rendering static HTML

### Tailwind v4 Notes

This project uses Tailwind v4 (`"tailwindcss": "^4"`). Configuration is in `globals.css` via `@theme` directive, not `tailwind.config.ts` (which doesn't exist). Custom utility classes like `bg-brand-primary`, `text-text-muted` etc. are generated from the `@theme` block — use these directly.

### Next.js Version Notes

Project uses Next.js `16.2.4` (beyond knowledge cutoff, but Next.js 15+ patterns apply):
- `searchParams` in page components is a `Promise` — must be `await`ed
- Server Components are the default; add `'use client'` only when strictly needed
- `loading.tsx` and `error.tsx` are special Next.js files recognized by the framework

### References

- Story ACs source: `_bmad-output/planning-artifacts/epics/epic-3-model-discovery-browsing.md` (Story 3.2 section)
- Architecture component map: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md` (`components/model/` section)
- Design tokens: `app/globals.css` (`@theme` block, lines 6–31)
- Implementation patterns: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`
- `listPublishedModels` + `getFeaturedModels` (to modify): `lib/db/models.ts:228-265`
- `mapRowToModel` (base for new mapper): `lib/db/models.ts:25-43`
- `DbModelRow` interface (to extend): `lib/db/models.ts:7-23`
- Badge component: `components/ui/badge.tsx` — use `variant="secondary"` + className override for sage green
- Skeleton component: `components/ui/skeleton.tsx`
- `PAGE_SIZE = 24`: `lib/constants.ts:3` — already imported in `models.ts`, do not redeclare
- Photo serving: `app/api/files/[...path]/route.ts`
- `next.config.ts:4` — `unoptimized: true`; `next/image` works but skips server optimization

## Dev Agent Record

### Agent Model Used

_to be filled by dev agent_

### Debug Log References

### Completion Notes List

### File List
