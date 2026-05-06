# Story 2.3: Upload Wizard Shell & Steps 1–2 (Files & Photos)

Status: done

## Story

As a creator,
I want to open a guided upload wizard and complete the file and photo upload steps,
so that I have my model files and printed photos attached before filling in metadata.

## Acceptance Criteria

1. **Given** I am authenticated and click "Upload" in the Navbar
   **When** I navigate to `/upload`
   **Then** the `UploadWizard` opens at Step 1 (Files)
   **And** the `WizardStepIndicator` shows 5 steps — Step 1 active (sage green), Steps 2–5 upcoming (gray)
   **And** `aria-current="step"` is set on the active step indicator

2. **Given** I am on Step 1 (Files)
   **When** I drag and drop a valid STL or 3MF file onto the `FileUploadZone`
   **Then** the zone shows a drag-over state (sage green border, mint fill)
   **And** after drop, a per-file upload progress bar appears while `POST /api/upload/files` runs
   **And** on success, a checkmark and filename appear in the file list with a remove × button
   **And** I can add multiple files; the "Continue" button enables when at least one file is uploaded

3. **Given** a dropped file is invalid (wrong type or over 25MB)
   **When** the file is dropped
   **Then** a specific inline error appears for that file: e.g., "Only STL and 3MF files are accepted" or "File exceeds the 25MB limit"
   **And** the invalid file is not added to the list
   **And** other valid files in the same drop are accepted normally

4. **Given** I click "Continue" from Step 1
   **When** I move to Step 2 (Photos)
   **Then** the `WizardStepIndicator` updates — Step 1 shows a checkmark (completed), Step 2 is active
   **And** the `PhotoUploadZone` shows copy "Show off your printed result" with an explanation of the photo requirement
   **And** the "Continue" button is disabled with a visible reason: "At least 1 photo required"

5. **Given** I upload at least one photo in Step 2
   **When** the photo upload to `POST /api/upload/photos` completes
   **Then** a thumbnail preview appears with a remove × button
   **And** the "Continue" button enables

6. **Given** I navigate Back from any step
   **When** I return to a previous step
   **Then** all previously entered data (uploaded files, photos) is preserved via the Zustand `wizardStore`

## Tasks / Subtasks

- [x] Install zustand package (AC: all)
  - [x] `npm install zustand` — adds zustand v5.x to `dependencies`

