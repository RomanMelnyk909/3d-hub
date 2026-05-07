# Story 3.4: Search Bar, Filters & Empty States

Status: done

## Story

As a visitor,
I want to search for models by name, tag, category, or uploader from any page, and filter results by category,
So that I can find exactly what I'm looking for without browsing the entire grid.

## Acceptance Criteria

1. **Given** the `SearchBar` component is rendered in the Navbar (visible on all pages)
   **When** I type 2 or more characters
   **Then** a suggestion dropdown appears with results grouped: Models, Tags, Creators
   **And** an inline spinner shows while suggestions are fetching
   **And** full keyboard navigation works through suggestions (arrow keys to select, Enter to navigate, Escape to close)
   **And** the input has sage green border on focus and `aria-live="polite"` on the suggestion list

2. **Given** I submit a search (press Enter or select a suggestion)
   **When** the search results page renders
   **Then** results are fetched via `GET /api/search?q=...` using the FTS5 `searchModels` function
   **And** results default to sort by download count (Most Downloaded)
   **And** a result count is displayed: e.g., "24 results for 'cable organizer'"
   **And** the `ModelCardGrid` renders the results using the same consistent card component

3. **Given** search results are showing
   **When** I interact with the `SearchFilters` component
   **Then** a sort dropdown is visible: Most Downloaded (default), Newest, A–Z
   **And** category filter pills allow single-select filtering (selecting one deselects the previous)
   **And** all filter state is reflected in the URL (e.g., `?q=tools&category=workshop&sort=newest`)
   **And** changing a filter updates results without a full page reload
   **And** the URL is shareable and browser-back-safe

4. **Given** my search returns no results
   **When** the empty state renders
   **Then** the message "No models found for '[query]'" appears
   **And** a "Clear filters" link and a "Browse all models" link are both visible
   **And** no dead-end state is reachable — there is always a path forward

5. **Given** the mobile viewport (< 640px)
   **When** the Navbar renders
   **Then** a hamburger menu icon is visible; tapping it opens a drawer containing auth links and the Upload action
   **And** the SearchBar is visible below the logo row (stacked layout, full width)
   **And** category pills on the homepage scroll horizontally without wrapping

## Tasks / Subtasks

