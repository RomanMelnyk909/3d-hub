# Story 3.3: Category Pages & Navigation

Status: done

## Story

As a visitor,
I want to filter models by category from the homepage navigation and browse dedicated category pages,
so that I can find models relevant to a specific topic without searching.

## Acceptance Criteria

1. **Given** categories are seeded in the database
   **When** the homepage and Navbar render
   **Then** category filter pills are visible below the Navbar on the homepage (horizontally scrollable on mobile, no wrapping)
   **And** the Navbar contains a visible path to category browsing accessible on all pages

2. **Given** I click a category pill on the homepage
   **When** the filter is applied
   **Then** the URL updates to reflect the selected category (e.g., `/?category=tools`) without a full page reload
   **And** the model card grid refreshes to show only models in that category
   **And** the selected pill shows sage green fill and white text; clicking it again clears the filter

3. **Given** I navigate to `/categories/[slug]`
   **When** the Server Component fetches models for that category
   **Then** the page is server-rendered and crawlable by search engines (no client-only rendering)
   **And** the page title and meta description reflect the category name
   **And** the same `ModelCardGrid` component renders with the category's models
   **And** pagination works the same as the homepage grid

4. **Given** a category slug in the URL does not match any seeded category
   **When** the page is requested
   **Then** a `404` response is returned

## Tasks / Subtasks