- [x] Create `stores/wizardStore.ts` — Zustand wizard state (AC: #6)
  - [x] Define exported `WizardFile` interface: `{ fileId: string; filename: string; size: number }`
  - [x] Define exported `WizardPhoto` interface: `{ photoId: string; filename: string; previewUrl: string }`
  - [x] Define `WizardState` interface with: `currentStep: number`, `files: WizardFile[]`, `photos: WizardPhoto[]`, and all action functions
  - [x] Export `useWizardStore = create<WizardState>()((set) => ...)` using curried TypeScript pattern
  - [x] Implement all actions using immutable `set((state) => ...)` pattern per architecture rules
  - [x] Initial state: `currentStep: 1`, `files: []`, `photos: []`

- [x] Modify `components/layout/NavbarActions.tsx` — Add Upload link for authenticated users (AC: #1)
  - [x] Add `<Link href="/upload">Upload</Link>` styled as `buttonVariants({ variant: 'default' })` in the authenticated desktop nav
  - [x] Add the same link to the mobile drawer for authenticated users
  - [x] Place it before the username display in the nav order

- [x] Create `app/upload/page.tsx` — Upload wizard page (AC: #1)
  - [x] Server Component — NO `'use client'` directive
  - [x] Export `metadata: Metadata` with `title: 'Upload Model | 3D Hub'`
  - [x] Render `<UploadWizard />` inside a `max-w-2xl mx-auto px-4 py-8` container
  - [x] No `auth()` call needed — `middleware.ts` already protects `/upload`
  - [x] No DB calls in this story

- [x] Create `components/upload/WizardStepIndicator.tsx` — Step progress indicator (AC: #1, #4)
  - [x] `'use client'`
  - [x] Props: `currentStep: number` (1–5, 1-indexed)
  - [x] Hardcode 5 steps with labels: `['Files', 'Photos', 'Details', 'Tags', 'Preview']`
  - [x] Upcoming circle: `border-2 border-muted text-text-muted bg-bg-page`
  - [x] Active circle: `bg-brand-primary text-white`
  - [x] Completed circle: `bg-brand-primary text-white` with `<Check size={14} />` icon (lucide-react)
  - [x] Connecting line between adjacent steps: `bg-brand-primary` if step is completed, `bg-muted` otherwise
  - [x] Active step: `aria-current="step"` attribute; `role="tab"` on each step
  - [x] Step label below each circle: `text-brand-primary font-medium` for active, `text-text-muted` for others

- [x] Create `components/upload/FileUploadZone.tsx` — Step 1 file upload (AC: #2, #3)
  - [x] `'use client'`
  - [x] Import `useWizardStore` and destructure `files`, `addFile`, `removeFile`
  - [x] Import `ALLOWED_MODEL_EXTENSIONS`, `MAX_FILE_SIZE_BYTES` from `@/lib/constants`
  - [x] Import `AsyncState` type from `@/types/api`
  - [x] Local state: `isDragging: boolean`, `uploadStates: Map<string, { state: AsyncState; error?: string }>`
  - [x] Hidden `<input type="file" accept=".stl,.3mf" multiple ref={inputRef} />` — triggered by clicking the browse button
  - [x] `handleDragOver`: `e.preventDefault()`, set `isDragging(true)`
  - [x] `handleDragLeave`: only reset if `!e.currentTarget.contains(e.relatedTarget as Node)`
  - [x] `handleDrop`: `e.preventDefault()`, reset dragging, iterate `Array.from(e.dataTransfer.files)` → call `uploadFile` for each
  - [x] `uploadFile(file: File)`: client validate → fetch POST → update store/state
  - [x] Extension client check: `'.' + (file.name.split('.').pop() ?? '').toLowerCase()` — **NOT** `path.extname` (no Node.js `path` in browser)
  - [x] Size client check: `file.size > MAX_FILE_SIZE_BYTES` → error `'File exceeds the 25MB limit'`
  - [x] Upload via `FormData` + `fetch('/api/upload/files', { method: 'POST', body: formData })`
  - [x] Show loading animation per file while uploading; checkmark (✓) on success; red error text on failure
  - [x] Drop zone visual: `border-2 border-dashed rounded-lg` + when `isDragging`: `border-brand-primary bg-brand-light` (sage green border, mint fill)
  - [x] Uploaded files list: filename + size + remove `×` button calling `removeFile(fileId)`
  - [x] Multiple files dropped simultaneously: process each file independently (use `Array.from(files).forEach(uploadFile)`)
  - [x] If server returns an error response, display `data.error` (the human-readable message)

- [x] Create `components/upload/PhotoUploadZone.tsx` — Step 2 photo upload (AC: #4, #5)
  - [x] `'use client'`
  - [x] Import `useWizardStore` and destructure `photos`, `addPhoto`, `removePhoto`
  - [x] Import `MAX_FILE_SIZE_BYTES` from `@/lib/constants`
  - [x] Import `Image` from `next/image` for photo thumbnails
  - [x] Same drag-and-drop pattern as FileUploadZone
  - [x] `<input type="file" accept="image/jpeg,image/png,image/webp" multiple />`
  - [x] Client validation: `!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)` → error `'Only JPEG, PNG, and WebP images are accepted'`; size check → error `'File exceeds the 25MB limit'`
  - [x] Upload via `FormData` + `fetch('/api/upload/photos', { method: 'POST', body: formData })`
  - [x] On success: `addPhoto({ photoId: data.photoId, filename: data.filename, previewUrl: data.previewUrl })`
  - [x] Heading: `"Show off your printed result"`; subtext: `"Upload at least one photo of your printed model"`
  - [x] Thumbnail grid: `<Image src={photo.previewUrl} alt={photo.filename} width={80} height={80} className="rounded object-cover" />` with remove `×` button per photo
  - [x] `next.config.ts` already has `images: { unoptimized: true }` — no extra image config needed

- [x] Create `components/upload/UploadWizard.tsx` — Wizard shell (AC: #1–#6)
  - [x] `'use client'`
  - [x] Read `currentStep`, `files`, `photos`, `goToStep` from `useWizardStore`
  - [x] Render `<WizardStepIndicator currentStep={currentStep} />` at top
  - [x] Conditionally render step content: `currentStep === 1` → `<FileUploadZone />`; `currentStep === 2` → `<PhotoUploadZone />`; steps 3–5 → placeholder `<div className="py-16 text-center text-text-muted">Coming soon (Story 2.4)</div>`
  - [x] Back button: `currentStep > 1`; calls `goToStep(currentStep - 1)`
  - [x] Continue button: disabled logic: step 1 → `files.length === 0`; step 2 → `photos.length === 0`
  - [x] When Continue is disabled on step 2: show a visible reason below the button: `"At least 1 photo required"` (in `text-text-muted text-sm`)
  - [x] Continue button calls `goToStep(currentStep + 1)`; hide Continue on step 5
  - [x] Use `<Button>` from `@/components/ui/button`; Back uses `variant="ghost"`, Continue uses `variant="default"`

- [x] Verify (AC: all)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors, 0 warnings (`npm run lint`)
  - [ ] Manual: Open `/upload` while logged in — wizard at step 1, 5-step indicator visible
  - [ ] Manual: Drag a valid STL — zone turns green/mint on drag-over; file added to list with checkmark; Continue enables
  - [ ] Manual: Drop a `.exe` renamed `.stl` — inline error shows "Only STL and 3MF files are accepted" (server validates magic bytes and returns 422)
  - [ ] Manual: Drop a file > 25MB — inline error shows "File exceeds the 25MB limit" (client-side check fires first)
  - [ ] Manual: Click Continue → Step 2 loads, Step 1 circle shows checkmark, Step 2 circle is green, Continue disabled
  - [ ] Manual: Upload a JPEG — thumbnail appears; Continue enables
  - [ ] Manual: Click Back → Step 1 restores with uploaded files still listed
  - [ ] Manual: Upload link visible in Navbar for authenticated user; not shown when logged out

### Review Findings

- [x] [Review][Patch] Reset wizard store on mount — add useEffect reset() in UploadWizard so each /upload visit starts clean [components/upload/UploadWizard.tsx]
- [x] [Review][Patch] uploadStates keyed by filename collides when two files share the same name — second upload clobbers first entry's state silently [components/upload/FileUploadZone.tsx:25, components/upload/PhotoUploadZone.tsx:22]
- [x] [Review][Patch] No AbortController on fetch — in-flight uploads continue and call setState on unmounted component if user navigates away mid-upload [components/upload/FileUploadZone.tsx:51, components/upload/PhotoUploadZone.tsx:48]
- [x] [Review][Patch] Connecting line color off-by-one: `step <= currentStep` colors line entering active step as primary; should be `step < currentStep` per spec [components/upload/WizardStepIndicator.tsx:27]
- [x] [Review][Patch] Drag zone div has no accessible role or aria-label — screen readers cannot identify it as an interactive drop target [components/upload/FileUploadZone.tsx:98, components/upload/PhotoUploadZone.tsx:101]
- [x] [Review][Patch] WizardStepIndicator outer div missing `role="tablist"` — role="tab" children are ARIA-invalid without a tablist parent [components/upload/WizardStepIndicator.tsx:14]
- [x] [Review][Patch] goToStep accepts any integer with no bounds clamping — programmatic calls could set step <1 or >5 [stores/wizardStore.ts:33]
- [x] [Review][Patch] Drag-leave relatedTarget cast unsafe: `e.relatedTarget as Node` when relatedTarget is null (drag out of window) — add null check before contains() [components/upload/FileUploadZone.tsx:33, components/upload/PhotoUploadZone.tsx:30]
- [x] [Review][Patch] Max file size boundary — verified: client and server both use strict `>` against same constant; no mismatch (dismissed)
- [x] [Review][Patch] uploadStates Map grows unboundedly — success entries never cleared; re-uploading a same-name file skips loading indicator due to stale success entry [components/upload/FileUploadZone.tsx:84, components/upload/PhotoUploadZone.tsx:82]
- [x] [Review][Defer] Duplicate file uploads not deduplicated — same file uploadable multiple times [components/upload/FileUploadZone.tsx] — deferred, pre-existing
- [x] [Review][Defer] res.json() on non-JSON server error (HTML 500) caught by outer try-catch, degrades to generic "Upload failed" [components/upload/FileUploadZone.tsx:74] — deferred, pre-existing
- [x] [Review][Defer] previewUrl from API passed directly to Image src without client-side origin validation [components/upload/PhotoUploadZone.tsx:160] — deferred, pre-existing
- [x] [Review][Defer] No form/fieldset wrapper around upload zones — keyboard accessibility gap [components/upload/FileUploadZone.tsx:96] — deferred, pre-existing
- [x] [Review][Defer] formatBytes defined locally in FileUploadZone — move to lib/utils if reused [components/upload/FileUploadZone.tsx:15] — deferred, pre-existing

## Dev Notes

### CRITICAL: Install Zustand First

`zustand` is **NOT** in `package.json`. Install it before writing any store file:
```bash
npm install zustand
```
Architecture specifies Zustand v5.x. `npm install zustand` installs v5 currently.

### Zustand v5 Store Pattern for `stores/wizardStore.ts`

```typescript
import { create } from 'zustand'

export interface WizardFile {
  fileId: string
  filename: string
  size: number
}

export interface WizardPhoto {
  photoId: string
  filename: string
  previewUrl: string
}

interface WizardState {
  currentStep: number
  files: WizardFile[]
  photos: WizardPhoto[]
  addFile: (file: WizardFile) => void
  removeFile: (fileId: string) => void
  addPhoto: (photo: WizardPhoto) => void
  removePhoto: (photoId: string) => void
  goToStep: (step: number) => void
  reset: () => void
}

export const useWizardStore = create<WizardState>()((set) => ({
  currentStep: 1,
  files: [],
  photos: [],
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (fileId) => set((state) => ({ files: state.files.filter((f) => f.fileId !== fileId) })),
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  removePhoto: (photoId) => set((state) => ({ photos: state.photos.filter((p) => p.photoId !== photoId) })),
  goToStep: (step) => set({ currentStep: step }),
  reset: () => set({ currentStep: 1, files: [], photos: [] }),
}))
```

Rules from architecture:
- File path: `stores/wizardStore.ts` (NOT `lib/stores/` or `app/stores/`)
- Export name: `useWizardStore` (camelCase with `use` prefix per architecture naming convention)
- Curried TypeScript form `create<State>()((set) => ...)` — this is the Zustand v5 TypeScript-safe pattern
- No async logic in store — components call `addFile`/`addPhoto` after a successful fetch
- No persist middleware for Story 2.3 (resume draft is Story 2.4 scope)

### CRITICAL: No `node:path` in Client Components

Route Handlers run in Node.js and can `import path from 'node:path'`. **Client components run in the browser** — `path.extname` does not exist there. Use string splitting instead:

```typescript
// ✅ Browser-safe
const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()

// ❌ Server-only — will crash client bundle
import path from 'node:path'
const ext = path.extname(file.name).toLowerCase()
```

### File Upload Fetch Pattern in FileUploadZone

```typescript
import { ALLOWED_MODEL_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import type { AsyncState } from '@/types/api'

// Local component state — NOT in Zustand (transient UI state only)
const [uploadStates, setUploadStates] = useState<Map<string, { state: AsyncState; error?: string }>>(new Map())

async function uploadFile(file: File) {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()

  // Client pre-validation (mirrors server-side checks — fast fail before network)
  if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
    setUploadStates(prev => new Map(prev).set(file.name, {
      state: 'error',
      error: 'Only STL and 3MF files are accepted',
    }))
    return
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    setUploadStates(prev => new Map(prev).set(file.name, {
      state: 'error',
      error: 'File exceeds the 25MB limit',
    }))
    return
  }

  setUploadStates(prev => new Map(prev).set(file.name, { state: 'loading' }))

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/files', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setUploadStates(prev => new Map(prev).set(file.name, {
        state: 'error',
        error: data.error ?? 'Upload failed',
      }))
      return
    }

    // data = { fileId, filename, size } per Story 2.2 API contract
    addFile({ fileId: data.fileId, filename: data.filename, size: data.size })
    setUploadStates(prev => new Map(prev).set(file.name, { state: 'success' }))
  } catch {
    setUploadStates(prev => new Map(prev).set(file.name, { state: 'error', error: 'Upload failed' }))
  }
}

// For multiple files dropped at once:
function handleDrop(e: React.DragEvent) {
  e.preventDefault()
  setIsDragging(false)
  Array.from(e.dataTransfer.files).forEach(uploadFile)
}
```

### Photo Upload Fetch Pattern in PhotoUploadZone

```typescript
const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Client pre-validation
if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type)) {
  // error: 'Only JPEG, PNG, and WebP images are accepted'
  return
}
if (file.size > MAX_FILE_SIZE_BYTES) {
  // error: 'File exceeds the 25MB limit'
  return
}

// Upload
const formData = new FormData()
formData.append('file', file)
const res = await fetch('/api/upload/photos', { method: 'POST', body: formData })
const data = await res.json()
// data = { photoId, filename, previewUrl } per Story 2.2 API contract

// On success:
addPhoto({ photoId: data.photoId, filename: data.filename, previewUrl: data.previewUrl })
```

### Drag-and-Drop Implementation (no external library)

```typescript
const [isDragging, setIsDragging] = useState(false)

function handleDragOver(e: React.DragEvent) {
  e.preventDefault()
  setIsDragging(true)
}

function handleDragLeave(e: React.DragEvent) {
  // Guard: only reset if leaving the zone itself, not a child element
  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
    setIsDragging(false)
  }
}

function handleDrop(e: React.DragEvent) {
  e.preventDefault()
  setIsDragging(false)
  Array.from(e.dataTransfer.files).forEach(uploadFile)
}
```

Drop zone styling (Tailwind tokens from `globals.css`):
```tsx
<div
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  className={cn(
    'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
    isDragging ? 'border-brand-primary bg-brand-light' : 'border-border hover:border-brand-primary/50',
  )}
>
```
- `border-brand-primary` = sage green `#4A7C59`
- `bg-brand-light` = mint fill `#D4EDDA`
- `border-border` = default `#E2EBE4`
- `cn` is imported from `@/lib/utils` (already used throughout the project)

### WizardStepIndicator Visual States

```tsx
// Circle states:
const isCompleted = step < currentStep
const isActive = step === currentStep

<div
  className={cn(
    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2',
    isCompleted && 'bg-brand-primary border-brand-primary text-white',
    isActive && 'bg-brand-primary border-brand-primary text-white',
    !isCompleted && !isActive && 'bg-bg-page border-muted text-text-muted',
  )}
  aria-current={isActive ? 'step' : undefined}
>
  {isCompleted ? <Check size={14} /> : step}
</div>

// Connecting line between steps n and n+1:
<div className={cn('flex-1 h-0.5', step < currentStep ? 'bg-brand-primary' : 'bg-muted')} />

// Step label below circle:
<span className={cn('text-xs mt-1', isActive ? 'text-brand-primary font-medium' : 'text-text-muted')}>
  {label}
</span>
```

### Continue Button Disabled Reason (Step 2)

The AC requires "Continue button is disabled with a visible reason: 'At least 1 photo required'". Implement as visible text, not just `title` attribute:

```tsx
{currentStep === 2 && photos.length === 0 && (
  <p className="text-sm text-text-muted text-center mt-2">At least 1 photo required</p>
)}
```

### Auth in `app/upload/page.tsx`

Route `/upload` is in the `middleware.ts` matcher:
```typescript
matcher: ['/upload', '/api/upload/:path*', ...]
```
Unauthenticated users are redirected to `/login` by the middleware. **No `auth()` call needed in the page.tsx**.

### NavbarActions.tsx — Upload Link Placement

Add the Upload link inside the `{user ? (...)  : (...)}` block for authenticated users.

Desktop nav (already renders `<span>username</span>` + logout):
```tsx
{user ? (
  <>
    <Link href="/upload" className={cn(buttonVariants({ variant: 'default' }))}>
      Upload
    </Link>
    <span className="text-sm text-text-primary">{user.username}</span>
    <button onClick={() => signOut({ callbackUrl: '/' })} ...>Log out</button>
  </>
) : (...)}
```

Mobile drawer (same `{user ? ...}` block):
```tsx
<Link
  href="/upload"
  className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
  onClick={() => setMobileOpen(false)}
>
  Upload
</Link>
```

### Upload Progress Display

Since `fetch` does not expose upload progress events, show an indeterminate loading state:
```tsx
{uploadState.state === 'loading' && (
  <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
    <div className="h-full bg-brand-primary animate-pulse w-full" />
  </div>
)}
```

Or use `<Progress value={undefined} className="h-1 mt-1" />` from `@/components/ui/progress` — the shadcn Progress accepts `value` as `number | null | undefined`; undefined triggers its indeterminate style.

### Toast Usage Note

Story 2.3 does NOT require any toasts — errors are inline per-file, navigation is step-based. When Story 2.4 needs toasts (e.g., "Draft saved"), import from `sonner`:
```typescript
import { toast } from 'sonner'
// Toaster is already in app/layout.tsx — no setup needed
```

### API Contracts Used (from Story 2.2)

**POST /api/upload/files** — success:
```json
{ "fileId": "uuid-v4", "filename": "uuid-v4.stl", "size": 1048576 }
```
Error: `{ "error": "...", "code": "FILE_TOO_LARGE" | "INVALID_FILE_TYPE" | ... }` with appropriate HTTP status.

**POST /api/upload/photos** — success:
```json
{ "photoId": "uuid-v4", "filename": "uuid-v4.jpg", "previewUrl": "/api/files/models/uuid-v4/photos/uuid-v4.jpg" }
```

Both routes require auth (session cookie set during login). The middleware cookie is sent automatically via browser fetch.

### Ownership Enforcement Reminder (for Story 2.4, not this story)

From deferred-work.md (Story 2-2 review): `updateDraftModel`/`publishModel` in `lib/db/models.ts` have no `user_id` ownership filter. Story 2.4 must add `AND user_id = ?` to those DB queries when creating and updating models via API routes. This is explicitly out of scope for Story 2.3.

### `lib/constants.ts` is Client-Safe

`lib/constants.ts` exports plain primitives (no `node:fs`, no `better-sqlite3`). Client components CAN import from it:
```typescript
import { ALLOWED_MODEL_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '@/lib/constants'
```

### File Structure

| File | Action | Notes |
|------|--------|-------|
| `stores/wizardStore.ts` | CREATE | Zustand v5 store: step, files[], photos[], actions |
| `app/upload/page.tsx` | CREATE | Server Component; renders UploadWizard |
| `components/upload/UploadWizard.tsx` | CREATE | Wizard shell — step routing, Back/Continue navigation |
| `components/upload/WizardStepIndicator.tsx` | CREATE | 5-step visual indicator with active/completed/upcoming states |
| `components/upload/FileUploadZone.tsx` | CREATE | Step 1: drag-drop STL/3MF, per-file upload state, client validation |
| `components/upload/PhotoUploadZone.tsx` | CREATE | Step 2: drag-drop photos, thumbnail grid, continue gate |
| `components/layout/NavbarActions.tsx` | MODIFY | Add Upload link for authenticated users (desktop nav + mobile drawer) |

### Project Structure Notes

- `stores/wizardStore.ts` is at the project root `/stores/` directory — same level as `app/`, `components/`, `lib/`
- All upload `components/upload/*.tsx` are `'use client'` — they use state, refs, and event handlers
- `app/upload/page.tsx` is a **Server Component** — no `'use client'`, no hooks
- `lucide-react` is already installed; import `Check`, `X`, `Upload` icons as needed
- No new API routes created in this story — `/api/upload/files` and `/api/upload/photos` from Story 2.2 are consumed directly
- `components/upload/.gitkeep` will be superseded by the component files; no explicit deletion needed

### References

- Zustand naming convention: [`_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#Naming Patterns`] — `useWizardStore` in `stores/wizardStore.ts`
- AsyncState type: [`types/api.ts`] — `"idle" | "loading" | "success" | "error"` (never `isLoading: boolean`)
- Upload API contracts (fileId, photoId, previewUrl shapes): [`_bmad-output/implementation-artifacts/2-2-file-photo-upload-apis-storage-abstraction.md#API response contract for this story`]
- Auth pattern — `auth()` from `@/lib/auth` (NOT from `next-auth`): [`_bmad-output/implementation-artifacts/2-2-file-photo-upload-apis-storage-abstraction.md#Auth pattern in Route Handlers`]
- Design tokens: [`app/globals.css`] — `brand-primary: #4A7C59`, `brand-light: #D4EDDA`, `border: #E2EBE4`, `text-muted: #6B7280`
- Component boundary rules (Server vs Client): [`_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#Component Boundaries`]
- Auth middleware (no auth() needed in page.tsx): [`middleware.ts`] — `/upload` in matcher
- FileUploadZone UX spec: [`_bmad-output/planning-artifacts/ux-design-specification/component-strategy.md#FileUploadZone`]
- PhotoUploadZone UX spec: [`_bmad-output/planning-artifacts/ux-design-specification/component-strategy.md#PhotoUploadZone`]
- UploadWizard UX spec: [`_bmad-output/planning-artifacts/ux-design-specification/component-strategy.md#UploadWizard`]
- WizardStepIndicator UX spec: [`_bmad-output/planning-artifacts/ux-design-specification/component-strategy.md#WizardStepIndicator`]
- Toaster setup: [`app/layout.tsx`] — `<Toaster />` already present; `import { toast } from 'sonner'` in components
- Zustand store rules (no async, immutable updates): [`_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#Wizard State: Zustand v5.x`]
- Navbar existing pattern: [`components/layout/NavbarActions.tsx`] — uses `buttonVariants`, `cn`, `Link`, `signOut`
- `next.config.ts` unoptimized images: [`_bmad-output/implementation-artifacts/2-2-file-photo-upload-apis-storage-abstraction.md#CRITICAL: lib/constants.ts and next.config.ts are ALREADY DONE`]
- Deferred ownership enforcement: [`_bmad-output/implementation-artifacts/deferred-work.md#Deferred from: code review of 2-2`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Installed zustand v5.0.13 via `npm install zustand`.
- Created `stores/wizardStore.ts` with Zustand v5 curried TypeScript pattern; all actions use immutable `set((state) => ...)`.
- Added Upload link to `NavbarActions.tsx` for both desktop and mobile drawers, placed before username display.
- Created `app/upload/page.tsx` as a Server Component — no auth() call needed since middleware guards `/upload`.
- Created `WizardStepIndicator.tsx`: 5-step indicator with completed (Check icon), active (sage green), and upcoming (gray) circle states; connecting lines colored by progress; aria-current="step" on active step.
- Created `FileUploadZone.tsx`: drag-and-drop with browser-safe extension check (`file.name.split('.').pop()`), per-file async upload states (loading/success/error), indeterminate progress bar during upload, inline error text on failure.
- Created `PhotoUploadZone.tsx`: same drag-and-drop pattern with MIME-type client validation, thumbnail grid using next/image, hover-reveal × remove button.
- Created `UploadWizard.tsx`: wizard shell wiring all components; Back/Continue navigation using goToStep(); "At least 1 photo required" visible hint on step 2; steps 3–5 render placeholder.
- TypeScript: 0 errors. ESLint: 0 errors/warnings. Build: successful (`/upload` route confirmed in build output).

### File List

- `stores/wizardStore.ts` — CREATED
- `app/upload/page.tsx` — CREATED
- `components/upload/UploadWizard.tsx` — CREATED
- `components/upload/WizardStepIndicator.tsx` — CREATED
- `components/upload/FileUploadZone.tsx` — CREATED
- `components/upload/PhotoUploadZone.tsx` — CREATED
- `components/layout/NavbarActions.tsx` — MODIFIED
- `package.json` — MODIFIED (zustand added)
- `package-lock.json` — MODIFIED (lockfile updated)

## Change Log

- 2026-05-06: Story 2.3 implemented — Upload wizard shell with Steps 1 & 2. Installed zustand v5, created Zustand wizard store, added Upload navbar link, created `/upload` page (Server Component), WizardStepIndicator, FileUploadZone, PhotoUploadZone, and UploadWizard shell. TypeScript/ESLint/build all green.
