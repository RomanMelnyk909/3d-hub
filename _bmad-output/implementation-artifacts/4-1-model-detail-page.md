# Story 4.1: Model Detail Page

Status: done

## Story

As a visitor,
I want to open a model page and see its printed photos, description, and structured print metadata above the fold,
so that I can confidently decide whether the model will work for my printer and settings before downloading.

## Acceptance Criteria

1. **Given** I click a model card or navigate directly to `/models/[id]`
   **When** the Server Component fetches model data via `getModelById`
   **Then** the page renders server-side with the model's photos, title, description, print metadata, and tags
   **And** the page load completes in under 2 seconds
   **And** photos below the first one lazy-load as I scroll

2. **Given** the `PrintMetadataBlock` component renders
   **When** all four metadata fields are present
   **Then** it displays a 2×2 grid as a `<dl>` description list: Layer Height (mm) · Infill % · Supports Required · Filament Type
   **And** labels use the muted `label` text style (12px/500); values use `small` weight (14px/medium)
   **And** any missing field shows "—" in muted style rather than an empty gap

3. **Given** the `PhotoGallery` component renders
   **When** the model has multiple photos
   **Then** a large primary photo is displayed with a thumbnail strip below and a photo count indicator (e.g., "1 / 3")
   **And** prev/next navigation buttons appear when there are multiple photos
   **And** clicking a photo opens a lightbox overlay (full-screen)
   **And** in the lightbox: Escape key closes it, arrow keys navigate between photos, `aria-label="Photo {n} of {total}"` is set

4. **Given** I am on a desktop viewport (≥ 1024px)
   **When** the model page renders
   **Then** a two-column layout is used: large photo gallery on the left, print metadata block + Download CTA in the right sidebar
   **And** the Download button is prominently positioned in the sidebar above the fold

5. **Given** I am on a mobile viewport (< 640px)
   **When** the model page renders
   **Then** the Download button is sticky at the bottom of the viewport (`position: sticky; bottom: 0`)
   **And** photos and metadata are stacked full-width above it

6. **Given** `generateMetadata()` is implemented for the model page
   **When** the page is crawled by a search engine or shared on social media
   **Then** a unique `<title>`, `<meta name="description">`, `og:title`, `og:description`, and `og:image` (first model photo) are present per model
   **And** no two model pages share identical metadata

7. **Given** I navigate to `/models/[id]` for a model ID that does not exist or is not published
   **When** the Server Component cannot find the model
   **Then** a `404` page is returned — no blank or error-thrown page

## Tasks / Subtasks

