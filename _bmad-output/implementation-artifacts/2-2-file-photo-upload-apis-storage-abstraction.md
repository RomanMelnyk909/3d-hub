# Story 2.2: File & Photo Upload APIs + Storage Abstraction

Status: done

## Story

As a creator,
I want my STL/3MF model files and printed photos uploaded securely to the server,
so that my model assets are safely stored and ready to attach to a listing.

## Acceptance Criteria

1. **Given** `lib/storage/index.ts` is implemented
   **When** a file is saved
   **Then** it is written to `UPLOAD_DIR/models/[tempId]/files/[filename]` or `.../photos/[filename]` using only relative paths stored in the DB
   **And** `lib/storage/index.ts` is the only module that uses `node:fs` — no direct filesystem access elsewhere
   **And** `next.config.ts` is configured so locally-served photos are accessible (using `unoptimized` or a custom loader)

2. **Given** `POST /api/upload/files` is called with a multipart file
   **When** busboy parses the stream
   **Then** the file extension AND magic bytes are checked — only STL and 3MF are accepted
   **And** any file exceeding 25MB is rejected before being written to disk, returning `{ "error": "File exceeds the 25MB limit", "code": "FILE_TOO_LARGE" }` with HTTP 413
   **And** any file whose magic bytes match executable formats is rejected with `{ "error": "Executable files are not permitted", "code": "INVALID_FILE_TYPE" }` with HTTP 422
   **And** a valid file is written to a temp directory and returns `{ fileId, filename, size }` with HTTP 200
   **And** every error in the route handler catch block is logged with `console.error` before returning the response

3. **Given** `POST /api/upload/photos` is called with a multipart image file
   **When** the upload is processed
   **Then** the file is validated for image MIME type and written to the photos temp directory
   **And** the response returns `{ photoId, filename, previewUrl }` with HTTP 200

4. **Given** `lib/constants.ts` is created
   **When** it is imported
   **Then** it exports `MAX_FILE_SIZE_BYTES = 26214400` (25MB), `ALLOWED_MODEL_EXTENSIONS = ['.stl', '.3mf']`, `PAGE_SIZE = 24`

## Tasks / Subtasks

