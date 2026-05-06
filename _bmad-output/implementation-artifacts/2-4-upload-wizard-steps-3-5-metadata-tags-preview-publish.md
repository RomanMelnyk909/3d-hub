# Story 2.4: Upload Wizard Steps 3–5 (Metadata, Tags, Preview, Publish)

Status: done

## Story

As a creator,
I want to fill in my model's metadata and tags, preview the listing, consent to the license, and publish — or save as a draft to finish later,
so that my model goes live with complete, accurate information.

## Acceptance Criteria

1. **Given** I advance to Step 3 (Details)
   **When** the `ModelMetadataForm` renders
   **Then** visible labeled fields appear for: Title (required), Description (required), Layer Height in mm (required), Infill % (required), Supports Required (required, Yes/No select), Filament Type (required, select dropdown)
   **And** helper text appears below relevant fields (e.g., "Layer height in mm, e.g. 0.2")
   **And** "Continue" is disabled until all required fields are filled

2. **Given** I advance to Step 4 (Tags)
   **When** the `TagSelector` renders
   **Then** predefined tag chip buttons are shown — clicking toggles them (sage green fill = selected, `role="checkbox"`)
   **And** a custom tag text input allows me to type and press Enter to add a tag chip
   **And** each added custom tag appears as a removable chip with a × button
   **And** screen readers announce each added custom tag via `aria-live="polite"`

3. **Given** I advance to Step 5 (Preview & Publish)
   **When** the `PublishPreview` renders
   **Then** I see a live preview showing: model title, description, first uploaded photo thumbnail, print metadata (layer height, infill, supports, filament type), and selected tags
   **And** a license consent checkbox is shown with text: "I confirm this is my original work and grant free-to-download rights"
   **And** "Publish" is disabled until the checkbox is checked

4. **Given** I check the license consent and click "Publish"
   **When** `POST /api/models/[id]/publish` is called (the draft being created or already existing)
   **Then** the model's `is_published` is set to `1` and `is_draft` to `0` in the database
   **And** I am redirected to `/models/[id]`
   **And** a success toast appears: "Your model is live!"

5. **Given** I click "Save Draft" at any step from Step 3 onwards (when title is filled)
   **When** the draft save action runs
   **Then** all current wizard state is persisted via `POST /api/models` (create) or `PATCH /api/models/[id]` (update)
   **And** a quiet toast appears: "Draft saved"
   **And** `draftId` is persisted to localStorage via Zustand persist middleware

6. **Given** I return to `/upload` and have an existing draft (draftId in localStorage)
   **When** the `UploadWizard` mounts
   **Then** a resume prompt appears: "You have an unsaved draft. Resume or Start New?"
   **And** clicking "Resume" restores the full wizard state from localStorage and continues from where the creator left off
   **And** clicking "Start New" calls `reset()` which clears the Zustand store and localStorage entry

7. **Given** a publish API call fails
   **When** the error response is received
   **Then** a system-level error toast appears with the specific message from the API response
   **And** I remain on Step 5 — not redirected away

## Tasks / Subtasks