- [x] Add three new functions to `lib/db/models.ts` (AC: #1)
  - [x] `getModelPhotos(modelId: string): ModelPhoto[]` — ordered by `display_order ASC`
  - [x] `getModelFiles(modelId: string): ModelFile[]` — ordered by `created_at ASC`
  - [x] `getModelTagNames(modelId: string): string[]` — tag names ordered by `t.name ASC`

- [x] Create `components/model/PrintMetadataBlock.tsx` (AC: #2)
  - [x] Server Component (no `'use client'`)
  - [x] Props: `model: Pick<Model, 'layerHeightMm' | 'infillPercent' | 'supportsRequired' | 'filamentType'>`
  - [x] Renders `<dl>` with 4 `<dt>`/`<dd>` pairs in a 2×2 grid
  - [x] Missing fields show "—" in `text-text-muted` style

- [x] Create `components/model/PhotoGallery.tsx` (AC: #1, #3)
  - [x] `'use client'`
  - [x] Props: `{ photos: ModelPhoto[]; modelTitle: string }`
  - [x] State: `currentIndex`, `lightboxOpen`
  - [x] First photo: `loading="eager"`; thumbnails and non-primary: `loading="lazy"`
  - [x] Thumbnail strip below primary (shown only when > 1 photo)
  - [x] Photo count indicator "1 / 3" in primary photo overlay
  - [x] Prev/next buttons in primary photo (shown only when > 1 photo)
  - [x] Click primary photo → open lightbox
  - [x] Lightbox: Escape closes, ← → arrow keys navigate, `aria-label="Photo {n} of {total}"` on the dialog
  - [x] Empty state (no photos): gray placeholder div with "No photos" text

- [x] Create `components/model/DownloadButton.tsx` (AC: #4, #5)
  - [x] `'use client'`
  - [x] Props: `{ modelId: string }`
  - [x] Story 4.1: renders full-width primary Button "Download" (stub — no download logic yet)
  - [x] Story 4.2 will wire up `GET /api/download/[modelId]` + `RegistrationModal`

- [x] Create `app/models/[id]/page.tsx` (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] Server Component — call `getModelById`, `getModelPhotos`, `getModelTagNames`, `getModelFiles` directly (NO `fetch()`)
  - [x] `params` is `Promise<{ id: string }>` — must be `await`ed (Next.js 15)
  - [x] Guard: `if (!model || !model.isPublished) notFound()` (prevents draft model exposure)
  - [x] `generateMetadata()` — title, description, og:title, og:description, og:image (first photo absolute URL via `NEXTAUTH_URL`)
  - [x] Desktop layout: `lg:grid lg:grid-cols-[1fr_320px] lg:gap-8`
  - [x] Left column: `<PhotoGallery>`, description, tags as `<Badge>` chips
  - [x] Right sidebar: h1 title, `<PrintMetadataBlock>`, `<DownloadButton>` (hidden on mobile: `hidden sm:block`)
  - [x] Mobile sticky download: `sm:hidden sticky bottom-0` wrapper around `<DownloadButton>`
  - [x] Add `pb-20 sm:pb-0` to page wrapper so mobile sticky doesn't hide content

- [x] Create `app/models/[id]/loading.tsx` (AC: #1)
  - [x] Skeleton: matches two-column desktop + stacked mobile layout
  - [x] Skeleton for photo area (aspect-square), title, 4 metadata fields, button

- [x] Create `app/models/[id]/error.tsx`
  - [x] `'use client'` — exports `default function Error({ reset }: { error: Error; reset: () => void })`
  - [x] Shows friendly error message + "Try again" button that calls `reset()`

- [x] Verify (AC: all)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build successful (`npm run build`)
  - [x] ESLint: 0 errors (`npm run lint`)

### Review Findings

- [x] [Review][Patch] Wrap getModelById and getModelPhotos with React.cache() to deduplicate across generateMetadata + page render — 4 SQLite queries reduced to 2 [`app/models/[id]/page.tsx`, `lib/db/models.ts`]
- [x] [Review][Patch] error.tsx missing `error` param destructure — spec signature requires `{ error: Error; reset: () => void }` but only `reset` is destructured [`app/models/[id]/error.tsx:3`]
- [x] [Review][Patch] generateMetadata returns { title: 'Model not found' } for unpublished/missing models — HTTP 200 with model title lets crawlers index draft model names [`app/models/[id]/page.tsx:16`]
- [x] [Review][Patch] PrintMetadataBlock labels don't match AC2 spec: "Layer Height" → "Layer Height (mm)", "Infill" → "Infill %", "Supports" → "Supports Required", "Filament" → "Filament Type" [`components/model/PrintMetadataBlock.tsx:10-13`]
- [x] [Review][Patch] loading.tsx missing pb-24 body padding and mobile sticky download placeholder — skeleton doesn't match the actual mobile layout [`app/models/[id]/loading.tsx`]
- [x] [Review][Patch] Lightbox opens without focus management — role="dialog" aria-modal="true" present but no autoFocus ref or focus trap; screen readers won't announce the dialog [`components/model/PhotoGallery.tsx:108-113`]
- [x] [Review][Patch] Lightbox Image missing sizes prop — Next.js defaults to 100vw, serving larger images than needed for the max-w-4xl container [`components/model/PhotoGallery.tsx:144`]
- [x] [Review][Defer] /api/files/ unauthenticated — pre-existing, tracked in deferred-work as cache-control hardening story [`components/model/PhotoGallery.tsx:35`] — deferred, pre-existing
- [x] [Review][Defer] db.prepare() called inline on every request — existing project pattern; move to module scope for perf [`lib/db/models.ts`] — deferred, pre-existing
- [x] [Review][Defer] SELECT * with unchecked cast in getModelPhotos/getModelFiles — existing pattern, safe while schema is controlled [`lib/db/models.ts`] — deferred, pre-existing
- [x] [Review][Defer] created_at * 1000 conversion without null guard — DB NOT NULL constraint is the guard; theoretical risk [`lib/db/models.ts`] — deferred, pre-existing
- [x] [Review][Defer] Race condition between generateMetadata and page render (model deleted in between) — theoretical with synchronous SQLite single-file DB [`app/models/[id]/page.tsx`] — deferred, pre-existing
- [x] [Review][Defer] h1 placement in right sidebar — layout works as designed; download button is above fold on typical viewport heights — deferred, pre-existing
- [x] [Review][Defer] Lightbox CLS concern — fill + max-w-4xl/max-h-screen constraints mitigate layout shift [`components/model/PhotoGallery.tsx:141`] — deferred, pre-existing
- [x] [Review][Defer] description without overflow-wrap/break-words — minor UX edge case for very long unbroken strings on narrow viewports [`app/models/[id]/page.tsx:54`] — deferred, pre-existing
- [x] [Review][Defer] Long tag names layout overflow — minor UX, no max-length validation at DB level [`app/models/[id]/page.tsx:62`] — deferred, pre-existing
- [x] [Review][Defer] Thumbnail strip scroll discoverability — overflow-x-auto but no scroll hint for 10+ photo models [`components/model/PhotoGallery.tsx:83`] — deferred, pre-existing

## Dev Notes

### CRITICAL: `getModelById` Does NOT Filter for Published — Guard in Page

`getModelById` in `lib/db/models.ts` returns **any** model, including drafts (line 155–159):
```typescript
// lib/db/models.ts:155 — current implementation
export function getModelById(id: string): Model | null {
  const row = db.prepare('SELECT * FROM models WHERE id = ?').get(id) as DbModelRow | undefined
  return row ? mapRowToModel(row) : null
}
```

**Do NOT modify `getModelById`** — it is used by the upload wizard which needs to fetch draft models.

In `app/models/[id]/page.tsx`, guard as follows:
```typescript
const model = getModelById(id)
if (!model || !model.isPublished) notFound()
```

### CRITICAL: Three New `lib/db/models.ts` Functions

Add these after the existing `listModelsByUser` function. All three use `db` from `./index` and return TypeScript types from `@/types/model`. The DB uses `snake_case` columns; map to `camelCase` TypeScript:

```typescript
// Add to lib/db/models.ts

export function getModelPhotos(modelId: string): ModelPhoto[] {
  const rows = db.prepare(
    'SELECT * FROM model_photos WHERE model_id = ? ORDER BY display_order ASC'
  ).all(modelId) as {
    id: string; model_id: string; filename: string; alt_text: string | null;
    display_order: number; created_at: number
  }[]
  return rows.map(row => ({
    id: row.id,
    modelId: row.model_id,
    filename: row.filename,
    altText: row.alt_text,
    displayOrder: row.display_order,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  }))
}

export function getModelFiles(modelId: string): ModelFile[] {
  const rows = db.prepare(
    'SELECT * FROM model_files WHERE model_id = ? ORDER BY created_at ASC'
  ).all(modelId) as {
    id: string; model_id: string; filename: string; file_size_bytes: number;
    original_name: string; created_at: number
  }[]
  return rows.map(row => ({
    id: row.id,
    modelId: row.model_id,
    filename: row.filename,
    fileSizeBytes: row.file_size_bytes,
    originalName: row.original_name,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  }))
}

export function getModelTagNames(modelId: string): string[] {
  const rows = db.prepare(
    'SELECT t.name FROM tags t JOIN model_tags mt ON t.id = mt.tag_id WHERE mt.model_id = ? ORDER BY t.name ASC'
  ).all(modelId) as { name: string }[]
  return rows.map(r => r.name)
}
```

`ModelPhoto` and `ModelFile` types already exist in `types/model.ts`. Do NOT create duplicate types.

### `PrintMetadataBlock` — Complete Implementation

Server Component; no `'use client'`. Import `cn` from `@/lib/utils`.

```tsx
// components/model/PrintMetadataBlock.tsx
import { cn } from '@/lib/utils'
import type { Model } from '@/types/model'

interface PrintMetadataBlockProps {
  model: Pick<Model, 'layerHeightMm' | 'infillPercent' | 'supportsRequired' | 'filamentType'>
}

export function PrintMetadataBlock({ model }: PrintMetadataBlockProps) {
  const fields = [
    { label: 'Layer Height', value: model.layerHeightMm !== null ? `${model.layerHeightMm} mm` : '—' },
    { label: 'Infill',       value: model.infillPercent !== null ? `${model.infillPercent}%`  : '—' },
    { label: 'Supports',     value: model.supportsRequired !== null ? (model.supportsRequired ? 'Yes' : 'No') : '—' },
    { label: 'Filament',     value: model.filamentType ?? '—' },
  ]

  return (
    <div>
      <h2 className="text-base font-semibold text-text-primary mb-3">Print Settings</h2>
      <dl className="grid grid-cols-2 gap-3">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[12px] font-[500] text-text-muted leading-none mb-1">{label}</dt>
            <dd className={cn('text-sm font-medium', value === '—' ? 'text-text-muted' : 'text-text-primary')}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
```

### `PhotoGallery` — Complete Implementation Guide

`'use client'`. Uses `ChevronLeft`, `ChevronRight`, `X` from `lucide-react`. Photo URLs via `/api/files/${encodeURIComponent(photo.filename)}` — same pattern as `ModelCard.tsx:8`.

```tsx
// components/model/PhotoGallery.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModelPhoto } from '@/types/model'

interface PhotoGalleryProps {
  photos: ModelPhoto[]
  modelTitle: string
}
```

**State:**
```typescript
const [currentIndex, setCurrentIndex] = useState(0)
const [lightboxOpen, setLightboxOpen] = useState(false)
```

**Navigation callbacks (stable refs for useEffect):**
```typescript
const prev = useCallback(() =>
  setCurrentIndex(i => (i > 0 ? i - 1 : photos.length - 1)), [photos.length])

const next = useCallback(() =>
  setCurrentIndex(i => (i < photos.length - 1 ? i + 1 : 0)), [photos.length])
```

**Keyboard effect (lightbox only):**
```typescript
useEffect(() => {
  if (!lightboxOpen) return
  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape')     { setLightboxOpen(false) }
    if (e.key === 'ArrowLeft')  { prev() }
    if (e.key === 'ArrowRight') { next() }
  }
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)
}, [lightboxOpen, prev, next])
```

**Photo URL helper:**
```typescript
const photoUrl = (p: ModelPhoto) => `/api/files/${encodeURIComponent(p.filename)}`
```

**Empty state:**
```tsx
if (photos.length === 0) {
  return (
    <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center text-text-muted text-sm">
      No photos
    </div>
  )
}
```

**Primary photo block:**
```tsx
<div
  className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted cursor-pointer"
  onClick={() => setLightboxOpen(true)}
>
  <Image
    src={photoUrl(photos[currentIndex])}
    alt={photos[currentIndex].altText ?? `${modelTitle} — photo ${currentIndex + 1}`}
    fill
    className="object-cover"
    loading="eager"
    sizes="(max-width: 1024px) 100vw, calc(100vw - 360px)"
  />
  {photos.length > 1 && (
    <>
      <button
        onClick={e => { e.stopPropagation(); prev() }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
        aria-label="Previous photo"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={e => { e.stopPropagation(); next() }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
        aria-label="Next photo"
      >
        <ChevronRight size={20} />
      </button>
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1} / {photos.length}
      </div>
    </>
  )}
</div>
```

**Thumbnail strip (only when > 1 photo):**
```tsx
{photos.length > 1 && (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {photos.map((photo, i) => (
      <button
        key={photo.id}
        onClick={() => setCurrentIndex(i)}
        className={cn(
          'relative shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors',
          i === currentIndex ? 'border-brand-primary' : 'border-border hover:border-brand-primary/50'
        )}
        aria-label={`View photo ${i + 1}`}
      >
        <Image
          src={photoUrl(photo)}
          alt={photo.altText ?? `${modelTitle} — thumbnail ${i + 1}`}
          fill
          className="object-cover"
          loading="lazy"
          sizes="64px"
        />
      </button>
    ))}
  </div>
)}
```

**Lightbox overlay:**
```tsx
{lightboxOpen && (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={`Photo ${currentIndex + 1} of ${photos.length}`}
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    onClick={() => setLightboxOpen(false)}
  >
    <button
      className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      aria-label="Close lightbox"
      onClick={() => setLightboxOpen(false)}
    >
      <X size={24} />
    </button>
    {photos.length > 1 && (
      <>
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
          aria-label="Previous photo"
          onClick={e => { e.stopPropagation(); prev() }}
        >
          <ChevronLeft size={32} />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
          aria-label="Next photo"
          onClick={e => { e.stopPropagation(); next() }}
        >
          <ChevronRight size={32} />
        </button>
      </>
    )}
    <div
      className="relative w-full h-full max-w-4xl max-h-screen p-12"
      onClick={e => e.stopPropagation()}
    >
      <Image
        src={photoUrl(photos[currentIndex])}
        alt={`Photo ${currentIndex + 1} of ${photos.length}`}
        fill
        className="object-contain"
        loading="eager"
      />
    </div>
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
      {currentIndex + 1} / {photos.length}
    </div>
  </div>
)}
```

Wrap the gallery output in a `<div className="space-y-3">`.

### `DownloadButton` — Story 4.1 Stub

`'use client'`. Story 4.2 will replace the body with auth-check logic and `RegistrationModal` integration.

```tsx
// components/model/DownloadButton.tsx
'use client'

import { Button } from '@/components/ui/button'

interface DownloadButtonProps {
  modelId: string
}

export function DownloadButton({ modelId: _modelId }: DownloadButtonProps) {
  // Story 4.2: wire up GET /api/download/[modelId] + RegistrationModal for unauthenticated visitors
  return (
    <Button className="w-full bg-brand-primary hover:bg-brand-hover text-white" size="lg">
      Download
    </Button>
  )
}
```

The `_modelId` prefix silences the unused-variable lint warning without removing the prop — story 4.2 will use it.

### `app/models/[id]/page.tsx` — Complete Implementation

```tsx
// app/models/[id]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { getModelById, getModelPhotos, getModelTagNames } from '@/lib/db/models'
import { PhotoGallery } from '@/components/model/PhotoGallery'
import { PrintMetadataBlock } from '@/components/model/PrintMetadataBlock'
import { DownloadButton } from '@/components/model/DownloadButton'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const model = getModelById(id)
  if (!model || !model.isPublished) return { title: 'Model not found | 3D Hub' }

  const photos = getModelPhotos(id)
  const base = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const ogImage = photos[0]
    ? `${base}/api/files/${encodeURIComponent(photos[0].filename)}`
    : undefined

  return {
    title: `${model.title} | 3D Hub`,
    description: model.description ?? undefined,
    openGraph: {
      title: model.title,
      description: model.description ?? undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params

  const model = getModelById(id)
  if (!model || !model.isPublished) notFound()

  const photos = getModelPhotos(id)
  const tags   = getModelTagNames(id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* Left column: gallery + description + tags */}
        <div className="space-y-6">
          <PhotoGallery photos={photos} modelTitle={model.title} />

          {model.description && (
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-2">About this model</h2>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {model.description}
              </p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-brand-light text-brand-primary hover:bg-brand-light"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar: title + metadata + desktop download */}
        <div className="mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <h1 className="text-2xl font-bold text-text-primary">{model.title}</h1>
            <PrintMetadataBlock model={model} />
            {/* Desktop only — mobile button is sticky at bottom */}
            <div className="hidden sm:block">
              <DownloadButton modelId={model.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky download — sticky bottom-0 per AC */}
      <div className="sm:hidden sticky bottom-0 -mx-4 px-4 py-3 bg-bg-card border-t border-border">
        <DownloadButton modelId={model.id} />
      </div>
    </div>
  )
}
```

**Notes:**
- `pb-24 sm:pb-8` gives extra padding on mobile so the sticky button doesn't cover the last content item
- `lg:sticky lg:top-24` keeps the sidebar metadata visible as user scrolls the left column
- `getModelFiles` is added to `lib/db/models.ts` for story 4.2 use — not needed in 4.1's page render

### `app/models/[id]/loading.tsx`

```tsx
// app/models/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="space-y-6">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
        <div className="mt-6 lg:mt-0 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
```

### `app/models/[id]/error.tsx`

```tsx
// app/models/[id]/error.tsx
'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h2>
      <p className="text-sm text-text-muted mb-4">Failed to load this model.</p>
      <button
        onClick={reset}
        className="text-brand-primary hover:text-brand-hover underline text-sm"
      >
        Try again
      </button>
    </div>
  )
}
```

### Next.js 15 Pattern Reminders

- `params` in both `generateMetadata` and `page` default export is `Promise<{ id: string }>` — must be `await`ed
- `notFound()` is imported from `next/navigation` (not `next/router`)
- No `'use server'` directive on `page.tsx` — Server Components by default without any directive
- `generateMetadata` runs on the server before the page renders; it can safely call `lib/db/` functions

### Regression Guard

- `lib/db/models.ts` — only ADDING 3 new exported functions; all existing functions unchanged
- `types/model.ts` — unchanged; `ModelPhoto` and `ModelFile` types already defined
- `components/model/ModelCard.tsx` — untouched; cards still link to `/models/${model.id}`
- `components/model/ModelCardGrid.tsx` — untouched
- `components/layout/Navbar.tsx` — untouched
- `app/(marketing)/page.tsx` — untouched
- `app/search/page.tsx` — untouched
- No changes to upload, auth, or search flows

### Design Tokens Reference

```css
/* app/globals.css @theme */
--color-brand-primary: #4A7C59
--color-brand-hover:   #3A6347
--color-brand-light:   #D4EDDA
--color-bg-card:       #FFFFFF
--color-bg-page:       #F8FAF8
--color-text-primary:  #111827
--color-text-muted:    #6B7280
--color-border:        #E2EBE4
```

Tailwind classes: `text-brand-primary`, `bg-brand-primary`, `hover:bg-brand-hover`, `bg-brand-light`, `text-text-primary`, `text-text-muted`, `bg-bg-card`, `border-border`

### File Structure

| File | Action | Notes |
|------|--------|-------|
| `lib/db/models.ts` | MODIFY | Add `getModelPhotos`, `getModelFiles`, `getModelTagNames` |
| `components/model/PrintMetadataBlock.tsx` | CREATE | Server Component, `<dl>` 2×2 grid |
| `components/model/PhotoGallery.tsx` | CREATE | `'use client'`, lightbox, keyboard nav |
| `components/model/DownloadButton.tsx` | CREATE | `'use client'`, stub (story 4.2 wires up logic) |
| `app/models/[id]/page.tsx` | CREATE | Server Component, `generateMetadata`, 404 guard |
| `app/models/[id]/loading.tsx` | CREATE | Skeleton matching two-column layout |
| `app/models/[id]/error.tsx` | CREATE | Error boundary |

### Previous Story Learnings (from Story 3.4)

- **`mapRowToModelCardData` export:** Story 3.4 exported this mapper from `lib/db/models.ts` — confirm it's exported (line 53) before using. Do NOT re-export or rename it.
- **`params` as Promise:** Both `generateMetadata` and page props use `Promise<{...}>` — always `await params` in Next.js 15. Confirmed working in story 3.4's `SearchPage`.
- **Suspense for `useSearchParams()`:** `PhotoGallery` and `DownloadButton` do NOT use `useSearchParams()`, so no Suspense boundary needed around them from the server component.
- **Lint pattern:** Use `_varName` prefix for unused function parameters to satisfy `@typescript-eslint/no-unused-vars` (see `DownloadButton` stub with `_modelId`).
- **ESLint pre-existing warnings:** Three pre-existing warnings exist in `error.tsx`, `FileUploadZone.tsx`, `PhotoUploadZone.tsx` — do not fix them and do not introduce new ones.

### References

- Epic 4 story requirements: `_bmad-output/planning-artifacts/epics/epic-4-model-evaluation-download.md`
- DB schema (model_photos, model_files, model_tags): `lib/db/schema.sql`
- Model types (Model, ModelPhoto, ModelFile): `types/model.ts`
- Existing `getModelById` and `mapRowToModel`: `lib/db/models.ts:155–160`
- Photo URL pattern: `components/model/ModelCard.tsx:8`
- Architecture structure rules: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md`
- Project structure: `_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md`
- Design tokens: `app/globals.css` (`@theme` block)
- UX component specs (PhotoGallery, PrintMetadataBlock, DownloadButton): `_bmad-output/planning-artifacts/ux-design-specification/component-strategy.md`
- Story 4.2 context (download flow + RegistrationModal): `_bmad-output/planning-artifacts/epics/epic-4-model-evaluation-download.md#Story-4.2`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Added `getModelPhotos`, `getModelFiles`, `getModelTagNames` to `lib/db/models.ts` — all three query existing schema tables with proper snake_case→camelCase mapping
- `PrintMetadataBlock` is a Server Component rendering a `<dl>` 2×2 grid; missing fields render "—" in muted style
- `PhotoGallery` is a Client Component with `currentIndex`/`lightboxOpen` state, `useCallback`-stabilised `prev`/`next` refs, keyboard effect scoped to lightbox-open only
- `DownloadButton` is a stub Client Component; `modelId` prop kept for story 4.2 wiring; lint suppressed via eslint-disable-next-line (ESLint config has no `argsIgnorePattern: ^_`)
- `app/models/[id]/page.tsx`: Server Component, awaits `params`, guards with `notFound()` for unpublished/missing models, `generateMetadata` builds unique OG tags per model
- Mobile sticky download uses `sm:hidden sticky bottom-0`; desktop download uses `hidden sm:block`; page wrapper adds `pb-24 sm:pb-8` to prevent content overlap
- TypeScript: 0 errors | ESLint: 0 errors, 3 pre-existing warnings unchanged | Production build: successful

### File List

- `lib/db/models.ts` (modified — added `getModelPhotos`, `getModelFiles`, `getModelTagNames`)
- `components/model/PrintMetadataBlock.tsx` (created)
- `components/model/PhotoGallery.tsx` (created)
- `components/model/DownloadButton.tsx` (created)
- `app/models/[id]/page.tsx` (created)
- `app/models/[id]/loading.tsx` (created)
- `app/models/[id]/error.tsx` (created)

## Change Log

- 2026-05-12: Implemented story 4.1 — model detail page with PhotoGallery (lightbox + keyboard nav), PrintMetadataBlock (2×2 dl grid), DownloadButton stub, Server Component page with generateMetadata + 404 guard, loading skeleton, and error boundary. Three new DB query functions added to lib/db/models.ts.