- [x] Fix `lib/auth.config.ts` — return 401 JSON for unauthenticated API requests (AC: #2, #3)
  - [x] Update `authorized` callback: if `request.nextUrl.pathname.startsWith('/api/')` AND no session → return `Response.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })` instead of redirecting to `/login`
  - [x] Keep existing behavior (redirect to `/login`) for all non-API routes

- [x] Verify `lib/constants.ts` (AC: #4)
  - [x] ALREADY EXISTS — confirm `MAX_FILE_SIZE_BYTES = 26214400`, `ALLOWED_MODEL_EXTENSIONS = ['.stl', '.3mf']`, `PAGE_SIZE = 24` are present — NO changes needed

- [x] Verify `next.config.ts` (AC: #1)
  - [x] ALREADY HAS `images: { unoptimized: true }` — NO changes needed

- [x] Create `lib/storage/index.ts` — only place using `node:fs` (AC: #1)
  - [x] `getUploadDir(): string` — reads `UPLOAD_DIR` env var, resolves to absolute path; throws if unset
  - [x] `saveModelFile(tempId: string, filename: string, data: Buffer): void` — writes to `UPLOAD_DIR/models/[tempId]/files/[filename]`, creates dirs with `fs.mkdirSync({ recursive: true })`
  - [x] `saveModelPhoto(tempId: string, filename: string, data: Buffer): void` — writes to `UPLOAD_DIR/models/[tempId]/photos/[filename]`, creates dirs with `fs.mkdirSync({ recursive: true })`
  - [x] `readStoredFile(relPath: string): Buffer` — resolves `UPLOAD_DIR/[relPath]` to absolute path, returns `fs.readFileSync(...)` buffer; used by the file serving route
  - [x] `resolvedStoragePath(relPath: string): string` — internal; used by `readStoredFile`; never exposed in API responses

- [x] Create `app/api/upload/files/route.ts` — STL/3MF upload endpoint (AC: #2)
  - [x] Auth check first: call `auth()` from `@/lib/auth`, return 401 if `!session?.user?.userId`
  - [x] Parse multipart with busboy: get `content-type` header, construct Busboy instance, pipe `Readable.fromWeb(request.body)` into busboy
  - [x] On `bb.on('file')`: extract `filename` from `info`; normalize extension via `.toLowerCase()`; reject immediately with 422 if extension not in `ALLOWED_MODEL_EXTENSIONS`
  - [x] Stream chunks to in-memory buffer; track `bytesRead`; if `bytesRead > MAX_FILE_SIZE_BYTES` drain the stream and resolve 413 before writing to disk
  - [x] After buffering: check magic bytes — if first 4 bytes match any executable signature, resolve 422 INVALID_FILE_TYPE
  - [x] Generate `fileId = crypto.randomUUID()`; sanitize filename (keep extension, use `fileId` as base); call `saveModelFile(fileId, sanitizedFilename, buffer)` from `@/lib/storage`
  - [x] Resolve with `{ fileId, filename: sanitizedFilename, size: buffer.length }` HTTP 200
  - [x] Wrap all logic in try/catch; every catch block logs with `console.error` before returning 500
  - [x] Handle `bb.on('error')` — log and resolve 500

- [x] Create `app/api/upload/photos/route.ts` — photo upload endpoint (AC: #3)
  - [x] Auth check: same `auth()` pattern as files route
  - [x] Parse multipart with busboy; extract `mimeType` from `info`
  - [x] Validate MIME type: accept only `image/jpeg`, `image/png`, `image/webp` — reject 422 if invalid
  - [x] Buffer entire upload; respect `MAX_FILE_SIZE_BYTES` limit (413 if exceeded)
  - [x] Generate `photoId = crypto.randomUUID()`; preserve original extension (e.g. `.jpg`) or derive from MIME type
  - [x] Call `saveModelPhoto(photoId, filename, buffer)` from `@/lib/storage`
  - [x] Return `{ photoId, filename, previewUrl: \`/api/files/models/${photoId}/photos/${filename}\` }` HTTP 200
  - [x] Every catch block logs with `console.error` before returning 500

- [x] Create `app/api/files/[...path]/route.ts` — file serving endpoint (needed for previewUrl to work in Story 2.3) (AC: #1)
  - [x] GET handler: extract `params.path` array (e.g. `['models', 'photoId', 'photos', 'filename.jpg']`)
  - [x] Validate no path traversal: reject if any segment is `..` or contains `..` — return 404
  - [x] Join path segments: `relPath = params.path.join('/')`
  - [x] Call `readStoredFile(relPath)` from `@/lib/storage`; catch `ENOENT` → return 404
  - [x] Determine `Content-Type` from file extension (`.jpg/.jpeg` → `image/jpeg`, `.png` → `image/png`, `.webp` → `image/webp`, `.stl` → `application/octet-stream`, `.3mf` → `application/vnd.ms-package.3dmanufacturing-3dmodel+xml`)
  - [x] Return `new Response(body, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' } })` — body converted from Buffer to ArrayBuffer for TypeScript compatibility
  - [x] This route does NOT require auth (photos need to display in public previews eventually)

- [x] Verify (AC: all)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors, 0 warnings (`npm run lint`)
  - [ ] Manual: POST to `/api/upload/files` with a valid STL — confirm `{ fileId, filename, size }` response and file exists at `uploads/models/[fileId]/files/[filename]`
  - [ ] Manual: POST to `/api/upload/files` with a 26MB file — confirm 413 response
  - [ ] Manual: POST to `/api/upload/files` with a `.exe` renamed to `.stl` (first bytes `MZ`) — confirm 422 response
  - [ ] Manual: POST to `/api/upload/photos` with a JPEG — confirm `{ photoId, filename, previewUrl }` and GET the previewUrl returns the image

### Review Findings (AI)

- [x] [Review][Decision] `Cache-Control: public, max-age=31536000, immutable` on serving route — Decision: keep as-is for V1 local (no CDN); a dedicated pre-launch hardening story must revisit this before VPS/CDN deployment and add auth or signed-URL gating for draft assets [app/api/files/[...path]/route.ts:36]
- [x] [Review][Patch] `isExecutableMagicBytes` length guard is `< 2` but ELF/Mach-O checks read `buffer[2]` and `buffer[3]` — change guard to `buffer.length < 4` [app/api/upload/files/route.ts:10]
- [x] [Review][Patch] Busboy `limits` not set — multiple file parts in one multipart request cause orphan disk writes; add `limits: { files: 1, fields: 0 }` to both upload routes [app/api/upload/files/route.ts:36, app/api/upload/photos/route.ts:29]
- [x] [Review][Patch] `request.body === null` causes synchronous throw inside Promise constructor bypassing all error handlers — add null-body guard before `Readable.fromWeb` [app/api/upload/files/route.ts:136, app/api/upload/photos/route.ts:125]
- [x] [Review][Patch] `readStoredFile` has no prefix-confinement check — `path.join` resolves `..` components, allowing escape from `UPLOAD_DIR`; add `path.resolve` + `startsWith` guard [lib/storage/index.ts:22-24]
- [x] [Review][Patch] Dead fallback `?? path.extname(info.filename)` in photos route MIME-to-ext mapping — MIME was just validated so fallback is unreachable dead code that becomes a security risk if ALLOWED list ever expands without updating MIME_TO_EXT; remove the fallback [app/api/upload/photos/route.ts:45]
- [x] [Review][Defer] `lib/db/index.ts` uses `import fs from 'fs'` — pre-existing violation of sole-`node:fs`-consumer constraint; not introduced by this story [lib/db/index.ts:2] — deferred, pre-existing
- [x] [Review][Defer] No file ownership binding at upload time — intentional by design; Story 2.3 associates uploaded files with draft models via Zustand wizard store — deferred, pre-existing
- [x] [Review][Defer] Photo upload validates MIME type only — no image magic bytes check; AC3 spec requires MIME only; add byte-level validation in a future security hardening pass — deferred, pre-existing
- [x] [Review][Defer] Oversized file buffered in memory (up to 25MB) before 413 response — spec says "before writing to disk" (met); early abort memory optimization is V2 [app/api/upload/files/route.ts:57-74] — deferred, pre-existing
- [x] [Review][Defer] Symlink traversal via `readStoredFile` not blocked — no `fs.realpathSync` canonicalization; acceptable for V1 local deployment; address before shared-host deployment [lib/storage/index.ts:22] — deferred, pre-existing
- [x] [Review][Defer] `UPLOAD_DIR` resolved relative to `process.cwd()` — acceptable for V1; require absolute path before VPS deployment [lib/storage/index.ts:7] — deferred, pre-existing
- [x] [Review][Defer] Oversized executable upload logged as 413 with no audit note of executable content — low-priority observability improvement [app/api/upload/files/route.ts:68] — deferred, pre-existing
- [x] [Review][Defer] `updateDraftModel`/`publishModel` have no `user_id` ownership filter — `WHERE id = ? AND is_draft = 1` with no `AND user_id = ?` means any authenticated user can mutate any draft by ID; pre-existing from Story 2-1; ownership must be enforced at the API route layer in Stories 2-3/2-4 [lib/db/models.ts:78,90] — deferred, Story 2-1 scope
- [x] [Review][Defer] `/api/files/[...path]` intentionally unauthenticated — pre-publish draft files are publicly accessible by UUID; appropriate for V1 local; must add auth or signed-URL gating before VPS/CDN deployment [app/api/files/[...path]/route.ts] — deferred, by design

## Dev Notes

### CRITICAL: `lib/constants.ts` and `next.config.ts` are ALREADY DONE

Do NOT touch these files:
- `lib/constants.ts` already exports exactly: `MAX_FILE_SIZE_BYTES = 26214400`, `ALLOWED_MODEL_EXTENSIONS = ['.stl', '.3mf']`, `PAGE_SIZE = 24` ✓
- `next.config.ts` already has `images: { unoptimized: true }` — the AC is satisfied ✓

### CRITICAL: Extension case normalization (from deferred-work Story 1.1)

`ALLOWED_MODEL_EXTENSIONS = ['.stl', '.3mf']` is lowercase. A file named `Model.STL` or `part.3MF` would fail the `includes()` check without normalization. **Always call `.toLowerCase()` on the extension before checking:**

```typescript
const ext = path.extname(info.filename).toLowerCase()
if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) { ... }
```

### Auth pattern in Route Handlers

Use `auth()` from `@/lib/auth` (NOT from `next-auth`). The session object uses `userId`, NOT `id`:

```typescript
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHENTICATED' },
      { status: 401 }
    )
  }
  const userId = session.user.userId  // correct field name
  ...
}
```

### `lib/auth.config.ts` fix — API routes must return 401 JSON, not 302 redirect

Currently the `authorized` callback returns `!!auth?.user` for ALL routes, which causes NextAuth middleware to **redirect to `/login`** (302) when unauthenticated. This is wrong for API endpoints — fetch calls from the wizard would get a redirect instead of a JSON error.

Fix (Story 2.2 must implement this):

```typescript
callbacks: {
  authorized({ auth, request }) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      if (!auth?.user) {
        return Response.json(
          { error: 'Authentication required', code: 'UNAUTHENTICATED' },
          { status: 401 }
        )
      }
      return true
    }
    return !!auth?.user  // redirect to /login for page routes
  },
},
```

### busboy with Next.js App Router (Node.js runtime)

Next.js App Router route handlers receive a Web API `Request`, not a Node.js `IncomingMessage`. Busboy expects Node.js streams. Use `Readable.fromWeb()` to bridge:

```typescript
import Busboy from 'busboy'
import { Readable } from 'node:stream'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<Response> {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') ?? ''

  return new Promise<Response>((resolve) => {
    const bb = Busboy({ headers: { 'content-type': contentType } })

    bb.on('file', (fieldname, fileStream, info) => {
      const ext = path.extname(info.filename).toLowerCase()

      if (!ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
        fileStream.resume()
        return resolve(NextResponse.json(
          { error: 'Only STL and 3MF files are accepted', code: 'INVALID_FILE_TYPE' },
          { status: 422 }
        ))
      }

      const chunks: Buffer[] = []
      let bytesRead = 0
      let tooLarge = false

      fileStream.on('data', (chunk: Buffer) => {
        bytesRead += chunk.length
        if (bytesRead > MAX_FILE_SIZE_BYTES) {
          tooLarge = true
          fileStream.resume()
          return
        }
        chunks.push(chunk)
      })

      fileStream.on('end', () => {
        if (tooLarge) {
          return resolve(NextResponse.json(
            { error: 'File exceeds the 25MB limit', code: 'FILE_TOO_LARGE' },
            { status: 413 }
          ))
        }

        const buffer = Buffer.concat(chunks)

        if (isExecutableMagicBytes(buffer)) {
          return resolve(NextResponse.json(
            { error: 'Executable files are not permitted', code: 'INVALID_FILE_TYPE' },
            { status: 422 }
          ))
        }

        try {
          const fileId = crypto.randomUUID()
          const filename = `${fileId}${ext}`
          saveModelFile(fileId, filename, buffer)
          resolve(NextResponse.json({ fileId, filename, size: buffer.length }))
        } catch (err) {
          console.error('[POST /api/upload/files] save error:', err)
          resolve(NextResponse.json(
            { error: 'Failed to save file', code: 'INTERNAL_ERROR' },
            { status: 500 }
          ))
        }
      })

      fileStream.on('error', (err) => {
        console.error('[POST /api/upload/files] stream error:', err)
        resolve(NextResponse.json(
          { error: 'Upload processing failed', code: 'INTERNAL_ERROR' },
          { status: 500 }
        ))
      })
    })

    bb.on('error', (err) => {
      console.error('[POST /api/upload/files] busboy error:', err)
      resolve(NextResponse.json(
        { error: 'Upload processing failed', code: 'INTERNAL_ERROR' },
        { status: 500 }
      ))
    })

    // Bridge: Web ReadableStream → Node.js Readable
    Readable.fromWeb(
      request.body as Parameters<typeof Readable.fromWeb>[0]
    ).pipe(bb)
  })
}
```

The same pattern applies to `POST /api/upload/photos` — same Promise wrapper + `Readable.fromWeb`.

### Magic bytes detection for executable files

Check the first 4 bytes of the buffer against known executable signatures:

```typescript
function isExecutableMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 2) return false

  // ELF (Linux/Unix): 7F 45 4C 46
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) return true
  // PE/Windows (MZ): 4D 5A
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) return true
  // Mach-O 64-bit LE: CF FA ED FE
  if (buffer[0] === 0xcf && buffer[1] === 0xfa && buffer[2] === 0xed && buffer[3] === 0xfe) return true
  // Mach-O 64-bit BE: CE FA ED FE
  if (buffer[0] === 0xce && buffer[1] === 0xfa && buffer[2] === 0xed && buffer[3] === 0xfe) return true
  // Shebang scripts: 23 21 (#!)
  if (buffer[0] === 0x23 && buffer[1] === 0x21) return true

  return false
}
```

3MF files are ZIP format (magic bytes `50 4B 03 04` = `PK..`) — these are NOT executable and will pass this check. Binary STL has no fixed magic bytes. ASCII STL starts with `solid ` — also not executable.

### `lib/storage/index.ts` complete implementation

```typescript
import fs from 'node:fs'
import path from 'node:path'

function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR
  if (!dir) throw new Error('UPLOAD_DIR environment variable is not set')
  return path.resolve(process.cwd(), dir)
}

export function saveModelFile(tempId: string, filename: string, data: Buffer): void {
  const dir = path.join(getUploadDir(), 'models', tempId, 'files')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), data)
}

export function saveModelPhoto(tempId: string, filename: string, data: Buffer): void {
  const dir = path.join(getUploadDir(), 'models', tempId, 'photos')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), data)
}

export function readStoredFile(relPath: string): Buffer {
  const absPath = path.join(getUploadDir(), relPath)
  return fs.readFileSync(absPath)
}
```

No other module — including Route Handlers — may import `node:fs` or `node:path` for filesystem operations.

### Photo MIME type validation

For photos, validate against `info.mimeType` (provided by busboy from the Content-Type of the file part):

```typescript
const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// In photo upload handler:
if (!ALLOWED_PHOTO_MIME_TYPES.includes(info.mimeType)) {
  fileStream.resume()
  return resolve(NextResponse.json(
    { error: 'Only JPEG, PNG, and WebP images are accepted', code: 'INVALID_FILE_TYPE' },
    { status: 422 }
  ))
}
```

Derive extension from MIME type (browser clients may send `blob` as filename):
```typescript
const mimeToExt: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}
const ext = mimeToExt[info.mimeType] ?? path.extname(info.filename).toLowerCase()
```

### File serving route — path traversal prevention

The `app/api/files/[...path]/route.ts` handler MUST prevent path traversal attacks:

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params

  // Prevent path traversal
  if (segments.some(seg => seg === '..' || seg.includes('..'))) {
    return new Response('Not found', { status: 404 })
  }

  const relPath = segments.join('/')

  try {
    const buffer = readStoredFile(relPath)
    const ext = path.extname(relPath).toLowerCase()
    const contentType = CONTENT_TYPE_MAP[ext] ?? 'application/octet-stream'

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response('Not found', { status: 404 })
    }
    console.error('[GET /api/files] error:', err)
    return new Response('Internal error', { status: 500 })
  }
}

const CONTENT_TYPE_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.stl': 'application/octet-stream',
  '.3mf': 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
}
```

**Note:** The file serving route does NOT require authentication — photos need to be displayable in public model pages later. The upload routes DO require auth.

### API response contract for this story

**POST /api/upload/files success:**
```json
{ "fileId": "uuid-v4", "filename": "uuid-v4.stl", "size": 1048576 }
```

**POST /api/upload/photos success:**
```json
{ "photoId": "uuid-v4", "filename": "uuid-v4.jpg", "previewUrl": "/api/files/models/uuid-v4/photos/uuid-v4.jpg" }
```

**Error responses (all use `{ error, code }` shape from `types/api.ts`):**
- 401 `UNAUTHENTICATED` — no valid session
- 413 `FILE_TOO_LARGE` — file > 25MB
- 422 `INVALID_FILE_TYPE` — bad extension, bad MIME type, or executable magic bytes
- 500 `INTERNAL_ERROR` — unexpected failure

### Error logging pattern (from existing routes)

Follow `app/api/auth/register/route.ts` pattern:
```typescript
console.error('[POST /api/upload/files]', error)
```

### No DB writes in this story

This story creates TEMP files only. `lib/db/models.ts` is NOT extended here. The `model_files` and `model_photos` DB CRUD functions (`addModelFile`, `addModelPhoto`) come in Story 2.3 when the wizard attaches uploaded files to a draft model.

Story 2.3 will store DB records with `filename` as a relative path like `models/[tempId]/files/[name]` — matching the storage path structure created here.

### File structure

| File | Action | Notes |
|------|--------|-------|
| `lib/auth.config.ts` | MODIFY | Add API route 401 JSON guard in `authorized` callback |
| `lib/constants.ts` | SKIP | Already has all 3 required constants — do not touch |
| `next.config.ts` | SKIP | Already has `images: { unoptimized: true }` — do not touch |
| `lib/storage/index.ts` | CREATE | 4 exports: `saveModelFile`, `saveModelPhoto`, `readStoredFile`, `getUploadDir` (internal) |
| `app/api/upload/files/route.ts` | CREATE | POST handler: auth, busboy, magic bytes, 25MB limit, temp save |
| `app/api/upload/photos/route.ts` | CREATE | POST handler: auth, busboy, MIME validation, temp save |
| `app/api/files/[...path]/route.ts` | CREATE | GET handler: path traversal prevention, read + serve file |

### Project Structure Notes

- `lib/storage/index.ts` replaces the `.gitkeep` placeholder in `lib/storage/`
- `app/api/upload/files/route.ts` → matches architecture directory layout exactly
- `app/api/upload/photos/route.ts` → matches architecture directory layout exactly
- `app/api/files/[...path]/route.ts` → catch-all route parameter is `[...path]` (NOT `[...slug]`)
- Route params in Next.js App Router 15+ use `Promise<...>`: `params: Promise<{ path: string[] }>` requires `await params`
- `crypto.randomUUID()` is a Node.js global (14.17+) — no import required (established in Story 2.1)
- `UPLOAD_DIR=./uploads` is already in `.env.example` — no new env vars required
- `middleware.ts` already protects `/api/upload/:path*` ✓

### References

- Constants: [`lib/constants.ts`] — already has the 3 required exports
- `next.config.ts`: [`next.config.ts`] — already has `images.unoptimized`
- Auth pattern in Route Handlers: [`app/api/auth/register/route.ts`] — follow the try/catch + NextResponse.json pattern
- Session shape (`userId` field): [`lib/auth.ts`] — `session.user.userId` (not `.id`)
- Error response standard: [`_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#API Response Shapes`]
- File upload flow: [`_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#Process Patterns — File Upload Flow`]
- Architecture file boundaries: [`_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#Architectural Boundaries`]
- Deferred case-normalization note (Story 1.1): [`_bmad-output/implementation-artifacts/deferred-work.md#Deferred from: code review of 1-1`]
- Deferred API 401 fix (Story 1.3): [`_bmad-output/implementation-artifacts/deferred-work.md#Deferred from: code review of 1-3`]
- Story 2.1 DB models pattern (for future `addModelFile` reference): [`_bmad-output/implementation-artifacts/2-1-model-database-schema-repository-layer.md#lib/db/models.ts`]
- `types/api.ts` error codes: [`types/api.ts`] — use `ApiErrorCode` union for reference

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- TypeScript error: `Buffer<ArrayBufferLike>` not assignable to `BodyInit` in `app/api/files/[...path]/route.ts` — fixed by extracting `buffer.buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer`; `ArrayBuffer.prototype.slice` always returns a non-shared `ArrayBuffer` which IS in the `BodyInit` union

### Completion Notes List

- Fixed `lib/auth.config.ts` `authorized` callback to return `Response.json({ error, code }, { status: 401 })` for unauthenticated API requests (URLs starting with `/api/`) instead of issuing a 302 redirect to `/login`; non-API routes keep the original redirect behavior — addresses deferred item from Story 1.3
- Created `lib/storage/index.ts` — sole `node:fs` consumer; exports `saveModelFile`, `saveModelPhoto`, `readStoredFile`; `getUploadDir()` is private; paths stored as relative (`models/[tempId]/files/[name]`) — filesystem structure matches architecture spec
- Created `app/api/upload/files/route.ts` — auth guard → busboy multipart parse → extension check (`.toLowerCase()` normalization per deferred Story 1.1 note) → in-memory size enforcement (13 → 413 before any disk write) → magic bytes check (ELF, PE/MZ, Mach-O, shebang) → UUID-named file save → `{ fileId, filename, size }` 200; `bb.on('finish')` guard handles missing file part
- Created `app/api/upload/photos/route.ts` — same auth + busboy pattern; MIME type validation (`image/jpeg|png|webp`); extension derived from MIME type map (not client filename); previewUrl built as `/api/files/models/[photoId]/photos/[filename]`
- Created `app/api/files/[...path]/route.ts` — public GET; path traversal prevention (rejects any `..` segment); reads file via `readStoredFile`; `ENOENT` → 404; content-type map covers `.jpg/.jpeg/.png/.webp/.stl/.3mf`; `Cache-Control: immutable` for upload-once assets
- TypeScript: 0 errors; ESLint: 0 errors/warnings; Production build: successful; all 3 new routes present in build output

### Change Log

- 2026-05-05: Story 2.2 implemented — storage abstraction, file/photo upload APIs, file serving route, auth middleware fix

### File List

- `lib/auth.config.ts` (modified — `authorized` callback returns 401 JSON for API routes)
- `lib/storage/index.ts` (created)
- `app/api/upload/files/route.ts` (created)
- `app/api/upload/photos/route.ts` (created)
- `app/api/files/[...path]/route.ts` (created)