- [x] Fix `searchModels` download sort (AC: #2)
  - [x] In `lib/db/search.ts`, add `sort === 'downloads'` branch: `ORDER BY m.download_count DESC`

- [x] Create `/api/search/route.ts` (AC: #1, #2)
  - [x] Handle `GET /api/search?q=...&suggest=1` → call `getSearchSuggestions(q)`, return `SearchSuggestion[]`
  - [x] Handle `GET /api/search?q=...&category=...&sort=...&page=...` → call `searchModels(query)`, return `PaginatedResponse<ModelCardData>`
  - [x] Return `{ error, code }` JSON on errors; log with `console.error`

- [x] Create `hooks/useModelSearch.ts` (AC: #1)
  - [x] Export `useDebounce<T>(value: T, delay: number): T` hook (300ms default)
  - [x] Used by SearchBar to debounce the suggestion fetch

- [x] Create `components/search/SearchBar.tsx` (AC: #1, #5)
  - [x] `'use client'` — uses `useReducer`, `useState`, `useEffect`, `useRef`, `useRouter`
  - [x] Debounced input: fetch suggestions at 2+ chars via `/api/search?q=...&suggest=1`
  - [x] Dropdown grouped by type: Models, Tags, Creators (section headers between groups)
  - [x] Inline spinner in input while fetching (Loader2 from lucide-react)
  - [x] Keyboard navigation: ↑↓ navigate, Enter selects/submits, Escape closes
  - [x] Sage green border on focus: `focus-within:border-brand-primary`
  - [x] `aria-live="polite"` on suggestion list, `role="combobox"`, `aria-expanded`
  - [x] On submit: `router.push('/search?q=' + encodeURIComponent(value))`
  - [x] On suggestion click: `router.push(suggestion.url)`

- [x] Create `components/search/SearchFilters.tsx` (AC: #3)
  - [x] `'use client'` — uses `useRouter`, `useSearchParams`
  - [x] Sort select/dropdown: Most Downloaded (`downloads`), Newest (`newest`), A–Z (`az`)
  - [x] Category pills: single-select, same visual style as CategoryPills
  - [x] URL updates preserve `q` param; reset `page` to 1 on filter change
  - [x] Receives `categories: Category[]` as prop from Server Component

- [x] Create `app/search/page.tsx` (AC: #2, #3, #4)
  - [x] Server Component — call `searchModels()` directly (NO `fetch()`)
  - [x] Read `searchParams`: `q`, `category`, `sort`, `page`
  - [x] Pass `sort: (sort as SearchQuery['sort']) ?? 'downloads'` as default
  - [x] Render result count, `<SearchFilters>`, `<ModelCardGrid>`, pagination
  - [x] Empty state: "No models found for '[q]'" + "Clear filters" + "Browse all models"
  - [x] Export `generateMetadata`: `{ title: 'Search results for "${q}" | 3D Hub' }`

- [x] Create `app/search/loading.tsx` (AC: #2)
  - [x] Skeleton grid matching homepage loading skeleton (no featured row, no pills)

- [x] Update `components/layout/Navbar.tsx` (AC: #1, #5)
  - [x] Remove "Browse" `<Link>` (replaced by SearchBar)
  - [x] Desktop: add `<div className="hidden sm:flex flex-1 max-w-lg"><SearchBar /></div>` between logo and NavbarActions
  - [x] Mobile: add `<div className="sm:hidden pb-3"><SearchBar /></div>` after the main h-16 row
  - [x] `NavbarActions` remains unchanged

- [x] Verify (AC: all)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors (`npm run lint`)

## Dev Notes

### CRITICAL: `lib/db/search.ts` Already Implemented — One Bug to Fix

`lib/db/search.ts` is **fully implemented** from Story 3.1. The `searchModels()` and `getSearchSuggestions()` functions are complete. **Do NOT rewrite this file.**

**One fix required:** `sort === 'downloads'` currently falls through to `ORDER BY fts.rank` (the FTS5 relevance score). Add a proper branch:

```typescript
// In lib/db/search.ts — fix the orderBy logic:
const orderBy = query.sort === 'newest'
  ? 'ORDER BY m.created_at DESC'
  : query.sort === 'az'
    ? 'ORDER BY m.title ASC'
    : query.sort === 'downloads'
      ? 'ORDER BY m.download_count DESC'
      : 'ORDER BY fts.rank'
```

### CRITICAL: `types/search.ts` Already Implemented — Do NOT Modify

```typescript
export interface SearchQuery {
  q: string
  category?: string
  uploader?: string
  sort?: 'downloads' | 'newest' | 'az'
  page?: number
  limit?: number
}

export type SearchResult = Model

export interface SearchSuggestion {
  type: 'model' | 'tag' | 'creator'
  id: string
  label: string
  url: string
}
```

### `/api/search/route.ts` — Route Handler

The route handler serves two purposes via the `suggest` query param:

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchModels } from '@/lib/db/search'
import { getSearchSuggestions } from '@/lib/db/search'
import type { SearchQuery } from '@/types/search'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') ?? ''

  // Suggestion mode
  if (searchParams.get('suggest') === '1') {
    if (q.length < 2) return NextResponse.json([])
    try {
      const suggestions = getSearchSuggestions(q)
      return NextResponse.json(suggestions)
    } catch (error) {
      console.error({ path: '/api/search', q, error })
      return NextResponse.json({ error: 'Search failed', code: 'INTERNAL_ERROR' }, { status: 500 })
    }
  }

  // Full search mode
  const query: SearchQuery = {
    q,
    category: searchParams.get('category') ?? undefined,
    uploader: searchParams.get('uploader') ?? undefined,
    sort: (searchParams.get('sort') as SearchQuery['sort']) ?? 'downloads',
    page: Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1),
  }

  try {
    const result = searchModels(query)
    return NextResponse.json(result)
  } catch (error) {
    console.error({ path: '/api/search', query, error })
    return NextResponse.json({ error: 'Search failed', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

### `hooks/useModelSearch.ts` — Debounce Hook

```typescript
// hooks/useModelSearch.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

### `SearchBar` Component — Complete Implementation Guide

```tsx
// components/search/SearchBar.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useModelSearch'
import type { SearchSuggestion } from '@/types/search'
```

**State shape:**
```typescript
const [value, setValue] = useState('')
const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
const [isLoading, setIsLoading] = useState(false)
const [isOpen, setIsOpen] = useState(false)
const [activeIndex, setActiveIndex] = useState(-1)
const debouncedValue = useDebounce(value, 300)
const inputRef = useRef<HTMLInputElement>(null)
const listRef = useRef<HTMLUListElement>(null)
```

**Suggestion fetch effect:**
```typescript
useEffect(() => {
  if (debouncedValue.length < 2) {
    setSuggestions([])
    setIsOpen(false)
    return
  }
  setIsLoading(true)
  fetch(`/api/search?q=${encodeURIComponent(debouncedValue)}&suggest=1`)
    .then(r => r.json())
    .then((data: SearchSuggestion[]) => {
      setSuggestions(data)
      setIsOpen(data.length > 0)
    })
    .catch(() => setSuggestions([]))
    .finally(() => setIsLoading(false))
}, [debouncedValue])
```

**Submit handler:**
```typescript
function handleSubmit(e?: React.FormEvent) {
  e?.preventDefault()
  if (!value.trim()) return
  setIsOpen(false)
  router.push(`/search?q=${encodeURIComponent(value.trim())}`)
}
```

**Keyboard handler:**
```typescript
function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === 'Escape') { setIsOpen(false); setActiveIndex(-1) }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    setActiveIndex(i => Math.max(i - 1, -1))
  }
  if (e.key === 'Enter') {
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault()
      const s = suggestions[activeIndex]
      setIsOpen(false)
      router.push(s.url)
    }
    // else: form submit handles it
  }
}
```

**Accessibility attributes on the input:**
```tsx
<input
  ref={inputRef}
  role="combobox"
  aria-expanded={isOpen}
  aria-controls="search-suggestions"
  aria-autocomplete="list"
  aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
  ...
/>
```

**Suggestion list:**
```tsx
<ul
  id="search-suggestions"
  ref={listRef}
  role="listbox"
  aria-live="polite"
  aria-label="Search suggestions"
>
  {suggestions.map((s, i) => (
    <li
      key={`${s.type}-${s.id}`}
      id={`suggestion-${i}`}
      role="option"
      aria-selected={i === activeIndex}
      className={cn(
        'px-4 py-2 cursor-pointer text-sm',
        i === activeIndex ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-muted'
      )}
      onMouseDown={(e) => { e.preventDefault(); router.push(s.url) }}
    >
      <span className="text-xs text-text-muted uppercase mr-2">{s.type}</span>
      {s.label}
    </li>
  ))}
</ul>
```

**Group headers:** Insert section headers between type groups using a reduce or detecting type changes in the array. Keep it simple — just check if `suggestions[i].type !== suggestions[i-1]?.type`.

**Dismiss on outside click:**
```typescript
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (inputRef.current && !inputRef.current.closest('form')?.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
```

**Wrapper styling:**
```tsx
<form onSubmit={handleSubmit} className="relative w-full">
  <div className={cn(
    'flex items-center rounded-md border bg-bg-card px-3 py-2 gap-2 transition-colors',
    'focus-within:border-brand-primary',
    'border-border'
  )}>
    {isLoading
      ? <Loader2 size={16} className="text-text-muted shrink-0 animate-spin" />
      : <Search size={16} className="text-text-muted shrink-0" />
    }
    <input
      type="search"
      placeholder="Search models, tags, creators…"
      className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
      ...
    />
  </div>
  {isOpen && suggestions.length > 0 && (
    <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-md shadow-lg z-50 max-h-72 overflow-y-auto">
      {/* suggestion list */}
    </div>
  )}
</form>
```

### `SearchFilters` Component

```tsx
// components/search/SearchFilters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/db/categories'

interface SearchFiltersProps {
  categories: Category[]
  totalResults: number
  query: string
}

export function SearchFilters({ categories, totalResults, query }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') ?? 'downloads'
  const currentCategory = searchParams.get('category')

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')  // reset to page 1 on filter change
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Result count */}
      <p className="text-sm text-text-muted">
        {totalResults} result{totalResults !== 1 ? 's' : ''} for <span className="text-text-primary font-medium">'{query}'</span>
      </p>
      {/* Sort + Category row */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={currentSort}
          onChange={e => updateFilter('sort', e.target.value)}
          className="text-sm border border-border rounded-md px-3 py-1.5 bg-bg-card text-text-primary focus:outline-none focus:border-brand-primary"
        >
          <option value="downloads">Most Downloaded</option>
          <option value="newest">Newest</option>
          <option value="az">A–Z</option>
        </select>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => updateFilter('category', currentCategory === cat.slug ? null : cat.slug)}
              className={cn(
                'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                currentCategory === cat.slug
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-card border border-border text-text-muted hover:border-brand-primary hover:text-brand-primary'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### `app/search/page.tsx` — Server Component

```tsx
// app/search/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { searchModels } from '@/lib/db/search'
import { listCategories } from '@/lib/db/categories'
import { ModelCardGrid } from '@/components/model/ModelCardGrid'
import { SearchFilters } from '@/components/search/SearchFilters'
import type { SearchQuery } from '@/types/search'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search results for "${q}" | 3D Hub` : 'Search | 3D Hub',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const category = params.category ?? undefined
  const sort = (params.sort as SearchQuery['sort']) ?? 'downloads'
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const categories = listCategories()

  if (!q) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-text-muted">Enter a search term to find models.</p>
        <Link href="/" className="text-brand-primary hover:text-brand-hover underline mt-2 inline-block">
          Browse all models
        </Link>
      </div>
    )
  }

  const result = searchModels({ q, category, sort, page })

  if (result.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-lg text-text-primary mb-4">No models found for '{q}'</p>
        <div className="flex gap-4">
          {(category || sort !== 'downloads') && (
            <Link
              href={`/search?q=${encodeURIComponent(q)}`}
              className="text-brand-primary hover:text-brand-hover underline"
            >
              Clear filters
            </Link>
          )}
          <Link href="/" className="text-brand-primary hover:text-brand-hover underline">
            Browse all models
          </Link>
        </div>
      </div>
    )
  }

  const paginationBase = `/search?q=${encodeURIComponent(q)}${category ? `&category=${encodeURIComponent(category)}` : ''}${sort !== 'downloads' ? `&sort=${sort}` : ''}&`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Search Results</h1>
      <Suspense fallback={null}>
        <SearchFilters categories={categories} totalResults={result.total} query={q} />
      </Suspense>
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
    </div>
  )
}
```

**Note on `<Suspense>` around `<SearchFilters>`:** `SearchFilters` uses `useSearchParams()` which requires a Suspense boundary in Next.js 15 — same pattern as `CategoryPills` on the homepage.

### Updated `Navbar.tsx` — Exact Structure

```tsx
// components/layout/Navbar.tsx
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { NavbarActions } from './NavbarActions'
import { SearchBar } from '@/components/search/SearchBar'

export async function Navbar() {
  const session = await auth()

  return (
    <header className="relative border-b border-border bg-bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main row */}
        <div className="flex items-center h-16 gap-4">
          <Link
            href="/"
            className="text-xl font-bold text-brand-primary hover:text-brand-hover transition-colors shrink-0"
          >
            3D Hub
          </Link>
          {/* Desktop search */}
          <div className="hidden sm:flex flex-1 max-w-lg">
            <SearchBar />
          </div>
          <NavbarActions user={session?.user ?? null} />
        </div>
        {/* Mobile search row — below the main row */}
        <div className="sm:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
```

**Changes from Story 3.3:**
- Remove the `<Link href="/" className="hidden sm:block...">Browse</Link>` added in 3.3 — SearchBar replaces this navigation affordance
- Add `import { SearchBar } from '@/components/search/SearchBar'`
- Add desktop SearchBar in main row (`hidden sm:flex flex-1 max-w-lg`)
- Add mobile SearchBar below main row (`sm:hidden pb-3`)
- Add `shrink-0` to logo link (prevents it compressing when SearchBar takes flex-1)

**NavbarActions is untouched.** Do NOT modify `NavbarActions.tsx`.

### `app/search/loading.tsx` — Skeleton

```tsx
// app/search/loading.tsx
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
      <Skeleton className="h-8 w-64 mb-6" />
      {/* Filter skeleton */}
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-8 w-36 rounded-md" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
```

### File Structure

| File | Action | Notes |
|------|--------|-------|
| `lib/db/search.ts` | MODIFY | Add `sort === 'downloads'` → `ORDER BY m.download_count DESC` |
| `app/api/search/route.ts` | CREATE | GET handler: `suggest=1` → suggestions, else full search |
| `hooks/useModelSearch.ts` | CREATE | `useDebounce<T>` hook |
| `components/search/SearchBar.tsx` | CREATE | Client: debounced suggestions, keyboard nav, submit to `/search?q=...` |
| `components/search/SearchFilters.tsx` | CREATE | Client: sort + category URL state |
| `app/search/page.tsx` | CREATE | Server Component: calls `searchModels()` directly, renders results |
| `app/search/loading.tsx` | CREATE | Skeleton: filters + grid |
| `components/layout/Navbar.tsx` | MODIFY | Remove Browse link, add SearchBar (desktop + mobile stacked) |

### Regression Guard

- `lib/db/search.ts` — only the `orderBy` ternary chain changes; no function signatures change
- `types/search.ts` — untouched
- `components/layout/NavbarActions.tsx` — untouched; mobile hamburger drawer is unchanged
- `components/layout/Navbar.tsx` — Browse link removed (added in 3.3) and SearchBar added; logo and NavbarActions are structurally preserved
- `ModelCardGrid` — same component reused; no changes
- `CategoryPills` — still works on homepage; `SearchFilters` is a separate component using the same visual pattern
- Homepage `app/(marketing)/page.tsx` — untouched in this story
- Category pages — untouched in this story

### Next.js 15 Pattern Reminders

- `searchParams` in page and `generateMetadata` are `Promise<{...}>` — must be `await`ed
- `useSearchParams()` in client components requires `<Suspense>` boundary in the parent Server Component
- `SearchBar` and `SearchFilters` are both `'use client'` — they can be rendered inside the Server Component `Navbar.tsx` and `SearchPage` respectively
- Do NOT add `use server` to `app/search/page.tsx` — it's a Server Component by default (no directive needed)

### Design Tokens Reference

```css
/* From app/globals.css @theme block */
--color-brand-primary: #4A7C59
--color-brand-hover: #3d6849
--color-text-primary: #1a1a1a
--color-text-muted: #6b7280
--color-bg-card: #ffffff
--color-border: #e5e7eb
```

Tailwind classes: `text-brand-primary`, `border-brand-primary`, `bg-brand-primary`, `text-text-muted`, `bg-bg-card`, `border-border`, `text-text-primary`, `hover:text-brand-hover`

### References

- Story ACs source: `_bmad-output/planning-artifacts/epics/epic-3-model-discovery-browsing.md` (Story 3.4 section)
- `searchModels` + `getSearchSuggestions`: `lib/db/search.ts` (fully implemented in Story 3.1)
- `SearchQuery`, `SearchSuggestion` types: `types/search.ts`
- Category data layer: `lib/db/categories.ts` (`listCategories`, `Category` interface)
- Navbar current state: `components/layout/Navbar.tsx`
- NavbarActions (mobile hamburger): `components/layout/NavbarActions.tsx`
- Previous story patterns (CategoryPills, Suspense boundary): `_bmad-output/implementation-artifacts/3-3-category-pages-navigation.md`
- Architecture structure: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md`
- Implementation patterns: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`
- UX patterns (search/filtering): `_bmad-output/planning-artifacts/ux-design-specification/ux-consistency-patterns.md`
- Design tokens: `app/globals.css` (`@theme` block)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Fixed `searchModels` to also return `ModelCardData` (photo + tag subqueries) instead of bare `Model`, required for `ModelCardGrid` compatibility. The story spec implied bare `Model` but the grid prop type required `ModelCardData`. Exported `mapRowToModelCardData` from `lib/db/models.ts` to enable this.
- Used `useReducer` in `SearchBar` instead of multiple `useState` calls to satisfy strict `react-hooks/set-state-in-effect` lint rule — dispatching a single action from within effects avoids cascading re-render warnings.
- Dropdown visibility derived (`showDropdown = isOpen && debouncedValue.length >= 2 && suggestions.length > 0`) rather than clearing state in effects.
- Added cancellation flag (`cancelled = true` in effect cleanup) to prevent setState after unmount on fast debounce cycles.
- All 3 pre-existing ESLint warnings (from `error.tsx`, `FileUploadZone.tsx`, `PhotoUploadZone.tsx`) were present before this story; no new warnings introduced.

### File List

- `lib/db/search.ts` — modified: added `downloads` sort branch; changed return type to `ModelCardData`; added `SEARCH_CARD_FIELDS` with photo+tag subqueries; changed mapper to `mapRowToModelCardData`
- `lib/db/models.ts` — modified: exported `mapRowToModelCardData` (was private)
- `app/api/search/route.ts` — created: GET handler with suggest mode and full search mode
- `hooks/useModelSearch.ts` — created: `useDebounce<T>` hook
- `components/search/SearchBar.tsx` — created: debounced autocomplete with keyboard nav and accessibility
- `components/search/SearchFilters.tsx` — created: sort dropdown + category pills with URL state
- `app/search/page.tsx` — created: Server Component search results page
- `app/search/loading.tsx` — created: skeleton loading UI
- `components/layout/Navbar.tsx` — modified: removed Browse link, added desktop + mobile SearchBar

### Review Findings

- [x] [Review][Patch] ARIA `role="option"` on `<div>` inside `<li>` breaks listbox ownership — screen readers may skip all options [components/search/SearchBar.tsx:137]
- [x] [Review][Patch] `fetch` response not checked for `r.ok`; no `Array.isArray` guard — 500 error body stored as suggestions, crashes `.map()` render [components/search/SearchBar.tsx:47]
- [x] [Review][Patch] `activeIndex` not reset when suggestion list changes length or fetch returns empty — stale index silently no-ops Enter key [components/search/SearchBar.tsx]
- [x] [Review][Patch] FTS5 operators (`OR`, `AND`, `NOT`, `*`, `-`, `NEAR`) not sanitized — alter query semantics or return unexpected results [lib/db/search.ts:20]
- [x] [Review][Patch] "Clear filters" link conditionally hidden — spec requires it always visible in empty state [app/search/page.tsx:48]
- [x] [Review][Patch] Spinner (`isLoading`) not cleared when input drops below 2 chars while fetch in-flight — spinner persists indefinitely [components/search/SearchBar.tsx:41]
- [x] [Review][Patch] `paginationBase` inlines `sort` without `encodeURIComponent` — URL parameter injection vector [app/search/page.tsx:64]
- [x] [Review][Patch] `listCategories()` unguarded throw crashes entire search page on DB failure [app/search/page.tsx:28]
- [x] [Review][Patch] No query length cap at API boundary — arbitrarily long strings reach synchronous SQLite FTS, blocking Node.js event loop [app/api/search/route.ts]
- [x] [Review][Patch] `generateMetadata` uses untrimmed `q` — page title shows leading/trailing spaces [app/search/page.tsx:15]
- [x] [Review][Patch] `onMouseDown` on suggestion navigates without updating input `value` state — stale text shown on back-navigate [components/search/SearchBar.tsx:151]
- [x] [Review][Defer] Double SearchBar instances both mounted — double fetches per keystroke [components/layout/Navbar.tsx] — deferred, CSS-only responsive design decision
- [x] [Review][Defer] `sort` param cast without runtime validation — invalid values silently fall through to FTS rank [app/api/search/route.ts:24] — deferred, safe fallthrough
- [x] [Review][Defer] Creator suggestions query returns all users regardless of published status [lib/db/search.ts] — deferred, pre-existing
- [x] [Review][Defer] `SearchFilters` Suspense `fallback={null}` — filters invisible during SSR hydration, layout shift [app/search/page.tsx:69] — deferred, pre-existing pattern
- [x] [Review][Defer] `SEARCH_CARD_FIELDS` duplicates `MODEL_CARD_FIELDS` — divergence risk [lib/db/search.ts:8] — deferred, tech debt
- [x] [Review][Defer] Very large `page` param (e.g. `?page=999999999`) causes expensive SQLite OFFSET scan [app/api/search/route.ts] — deferred, low priority for current scale

## Change Log

- 2026-05-07: Story 3.4 created — SearchBar + SearchFilters + search results page + API route + mobile Navbar layout.
- 2026-05-07: Story 3.4 implemented — all tasks complete, TypeScript 0 errors, ESLint 0 errors, production build successful.