- [x] Expand `stores/wizardStore.ts` — add metadata, tags, draftId, and persist middleware (AC: #3, #5, #6)
  - [x] Add `MetadataFormValues` interface: `{ title: string; description: string; layerHeightMm: number; infillPercent: number; supportsRequired: 'true' | 'false'; filamentType: string }`
  - [x] Add to `WizardState`: `draftId: string | null`, `metadata: MetadataFormValues | null`, `selectedPredefinedTagIds: string[]`, `customTagNames: string[]`
  - [x] Add actions: `setDraftId(id: string)`, `setMetadata(m: MetadataFormValues)`, `togglePredefinedTag(id: string)`, `addCustomTag(name: string)`, `removeCustomTag(name: string)`
  - [x] Update `reset()` to clear all new fields: `{ currentStep: 1, files: [], photos: [], draftId: null, metadata: null, selectedPredefinedTagIds: [], customTagNames: [] }`
  - [x] Wrap store with `persist` middleware (Zustand v5 pattern): `create<WizardState>()(persist((set) => ..., { name: '3d-hub-wizard', storage: createJSONStorage(() => localStorage), partialize: (s) => ({ draftId: s.draftId, currentStep: s.currentStep, files: s.files, photos: s.photos, metadata: s.metadata, selectedPredefinedTagIds: s.selectedPredefinedTagIds, customTagNames: s.customTagNames }) }))`
  - [x] Export `MetadataFormValues` type from `stores/wizardStore.ts`

- [x] Update `lib/constants.ts` — add filament types and predefined tags list (AC: #1, #2)
  - [x] Add `FILAMENT_TYPES: string[] = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'Resin', 'Other']`
  - [x] Add `PREDEFINED_TAGS: Array<{ id: string; name: string }> = [{ id: 'tag-001', name: 'functional' }, ...]` — mirrors schema.sql seed values exactly (tag-001 through tag-015)

- [x] Update `lib/validations.ts` — add metadata form schema (AC: #1)
  - [x] Add `modelMetadataSchema = z.object({ title: z.string().min(1, 'Title is required').max(100), description: z.string().min(1, 'Description is required').max(2000), layerHeightMm: z.coerce.number().min(0.05, 'Minimum 0.05mm').max(1.0, 'Maximum 1.0mm'), infillPercent: z.coerce.number().int().min(0, '0–100%').max(100, '0–100%'), supportsRequired: z.enum(['true', 'false']), filamentType: z.string().min(1, 'Select a filament type') })`
  - [x] Export `ModelMetadataFormValues = z.infer<typeof modelMetadataSchema>`

- [x] Update `lib/db/models.ts` — add file/photo/tag linking functions + fix ownership (AC: #4, #5)
  - [x] **CRITICAL:** Add `userId: string` param to `updateDraftModel(id, userId, data)` — update WHERE clause to `WHERE id = ? AND is_draft = 1 AND user_id = ?`; add `userId` as last `run()` param
  - [x] **CRITICAL:** Add `userId: string` param to `publishModel(id, userId)` — update WHERE clause to `WHERE id = ? AND is_draft = 1 AND user_id = ?`; add `userId` as last `run()` param
  - [x] Add `createModelFiles(modelId: string, files: WizardFile[]): void`
  - [x] Add `createModelPhotos(modelId: string, photos: WizardPhoto[], displayOffset?: number): void`
  - [x] Add `setModelTags(modelId: string, predefinedTagIds: string[], customTagNames: string[]): void`
  - [x] Inline WizardFile/WizardPhoto types locally to avoid circular deps (Option A from Dev Notes)

- [x] Create API routes (AC: #4, #5)
  - [x] Create `app/api/models/route.ts` — POST: create draft model with files + photos
    - [x] Auth check: `auth()` from `@/lib/auth`; return 401 if `!session?.user?.userId`
    - [x] Parse JSON body with optional fields
    - [x] `createDraftModel` + `updateDraftModel` + `createModelFiles` + `createModelPhotos` + `setModelTags`
    - [x] Return `NextResponse.json(model)` with 201
    - [x] Wrap in try/catch; `console.error` before returning 500
  - [x] Create `app/api/models/[id]/route.ts` — PATCH: update draft
    - [x] Auth check
    - [x] `updateDraftModel(id, session.user.userId, data)` — **with userId** (ownership enforced)
    - [x] `setModelTags` if tags in body
    - [x] Return updated model; wrap in try/catch
  - [x] Create `app/api/models/[id]/publish/route.ts` — POST: publish
    - [x] Auth check
    - [x] `publishModel(id, session.user.userId)` — **with userId** (ownership enforced)
    - [x] Return 404 if model not found or not a draft
    - [x] Wrap in try/catch; log + return 500

- [x] Create `components/upload/ModelMetadataForm.tsx` — Step 3 (AC: #1)
  - [x] `'use client'`; `forwardRef` with `MetadataFormHandle` interface (exposes `submit(): void`)
  - [x] Props: `initialValues?: Partial<ModelMetadataFormValues>`, `onSubmitSuccess`, `onCompletenessChange`
  - [x] `useForm` with `zodResolver(modelMetadataSchema)`, `mode: 'onSubmit'`
  - [x] `useImperativeHandle` triggers `handleSubmit` → `setMetadata` → `onSubmitSuccess()`
  - [x] All 6 fields with Controller + shadcn/ui, helper text, inline errors
  - [x] `useWatch` drives `onCompletenessChange` via `useEffect`

- [x] Create `components/upload/TagSelector.tsx` — Step 4 (AC: #2)
  - [x] Predefined chip row with `role="checkbox"`, `aria-checked`, sage-green-when-selected styling
  - [x] Custom tag input with Enter-to-add, chip list with × remove buttons
  - [x] `aria-live="polite"` region wrapping custom chips

- [x] Create `components/upload/PublishPreview.tsx` — Step 5 (AC: #3, #4, #7)
  - [x] Photo thumbnail, title, truncated description, metadata `<dl>`, tag badges
  - [x] License consent checkbox; Publish button disabled until consented
  - [x] `handlePublish()`: create draft if needed → publish → toast + redirect; error handling per AC #7

- [x] Update `components/upload/UploadWizard.tsx` — wire Steps 3–5 + resume draft (AC: #1–#7)
  - [x] Removed `useEffect(() => { reset() }, [reset])` auto-reset
  - [x] Resume prompt derived from store state (no useEffect) — avoids ESLint `react-hooks/set-state-in-effect`
  - [x] Steps 3/4/5 render `ModelMetadataForm`/`TagSelector`/`PublishPreview`
  - [x] Step 3 Continue uses imperative `metadataFormRef.current?.submit()`
  - [x] `isContinueDisabled` includes `currentStep === 3 && !isMetadataFormComplete`
  - [x] Save Draft button at steps 3–4 when metadata is non-null

- [x] Verify (AC: all)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors (`npm run lint` — 2 pre-existing warnings in FileUploadZone/PhotoUploadZone not from this story)

## Dev Notes

### CRITICAL: Ownership Enforcement in lib/db/models.ts

**From deferred-work.md:** `updateDraftModel` and `publishModel` have NO `user_id` ownership filter. This story MUST fix this. A creator could currently update or publish another user's draft by guessing the UUID. The fix is straightforward:

**Current (vulnerable):**
```typescript
export function updateDraftModel(id: string, data: UpdateDraftModelInput): Model {
  // ...
  db.prepare(`UPDATE models SET ${setClause} WHERE id = ? AND is_draft = 1`).run(...params)
  //                                            ^^ no user_id check!
}

export function publishModel(id: string): Model {
  db.prepare(`UPDATE models SET ... WHERE id = ? AND is_draft = 1`).run(publishedAt, id)
  //                                      ^^ no user_id check!
}
```

**Required (fixed):**
```typescript
export function updateDraftModel(id: string, userId: string, data: UpdateDraftModelInput): Model {
  // ...
  const params: (string | number | null)[] = [...fields.map(f => f.val), id, userId]
  db.prepare(`UPDATE models SET ${setClause} WHERE id = ? AND is_draft = 1 AND user_id = ?`).run(...params)
}

export function publishModel(id: string, userId: string): Model {
  db.prepare(
    `UPDATE models SET is_published = 1, is_draft = 0, published_at = ? WHERE id = ? AND is_draft = 1 AND user_id = ?`
  ).run(publishedAt, id, userId)
}
```

All callers of these functions in new API routes MUST pass the authenticated `session.user.userId`.

### Zustand v5 Persist Middleware Pattern

Zustand v5 persist middleware wraps the `(set, get, store) =>` factory. The `partialize` option controls which fields are saved to localStorage (exclude functions/actions):

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      // ... state + actions
    }),
    {
      name: '3d-hub-wizard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draftId: state.draftId,
        currentStep: state.currentStep,
        files: state.files,
        photos: state.photos,
        metadata: state.metadata,
        selectedPredefinedTagIds: state.selectedPredefinedTagIds,
        customTagNames: state.customTagNames,
      }),
    }
  )
)
```

**Critical:** `partialize` excludes functions. Only plain data is serialized to JSON in localStorage. The `reset()` action sets `draftId: null`, which causes persist to save `null` for draftId — effectively clearing the stored draft on next load.

**IMPORTANT: Remove `useEffect(() => { reset() }, [reset])` from UploadWizard.tsx** — Story 2.3 auto-reset on mount now conflicts with the persist-based resume feature. Replace with conditional resume prompt logic.

### MetadataFormValues Type Location

Define `MetadataFormValues` in `stores/wizardStore.ts` (re-export from there) OR in `lib/validations.ts`. The cleanest approach: define it in `lib/validations.ts` (as `ModelMetadataFormValues`) and import it wherever needed. Do NOT duplicate the type.

```typescript
// lib/validations.ts
export const modelMetadataSchema = z.object({...})
export type ModelMetadataFormValues = z.infer<typeof modelMetadataSchema>

// stores/wizardStore.ts
import type { ModelMetadataFormValues } from '@/lib/validations'
// Use ModelMetadataFormValues for store state field
```

### React Hook Form — forwardRef Pattern for ModelMetadataForm

The parent `UploadWizard` triggers form submit imperatively when user clicks "Continue". Use `forwardRef` + `useImperativeHandle`:

```typescript
'use client'
import { forwardRef, useImperativeHandle } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { modelMetadataSchema, type ModelMetadataFormValues } from '@/lib/validations'
import { useWizardStore } from '@/stores/wizardStore'

export interface MetadataFormHandle {
  submit: () => void
}

interface Props {
  initialValues?: Partial<ModelMetadataFormValues>
  onSubmitSuccess: () => void
  onCompletenessChange: (isComplete: boolean) => void
}

export const ModelMetadataForm = forwardRef<MetadataFormHandle, Props>(
  ({ initialValues, onSubmitSuccess, onCompletenessChange }, ref) => {
    const setMetadata = useWizardStore((s) => s.setMetadata)
    const { control, handleSubmit, formState: { errors } } = useForm<ModelMetadataFormValues>({
      resolver: zodResolver(modelMetadataSchema),
      defaultValues: initialValues,
      mode: 'onSubmit',
    })

    // Track completeness for Continue button gating (NOT validation — just non-empty check)
    const watched = useWatch({ control })
    useEffect(() => {
      const complete = Boolean(
        watched.title?.trim() &&
        watched.description?.trim() &&
        watched.layerHeightMm !== undefined && watched.layerHeightMm !== null && String(watched.layerHeightMm) !== '' &&
        watched.infillPercent !== undefined && watched.infillPercent !== null && String(watched.infillPercent) !== '' &&
        watched.supportsRequired &&
        watched.filamentType
      )
      onCompletenessChange(complete)
    }, [watched, onCompletenessChange])

    useImperativeHandle(ref, () => ({
      submit: () =>
        handleSubmit((data) => {
          setMetadata(data)
          onSubmitSuccess()
        })(),
    }))

    return (
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* fields here */}
      </form>
    )
  }
)
ModelMetadataForm.displayName = 'ModelMetadataForm'
```

**Key points:**
- `onSubmit={(e) => e.preventDefault()}` prevents accidental HTML form submit
- Actual submit triggered via `ref.submit()` from UploadWizard
- `onSubmitSuccess()` is called inside `handleSubmit` callback — only fires if validation passes
- `mode: 'onSubmit'` means inline errors only appear after the first failed Continue click

### shadcn/ui Select Controller Pattern

For Supports Required and Filament Type selects, use the `Controller` wrapper since shadcn `Select` is uncontrolled by default:

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Controller
  name="supportsRequired"
  control={control}
  render={({ field }) => (
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <SelectTrigger>
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="true">Yes</SelectItem>
        <SelectItem value="false">No</SelectItem>
      </SelectContent>
    </Select>
  )}
/>
```

### API Routes: Auth Pattern + Error Handling

Copy the exact auth check pattern from `app/api/upload/files/route.ts`:

```typescript
import { auth } from '@/lib/auth'      // ← always '@/lib/auth', NOT 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<Response> {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHENTICATED' },
      { status: 401 }
    )
  }
  const userId = session.user.userId

  try {
    const body = await request.json()
    // ... logic
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[POST /api/models]', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
```

**PATCH /api/models/[id] handler signature:**
```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params
  // ...
}
```

### POST /api/models Body Contract

The frontend sends all current wizard state in one payload. Designed to support both "Save Draft" (partial data) and "Publish" flow (full data):

```typescript
// Request body shape
interface CreateModelBody {
  title: string
  description?: string | null
  layerHeightMm?: number | null
  infillPercent?: number | null
  supportsRequired?: boolean | null  // converted from 'true'/'false' string
  filamentType?: string | null
  files: Array<{ fileId: string; filename: string; size: number }>
  photos: Array<{ photoId: string; filename: string; previewUrl: string }>
  tagIds?: string[]
  customTagNames?: string[]
}
```

**supportsRequired conversion in API route:** form value is `'true'` | `'false'` string, but `createDraftModel` / `updateDraftModel` expect `boolean | null`. Convert:
```typescript
const supportsRequired = body.supportsRequired === 'true' ? true
  : body.supportsRequired === 'false' ? false
  : null
```

### setModelTags DB Function Pattern

```typescript
export function setModelTags(
  modelId: string,
  predefinedTagIds: string[],
  customTagNames: string[]
): void {
  // Remove all existing tags for this model
  db.prepare('DELETE FROM model_tags WHERE model_id = ?').run(modelId)

  // Re-insert predefined tags (validate IDs exist to avoid FK violation)
  for (const tagId of predefinedTagIds) {
    const exists = db.prepare('SELECT id FROM tags WHERE id = ?').get(tagId)
    if (exists) {
      db.prepare('INSERT OR IGNORE INTO model_tags (model_id, tag_id) VALUES (?, ?)')
        .run(modelId, tagId)
    }
  }

  // Upsert + link custom tags
  for (const name of customTagNames) {
    const trimmed = name.trim().toLowerCase()
    if (!trimmed) continue
    const existing = db.prepare('SELECT id FROM tags WHERE name = ?').get(trimmed) as { id: string } | undefined
    const tagId = existing?.id ?? crypto.randomUUID()
    if (!existing) {
      db.prepare('INSERT INTO tags (id, name, is_predefined) VALUES (?, ?, 0)').run(tagId, trimmed)
    }
    db.prepare('INSERT OR IGNORE INTO model_tags (model_id, tag_id) VALUES (?, ?)').run(modelId, tagId)
  }
}
```

### Publish Flow — Draft May Not Exist Yet

When user clicks Publish at Step 5 without ever clicking Save Draft, `draftId` is null. The `PublishPreview.handlePublish()` must handle this:

```typescript
async function handlePublish() {
  setPublishState('loading')
  try {
    let currentDraftId = draftId

    // Step 1: Create draft if not exists
    if (!currentDraftId) {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metadata!.title,
          description: metadata!.description,
          layerHeightMm: metadata!.layerHeightMm,
          infillPercent: metadata!.infillPercent,
          supportsRequired: metadata!.supportsRequired,
          filamentType: metadata!.filamentType,
          files,
          photos,
          tagIds: selectedPredefinedTagIds,
          customTagNames,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create draft')
        setPublishState('error')
        return
      }
      currentDraftId = data.id
      setDraftId(data.id)
    }

    // Step 2: Publish
    const pubRes = await fetch(`/api/models/${currentDraftId}/publish`, { method: 'POST' })
    const pubData = await pubRes.json()
    if (!pubRes.ok) {
      toast.error(pubData.error ?? 'Publish failed')
      setPublishState('error')
      return
    }

    toast.success('Your model is live!')
    router.push(`/models/${pubData.id}`)
  } catch {
    toast.error('An unexpected error occurred')
    setPublishState('error')
  }
}
```

### PREDEFINED_TAGS in lib/constants.ts

Must exactly match schema.sql seeds (same IDs):

```typescript
export const PREDEFINED_TAGS = [
  { id: 'tag-001', name: 'functional' },
  { id: 'tag-002', name: 'decorative' },
  { id: 'tag-003', name: 'workshop' },
  { id: 'tag-004', name: 'tools' },
  { id: 'tag-005', name: 'miniature' },
  { id: 'tag-006', name: 'home' },
  { id: 'tag-007', name: 'garden' },
  { id: 'tag-008', name: 'gaming' },
  { id: 'tag-009', name: 'jewelry' },
  { id: 'tag-010', name: 'educational' },
  { id: 'tag-011', name: 'organizer' },
  { id: 'tag-012', name: 'holder' },
  { id: 'tag-013', name: 'mount' },
  { id: 'tag-014', name: 'enclosure' },
  { id: 'tag-015', name: 'no-supports' },
] as const
```

### Toast Import

Toaster is already in `app/layout.tsx`. Just import `toast` in components:
```typescript
import { toast } from 'sonner'
toast.success('Your model is live!')
toast('Draft saved')        // quiet — no icon
toast.error('Publish failed: ...')
```

### WizardFile / WizardPhoto Circular Import Risk

`lib/db/models.ts` (new functions) would import from `stores/wizardStore.ts`. This creates a potential import cycle if wizardStore imports from lib/. To avoid this:
- **Option A:** Inline the WizardFile/WizardPhoto type shape in lib/db/models.ts (do NOT import from stores): `interface WizardFileInput { fileId: string; filename: string; size: number }` — same shape, different name
- **Option B:** Move shared types to `types/model.ts` (add `UploadedFile` and `UploadedPhoto` interfaces there)

**Recommended: Option A** — inline the interface locally in models.ts. Avoid cross-layer type imports.

### /models/[id] Does Not Exist Yet (Expected)

The redirect target `router.push('/models/' + id)` after publish will hit a 404 page (Epic 3 builds `app/models/[id]/page.tsx`). This is expected and acceptable — the publish is correct, the page just isn't built yet.

### UploadWizard Continue Handler — Step 3 Async Pattern

The Continue button calls `metadataFormRef.current?.submit()` at Step 3 instead of `goToStep(currentStep + 1)`. The step advance is triggered by `onSubmitSuccess` inside the form. This means the Continue `onClick` at Step 3 should NOT call `goToStep`:

```typescript
const handleContinueClick = () => {
  if (currentStep === 3) {
    metadataFormRef.current?.submit()  // step advance happens via onSubmitSuccess callback
    return
  }
  goToStep(currentStep + 1)
}
```

### File Structure

| File | Action | Notes |
|------|--------|-------|
| `stores/wizardStore.ts` | MODIFY | Add metadata, draftId, tags, persist middleware |
| `lib/constants.ts` | MODIFY | Add FILAMENT_TYPES, PREDEFINED_TAGS |
| `lib/validations.ts` | MODIFY | Add modelMetadataSchema |
| `lib/db/models.ts` | MODIFY | Fix ownership (CRITICAL), add file/photo/tag functions |
| `app/api/models/route.ts` | CREATE | POST create draft |
| `app/api/models/[id]/route.ts` | CREATE | PATCH update draft |
| `app/api/models/[id]/publish/route.ts` | CREATE | POST publish |
| `components/upload/ModelMetadataForm.tsx` | CREATE | Step 3 — RHF + shadcn fields |
| `components/upload/TagSelector.tsx` | CREATE | Step 4 — predefined chips + custom tags |
| `components/upload/PublishPreview.tsx` | CREATE | Step 5 — preview + consent + publish |
| `components/upload/UploadWizard.tsx` | MODIFY | Wire Steps 3–5, remove auto-reset, add resume logic |

### References

- Ownership enforcement: [`_bmad-output/implementation-artifacts/deferred-work.md#Deferred from: code review of 2-2`] — "updateDraftModel/publishModel have no user_id ownership filter; Stories 2-3/2-4 API routes must add AND user_id = ?"
- Auth pattern `auth()`: [`app/api/upload/files/route.ts:25`] — `auth()` from `@/lib/auth`, NOT from `next-auth`
- Error standard `{ error, code }`: [`_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#API Response Shapes`]
- Zustand v5 persist: [`zustand/middleware` package — `persist` + `createJSONStorage`]
- React Hook Form + Controller: [`_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#Form Handling`]
- Tags DB seed (IDs): [`lib/db/schema.sql:103-118`] — predefined tags tag-001 through tag-015
- camelCase API / snake_case DB: [`_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#API JSON Field Naming`]
- shadcn Checkbox: [`components/ui/checkbox.tsx`] — already installed
- `sonner` toast: [`_bmad-output/implementation-artifacts/2-3-upload-wizard-shell-steps-1-2-files-photos.md#Toast Usage Note`] — `import { toast } from 'sonner'`, Toaster already in layout
- Model types: [`types/model.ts`] — `Model`, `ModelFile`, `ModelPhoto`
- AsyncState type: [`types/api.ts:22`] — `"idle" | "loading" | "success" | "error"`
- WizardFile/WizardPhoto types: [`stores/wizardStore.ts:3-12`] — inline locally in lib/db/models.ts to avoid circular import
- File storage pattern (relative paths): [`lib/storage/index.ts`] — `models/[fileId]/files/[filename]` is the relative path format
- Zustand v5 curried form: [`_bmad-output/implementation-artifacts/2-3-upload-wizard-shell-steps-1-2-files-photos.md#Zustand v5 Store Pattern`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- TypeScript error: `zodResolver` type incompatibility with `z.coerce.number()` in Zod v4 + @hookform/resolvers v5 — fixed by casting resolver `as any`
- TypeScript error: `useWatch` return typed as generic `TFieldValues` — fixed by casting `as Partial<ModelMetadataFormValues>`
- TypeScript error: type predicate `n is string` rejected against `as const` PREDEFINED_TAGS literal union — fixed by `filter(Boolean) as string[]`
- ESLint error: `react-hooks/set-state-in-effect` on original `useEffect`-based resume prompt — replaced with derived computed value from Zustand store state directly (`showResumePrompt = !dismissed && draftId !== null && ...`), eliminating the useEffect entirely

### Completion Notes List

- **Ownership enforcement**: `updateDraftModel` and `publishModel` now require `userId` and enforce `AND user_id = ?` in WHERE clause — eliminates IDOR vulnerability noted in deferred-work.md
- **Circular import avoided**: `WizardFile`/`WizardPhoto` interfaces inlined in `lib/db/models.ts` (Option A from Dev Notes) — no cross-layer import cycles
- **Resume prompt**: implemented without `useEffect` — derived directly from Zustand store state + a local `dismissed` flag. This avoids the new `react-hooks/set-state-in-effect` ESLint rule while maintaining correct behavior (Zustand persist triggers re-render after localStorage rehydration, updating the computed value automatically)
- **ESLint**: 0 errors; 2 pre-existing warnings in `FileUploadZone.tsx` and `PhotoUploadZone.tsx` (abortControllersRef ref cleanup pattern) — not introduced by this story
- **TypeScript**: 0 errors; `npx tsc --noEmit` clean
- **Build**: production build successful, all 3 new routes visible in output

### File List

- `stores/wizardStore.ts` — MODIFIED: added draftId, metadata, tags state + actions; Zustand v5 persist middleware
- `lib/constants.ts` — MODIFIED: added FILAMENT_TYPES, PREDEFINED_TAGS (tag-001 through tag-015)
- `lib/validations.ts` — MODIFIED: added modelMetadataSchema, ModelMetadataFormValues type
- `lib/db/models.ts` — MODIFIED: ownership fix in updateDraftModel/publishModel; added createModelFiles, createModelPhotos, setModelTags
- `app/api/models/route.ts` — CREATED: POST create draft
- `app/api/models/[id]/route.ts` — CREATED: PATCH update draft
- `app/api/models/[id]/publish/route.ts` — CREATED: POST publish
- `components/upload/ModelMetadataForm.tsx` — CREATED: Step 3 metadata form (forwardRef + react-hook-form)
- `components/upload/TagSelector.tsx` — CREATED: Step 4 predefined + custom tags
- `components/upload/PublishPreview.tsx` — CREATED: Step 5 preview + consent + publish
- `components/upload/UploadWizard.tsx` — MODIFIED: wired Steps 3–5, resume prompt, Save Draft, removed auto-reset

### Review Findings

- [x] [Review][Decision] Resume behavior — Blob URLs and File objects cannot survive a session boundary; `showResumePrompt` fires when `files.length===0 && photos.length===0`, but rehydrated File entries lose File API methods and blob URLs are revoked on page unload — true state restoration is impossible without redesign. Decision needed: what should "Resume" actually restore?
- [x] [Review][Decision] Predefined tag chip color — Spec requires "sage green fill" for selected chips (AC2); implementation uses `bg-brand-primary`. Confirm whether `brand-primary` maps to sage green in this design system, or provide the correct Tailwind token.
- [x] [Review][Decision] Save Draft availability — Spec says "when title is filled" (AC5); current implementation gates Save Draft on `metadata !== null`, which is only set after full Step 3 form submission. Decision needed: make it available on title-filled (requires refactor), or accept current behavior?
- [x] [Review][Patch] `filamentType` not validated as enum against `FILAMENT_TYPES`; `FILAMENT_TYPES: string[]` annotation defeats `as const` inference needed for `z.enum()` [lib/validations.ts, lib/constants.ts]
- [x] [Review][Patch] `setModelTags`, `createModelFiles`, `createModelPhotos` not wrapped in DB transactions — partial failures leave model in inconsistent state [lib/db/models.ts]
- [x] [Review][Patch] `updateDraftModel` empty-fields path calls `getModelById` without `userId` filter — any authenticated user can read another user's draft via `PATCH {}` (IDOR) [lib/db/models.ts, app/api/models/[id]/route.ts]
- [x] [Review][Patch] `PublishPreview` crashes on `metadata!` non-null assertion when `metadata` is null — user navigating directly to Step 5 causes unhandled runtime error [components/upload/PublishPreview.tsx]
- [x] [Review][Patch] `request.json()` parse failure in POST `/api/models` returns 500 instead of 400 [app/api/models/route.ts]
- [x] [Review][Patch] `id` path param not validated before SQL in PATCH and publish routes [app/api/models/[id]/route.ts, app/api/models/[id]/publish/route.ts]
- [x] [Review][Patch] No tag count or tag name length limit at store or API level — trivial data-bloat vector [components/upload/TagSelector.tsx, app/api/models/route.ts]
- [x] [Review][Patch] Blob URLs and File objects persisted to localStorage — blob URLs are revoked on page unload; File objects lose File API methods on JSON rehydration [stores/wizardStore.ts]
- [x] [Review][Patch] `handleSaveDraft` has no loading guard — rapid clicks create multiple concurrent POST requests and duplicate drafts [components/upload/UploadWizard.tsx]
- [x] [Review][Patch] `supportsRequired` Select uses `defaultValue` instead of `value` — stale selection on component remount or draft resume [components/upload/ModelMetadataForm.tsx]
- [x] [Review][Patch] Completeness check enables Continue for out-of-range numeric inputs (e.g. `layerHeightMm=0.001`); Zod validation only fires on submit (AC1) [components/upload/ModelMetadataForm.tsx]
- [x] [Review][Patch] Resume prompt text missing "Resume or Start New?" phrase — renders only "You have an unsaved draft." (AC6) [components/upload/UploadWizard.tsx]
- [x] [Review][Patch] PATCH `/api/models/[id]` catch block returns 500 for not-found/ownership failures — should return 404 [app/api/models/[id]/route.ts]
- [x] [Review][Patch] `createModelFiles` builds storage path from `filename` without sanitization — path traversal possible [lib/db/models.ts]
- [x] [Review][Patch] `publishState === 'error'` leaves Publish enabled — retry while `isConsented` risks double-publish [components/upload/PublishPreview.tsx]
- [x] [Review][Patch] `pubData.id` not guarded after publish — navigates to `/models/undefined` if field is missing [components/upload/PublishPreview.tsx]
- [x] [Review][Patch] `createDraftModel` casts `getModelById` result as `DraftModel` without null-check [lib/db/models.ts]
- [x] [Review][Defer] `aria-live` region does not announce pre-existing chips restored from localStorage rehydration [components/upload/TagSelector.tsx] — deferred, pre-existing
- [x] [Review][Defer] `getModelById` uses `SELECT *` instead of explicit column list [lib/db/models.ts] — deferred, pre-existing
- [x] [Review][Defer] `PREDEFINED_TAGS` IDs hardcoded must match DB seeds — mismatch silently drops user-selected tags [lib/constants.ts] — deferred, pre-existing
- [x] [Review][Defer] Storage path construction in `createModelFiles` duplicates storage layer path logic [lib/db/models.ts] — deferred, pre-existing
- [x] [Review][Defer] No standalone `clearDraftId` action — stale `draftId` possible in edge flows outside `reset()` [stores/wizardStore.ts] — deferred, pre-existing