- [x] Create `lib/db/categories.ts` data layer (AC: #1, #3, #4)
  - [x] Create `lib/db/categories.ts` with `Category` interface, `listCategories(): Category[]`, and `getCategoryBySlug(slug: string): Category | null`
  - [x] `listCategories` returns rows ordered alphabetically by name
  - [x] `getCategoryBySlug` returns `null` (not throws) when slug not found — caller uses this to drive `notFound()`

- [x] Create `CategoryPills` client component (AC: #1, #2)
  - [x] Create `components/model/CategoryPills.tsx` — **requires `'use client'`** for `useRouter`, `useSearchParams`, `usePathname`
  - [x] Active pill: `bg-brand-primary text-white`; inactive: `bg-bg-card border border-border text-text-muted hover:border-brand-primary hover:text-brand-primary`
  - [x] Clicking active pill calls `router.push` with `category` param deleted and `page` reset
  - [x] Clicking inactive pill calls `router.push` with `category=slug` set and `page` param deleted
  - [x] Wrapper: `flex gap-2 overflow-x-auto pb-2` — no wrapping, pills shrink-0, horizontally scrollable on mobile

- [x] Update homepage to support category filtering (AC: #1, #2)
  - [x] Update `HomePageProps.searchParams` type to `Promise<{ page?: string; category?: string }>`
  - [x] Read `params.category` from resolved searchParams and pass to `listPublishedModels({ category })`
  - [x] Call `listCategories()` and render `<CategoryPills>` between the featured section and the main grid section
  - [x] When a `category` filter is active, hide the featured row (it is category-agnostic; showing it while filtering is misleading)
  - [x] Update pagination links to preserve the `category` param in the URL (e.g., `/?category=tools&page=2`)
  - [x] Update `app/(marketing)/loading.tsx` to include a row of `<Skeleton>` pills above the grid

- [x] Create `/categories/[slug]` pages (AC: #3, #4)
  - [x] Create `app/categories/[slug]/page.tsx` — Server Component
  - [x] Export `generateMetadata({ params })`: await `params`, look up category by slug; if null return `{ title: 'Category Not Found' }`; otherwise return `{ title: '${category.name} | 3D Hub', description: 'Browse 3D printable models in the ${category.name} category on 3D Hub.' }`
  - [x] In default export: await `params`; call `getCategoryBySlug(slug)`; if null call `notFound()` (import from `next/navigation`)
  - [x] Read `page` from resolved `searchParams`, call `listPublishedModels({ category: slug, page })`
  - [x] Render `<h1>` with category name, `<ModelCardGrid>`, and pagination links using `?page=N` (category is fixed by the route, no need to preserve it in params here)
  - [x] Create `app/categories/[slug]/loading.tsx` — skeleton matching homepage grid (no featured row)

- [x] Update Navbar with Browse link (AC: #1)
  - [x] In `components/layout/Navbar.tsx`, add a "Browse" `<Link href="/">` between the logo and `<NavbarActions>` on desktop; do NOT add it to the mobile drawer (out of scope)
  - [x] Style: `text-sm text-text-muted hover:text-text-primary transition-colors`

- [x] Verify (AC: all)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors (`npm run lint`)

## Dev Notes

### CRITICAL: `listPublishedModels` Already Supports Category Filtering

`lib/db/models.ts` `listPublishedModels` already accepts `category?: string` (slug-based, via `SELECT id FROM categories WHERE slug = ?` subquery). **Do NOT change this function** — just pass the slug from searchParams.

```typescript
// Already implemented — no changes needed
if (opts.category) {
  whereClause += ' AND m.category_id = (SELECT id FROM categories WHERE slug = ?)'
  params.push(opts.category)
}
```

### Data Layer: `lib/db/categories.ts` — New File

```typescript
import { db } from './index'

export interface Category {
  id: string
  name: string
  slug: string
}

interface DbCategoryRow {
  id: string
  name: string
  slug: string
}

export function listCategories(): Category[] {
  const rows = db.prepare('SELECT id, name, slug FROM categories ORDER BY name ASC').all() as DbCategoryRow[]
  return rows.map(r => ({ id: r.id, name: r.name, slug: r.slug }))
}

export function getCategoryBySlug(slug: string): Category | null {
  const row = db.prepare('SELECT id, name, slug FROM categories WHERE slug = ?').get(slug) as DbCategoryRow | undefined
  return row ? { id: row.id, name: row.name, slug: row.slug } : null
}
```

The 11 seeded categories (from `lib/db/schema.sql`) are:
`home-organization`, `workshop-tools`, `art-decoration`, `hobby-gaming`, `electronics-tech`, `fashion-jewelry`, `outdoor-garden`, `toys-miniatures`, `education`, `automotive`, `other`

### `CategoryPills` — Client Component (Exact Implementation)

```tsx
// components/model/CategoryPills.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/db/categories'

interface CategoryPillsProps {
  categories: Category[]
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const activeCategory = searchParams.get('category')

  function selectCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeCategory === slug) {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    params.delete('page')  // reset to page 1 on category change
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {categories.map(cat => (
        <button
          key={cat.slug}
          onClick={() => selectCategory(cat.slug)}
          className={cn(
            'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            activeCategory === cat.slug
              ? 'bg-brand-primary text-white'
              : 'bg-bg-card border border-border text-text-muted hover:border-brand-primary hover:text-brand-primary'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
```

**Note:** `CategoryPills` receives `Category[]` from the Server Component — do NOT fetch categories inside the client component. The `cn` utility is at `@/lib/utils`.

### Homepage Update (`app/(marketing)/page.tsx`)

```tsx
import Link from 'next/link'
import { listPublishedModels, getFeaturedModels } from '@/lib/db/models'
import { listCategories } from '@/lib/db/categories'
import { ModelCard } from '@/components/model/ModelCard'
import { ModelCardGrid } from '@/components/model/ModelCardGrid'
import { CategoryPills } from '@/components/model/CategoryPills'

interface HomePageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const category = params.category ?? undefined

  const categories = listCategories()
  const featured = category ? [] : getFeaturedModels(6)  // hide featured when filtering
  const result = listPublishedModels({
    page,
    sort: 'downloads',
    category,
    excludeIds: featured.map(m => m.id),
  })

  // Build URL helper that preserves category param
  const paginationBase = category ? `/?category=${category}&` : '/?'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Featured row — only when no category filter is active */}
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

      {/* Category pills */}
      <div className="mb-6">
        <CategoryPills categories={categories} />
      </div>

      {/* Main grid */}
      <section aria-labelledby="all-models-heading">
        <h2 id="all-models-heading" className="text-xl font-semibold text-text-primary mb-4">
          {category ? (categories.find(c => c.slug === category)?.name ?? 'Models') : 'All Models'}
        </h2>
        <ModelCardGrid models={result.items} />

        {(page > 1 || result.hasMore) && (
          <div className="mt-8 flex justify-center gap-6">
            {page > 1 && (
              <Link href={`${paginationBase}page=${page - 1}`} className="text-brand-primary hover:text-brand-hover underline">
                ← Previous
              </Link>
            )}
            {result.hasMore && (
              <Link href={`${paginationBase}page=${page + 1}`} className="text-brand-primary hover:text-brand-hover underline">
                Next →
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
```

### `/categories/[slug]/page.tsx` — SSR Category Page

```tsx
// app/categories/[slug]/page.tsx — Server Component
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategoryBySlug } from '@/lib/db/categories'
import { listPublishedModels } from '@/lib/db/models'
import { ModelCardGrid } from '@/components/model/ModelCardGrid'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }
  return {
    title: `${category.name} | 3D Hub`,
    description: `Browse 3D printable models in the ${category.name} category on 3D Hub.`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const resolved = await searchParams
  const page = Math.max(1, parseInt(resolved.page ?? '1', 10) || 1)
  const result = listPublishedModels({ category: slug, page })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">{category.name}</h1>
      <ModelCardGrid models={result.items} />

      {(page > 1 || result.hasMore) && (
        <div className="mt-8 flex justify-center gap-6">
          {page > 1 && (
            <Link href={`/categories/${slug}?page=${page - 1}`} className="text-brand-primary hover:text-brand-hover underline">
              ← Previous
            </Link>
          )}
          {result.hasMore && (
            <Link href={`/categories/${slug}?page=${page + 1}`} className="text-brand-primary hover:text-brand-hover underline">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
```

### `/categories/[slug]/loading.tsx` — Skeleton

```tsx
// app/categories/[slug]/loading.tsx
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
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
```

### Homepage Loading Update (`app/(marketing)/loading.tsx`)

Add category pill skeletons between the featured row skeleton and the grid skeleton:

```tsx
{/* Category pills skeleton — add after featured row skeleton, before grid */}
<div className="flex gap-2 overflow-x-auto pb-2 mb-6">
  {Array.from({ length: 6 }).map((_, i) => (
    <Skeleton key={i} className="h-8 w-28 rounded-full shrink-0" />
  ))}
</div>
```

### Navbar Update (`components/layout/Navbar.tsx`)

Add a "Browse" `<Link>` to the desktop nav area only — between the Logo link and `<NavbarActions>`:

```tsx
// Add after the Logo Link, before NavbarActions
<Link
  href="/"
  className="hidden sm:block text-sm text-text-muted hover:text-text-primary transition-colors"
>
  Browse
</Link>
```

The mobile drawer (in NavbarActions.tsx) is already handled by the hamburger menu. Do NOT modify `NavbarActions.tsx` for this story.

### Next.js Version Notes

- `params` in page and `generateMetadata` are `Promise<{slug: string}>` — must be `await`ed (Next.js 15+ pattern)
- `searchParams` is a `Promise<{...}>` — must be `await`ed
- `notFound()` from `next/navigation` returns `never` — TypeScript knows everything after it is unreachable; do not add `return` after it

### Tailwind Notes

- `overflow-x-auto` + children with `shrink-0` + parent `flex` = horizontal scroll without wrap
- `-mx-4 px-4 sm:mx-0 sm:px-0` on the pills wrapper extends the scroll area to screen edge on mobile while keeping alignment on desktop
- `whitespace-nowrap` on pill buttons prevents multi-line wrapping

### File Structure

| File | Action | Notes |
|------|--------|-------|
| `lib/db/categories.ts` | CREATE | `Category` interface + `listCategories` + `getCategoryBySlug` |
| `components/model/CategoryPills.tsx` | CREATE | `'use client'` — URL-driven active state via `useSearchParams` |
| `app/(marketing)/page.tsx` | MODIFY | Add category searchParam, `listCategories()`, `<CategoryPills>`, preserve category in pagination links |
| `app/(marketing)/loading.tsx` | MODIFY | Add pill skeleton row |
| `app/categories/[slug]/page.tsx` | CREATE | SSR — `generateMetadata`, `notFound()`, `ModelCardGrid`, pagination |
| `app/categories/[slug]/loading.tsx` | CREATE | Skeleton grid only (no featured row) |
| `components/layout/Navbar.tsx` | MODIFY | Add "Browse" link (desktop only) |

### Regression Guard

- `listPublishedModels` signature is unchanged — `category` was already an optional field. No risk of breaking the homepage's existing no-filter behavior.
- `ModelCardGrid` is unchanged — same component reused on the category page.
- `ModelCard` is unchanged.
- `Navbar.tsx` change is additive — existing logo link and `NavbarActions` remain unchanged.
- `CategoryPills.tsx` is a new file — no regression risk.

### References

- Story ACs source: `_bmad-output/planning-artifacts/epics/epic-3-model-discovery-browsing.md` (Story 3.3 section)
- Category seed data: `lib/db/schema.sql` lines 108–119
- `listPublishedModels` with category filter: `lib/db/models.ts:251-258`
- Architecture structure (categories route): `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md` (`app/categories/[slug]/`)
- Design tokens: `app/globals.css` (`@theme` block, lines 6–17)
- Implementation patterns: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`
- Previous story (3.2) patterns: `_bmad-output/implementation-artifacts/3-2-model-card-component-homepage-grid.md`

### Review Findings

- [x] [Review][Decision] `router.push` vs `router.replace` for category pill navigation — resolved: keep `router.push`; each filter state is intentionally bookmarkable.

- [x] [Review][Patch] Add `<Suspense>` boundary around `<CategoryPills>` (`useSearchParams` requirement) [app/(marketing)/page.tsx]
- [x] [Review][Patch] Fix trailing `?` in URL when all params cleared in `selectCategory` [components/model/CategoryPills.tsx]
- [x] [Review][Patch] Add `aria-pressed` to category pill `<button>` elements [components/model/CategoryPills.tsx]
- [x] [Review][Patch] `encodeURIComponent` the `category` slug in `paginationBase` URL construction [app/(marketing)/page.tsx]

- [x] [Review][Defer] Double `getCategoryBySlug` calls in `generateMetadata` + page body [app/categories/[slug]/page.tsx] — deferred, pre-existing
- [x] [Review][Defer] Prepared statements not cached at module scope in `listCategories`/`getCategoryBySlug` [lib/db/categories.ts] — deferred, pre-existing
- [x] [Review][Defer] No slug/category input length or format validation before DB calls — deferred, pre-existing
- [x] [Review][Defer] Loading skeleton hardcodes 6 pill skeletons regardless of actual category count (minor CLS risk) [app/(marketing)/loading.tsx] — deferred, pre-existing
- [x] [Review][Defer] Category page has no "All"/deselect affordance to return to unfiltered view [app/categories/[slug]/page.tsx] — deferred, pre-existing
- [x] [Review][Defer] Empty `categories` DB returns an empty scrollable gap instead of hiding the pills row [components/model/CategoryPills.tsx] — deferred, pre-existing

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Created `lib/db/categories.ts` with `Category` interface, `listCategories()` (alphabetical), and `getCategoryBySlug()` (returns null on miss).
- Created `components/model/CategoryPills.tsx` — `'use client'` component; URL-driven active state via `useSearchParams`; toggle deselects active pill; always resets `page` param on change.
- Updated `app/(marketing)/page.tsx`: added `category` searchParam, calls `listCategories()`, renders `<CategoryPills>`, hides featured row when category filter active, preserves category in pagination links.
- Updated `app/(marketing)/loading.tsx`: added 6 pill skeleton items above the grid section.
- Created `app/categories/[slug]/page.tsx`: SSR Server Component with `generateMetadata`, `notFound()` on unknown slug, `ModelCardGrid` with pagination.
- Created `app/categories/[slug]/loading.tsx`: skeleton grid (no featured row).
- Updated `components/layout/Navbar.tsx`: added desktop-only "Browse" link (`hidden sm:block`) between logo and NavbarActions.
- TypeScript: 0 errors. ESLint: 0 errors (3 pre-existing warnings in unrelated files). Production build: successful.

### File List

- `lib/db/categories.ts` (created)
- `components/model/CategoryPills.tsx` (created)
- `app/(marketing)/page.tsx` (modified)
- `app/(marketing)/loading.tsx` (modified)
- `app/categories/[slug]/page.tsx` (created)
- `app/categories/[slug]/loading.tsx` (created)
- `components/layout/Navbar.tsx` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- 2026-05-07: Story 3.3 implemented — category data layer, CategoryPills client component, homepage category filtering, `/categories/[slug]` SSR pages with metadata + 404, Navbar Browse link, loading skeletons.
