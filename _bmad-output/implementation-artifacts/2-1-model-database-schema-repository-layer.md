# Story 2.1: Model Database Schema & Repository Layer

Status: done

## Story

As a developer,
I want the model-related database tables created and a typed repository layer in place,
so that uploaded model data can be stored and retrieved by the upload wizard stories.

## Acceptance Criteria

1. **Given** `lib/db/schema.sql` already contains the `users` table from Story 1.2
   **When** the schema is applied (server starts — `db.exec(schema)` runs automatically in `lib/db/index.ts`)
   **Then** the tables `models`, `model_files`, `model_photos`, `tags`, `model_tags`, `categories` all exist
   **And** `models` has exact columns: `id TEXT PRIMARY KEY`, `user_id TEXT NOT NULL REFERENCES users(id)`, `title TEXT NOT NULL`, `description TEXT`, `layer_height_mm REAL`, `infill_percent INTEGER`, `supports_required INTEGER`, `filament_type TEXT`, `license TEXT NOT NULL DEFAULT 'free'`, `is_published INTEGER NOT NULL DEFAULT 0`, `is_draft INTEGER NOT NULL DEFAULT 1`, `download_count INTEGER NOT NULL DEFAULT 0`, `created_at INTEGER NOT NULL`, `published_at INTEGER`
   **And** `model_files` has: `id`, `model_id` (FK → models with ON DELETE CASCADE), `filename`, `file_size_bytes`, `original_name`, `created_at`
   **And** `model_photos` has: `id`, `model_id` (FK → models with ON DELETE CASCADE), `filename`, `alt_text`, `display_order`, `created_at`
   **And** `categories` is seeded with 11 predefined platform categories (INSERT OR IGNORE — idempotent)
   **And** `tags` is seeded with 15 predefined platform tags (`is_predefined = 1`)
   **And** `model_tags` is a junction table linking models and tags
   **And** indexes exist on `models.user_id`, `models.is_published`, `models.created_at`

2. **Given** the schema is applied
   **When** `lib/db/models.ts` is imported
   **Then** it exports: `createDraftModel(userId, data): DraftModel`, `updateDraftModel(id, data): Model`, `publishModel(id): Model`, `getModelById(id): Model | null`, `listModelsByUser(userId): Model[]`
   **And** all functions follow the `DbXxxRow → camelCase TypeScript` mapping pattern from `lib/db/users.ts`
   **And** Unix timestamp columns are returned as ISO 8601 strings
   **And** SQLite INTEGER boolean columns (0/1) are returned as TypeScript `boolean`

3. **Given** `types/model.ts` is imported
   **When** TypeScript compiles
   **Then** it exports: `Model`, `DraftModel`, `ModelFile`, `ModelPhoto`, `PrintMetadata` with camelCase fields

## Tasks / Subtasks

- [x] Extend `lib/db/schema.sql` — append tables, indexes, seeds (AC: #1)
  - [x] Append `CREATE TABLE IF NOT EXISTS models (...)` with all 14 specified columns
  - [x] Append `CREATE TABLE IF NOT EXISTS model_files (...)` with 6 columns
  - [x] Append `CREATE TABLE IF NOT EXISTS model_photos (...)` with 7 columns
  - [x] Append `CREATE TABLE IF NOT EXISTS categories (...)` with 4 columns
  - [x] Append `CREATE TABLE IF NOT EXISTS tags (...)` with 3 columns
  - [x] Append `CREATE TABLE IF NOT EXISTS model_tags (...)` composite PK junction table
  - [x] Append required indexes: `idx_models_user_id`, `idx_models_is_published`, `idx_models_created_at`
  - [x] Append supporting indexes: `idx_model_files_model_id`, `idx_model_photos_model_id`, `idx_model_photos_model_display_order`, `idx_model_tags_model_id`, `idx_model_tags_tag_id`
  - [x] Append `INSERT OR IGNORE INTO categories` for 11 predefined categories
  - [x] Append `INSERT OR IGNORE INTO tags` for 15 predefined tags with `is_predefined = 1`
  - [x] Verify existing `users` table DDL and its indexes are unchanged (append-only edit)

- [x] Create `types/model.ts` — TypeScript types (AC: #3)
  - [x] Export `PrintMetadata` interface: 4 nullable fields (layerHeightMm, infillPercent, supportsRequired, filamentType)
  - [x] Export `Model` interface: all 14 DB columns mapped to camelCase; `isPublished`, `isDraft`, `supportsRequired` are TypeScript `boolean | null` not `number`
  - [x] Export `DraftModel` as type alias: `export type DraftModel = Model`
  - [x] Export `ModelFile` interface: 6 camelCase fields
  - [x] Export `ModelPhoto` interface: 7 camelCase fields (`altText: string | null`)

- [x] Create `lib/db/models.ts` — repository functions (AC: #2)
  - [x] Define internal `DbModelRow` interface (snake_case, mirrors schema)
  - [x] Implement `mapRowToModel(row: DbModelRow): Model` (converts types; see Dev Notes)
  - [x] Define internal `CreateDraftModelInput` type: `{ title: string }`
  - [x] Define internal `UpdateDraftModelInput` type: all metadata fields optional
  - [x] Implement `createDraftModel(userId, data): DraftModel` — INSERT + return via getModelById
  - [x] Implement `updateDraftModel(id, data): Model` — dynamic SET clause, only updates provided fields
  - [x] Implement `publishModel(id): Model` — sets is_published=1, is_draft=0, published_at=now
  - [x] Implement `getModelById(id): Model | null` — SELECT * by id
  - [x] Implement `listModelsByUser(userId): Model[]` — ORDER BY created_at DESC

- [x] Verify (AC: all)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors, 0 warnings (`npm run lint`)
  - [x] Manual: confirm tables exist — verified via Node.js script: all 7 tables (users + 6 new) present
  - [x] Manual: confirm categories seeded — 11 categories confirmed
  - [x] Manual: confirm predefined tags seeded — 15 predefined tags confirmed

### Review Findings (AI)

- [x] [Review][Patch] `updateDraftModel` / `publishModel` lack `AND is_draft = 1` guard — can mutate or re-publish already-published models [lib/db/models.ts]
- [x] [Review][Patch] `updateDraftModel` / `publishModel` unsafe null cast when `id` doesn't exist — no `RunResult.changes` check before `getModelById(id) as Model` [lib/db/models.ts]
- [x] [Review][Patch] `PRAGMA foreign_keys = ON` missing — all `ON DELETE CASCADE` and `REFERENCES` constraints silently non-enforced [lib/db/index.ts]
- [x] [Review][Defer] `infillPercent` / `layer_height_mm` have no DB-level range constraints [lib/db/schema.sql] — deferred, pre-existing
- [x] [Review][Defer] `license` has no DB-level enumeration constraint [lib/db/schema.sql] — deferred, pre-existing
- [x] [Review][Defer] `is_published` + `is_draft` dual-column inconsistency — no `CHECK` constraint prevents both being 1 simultaneously [lib/db/schema.sql] — deferred, pre-existing

## Dev Notes

### CRITICAL: schema.sql is append-only and must be idempotent

`lib/db/index.ts` calls `db.exec(schema)` on **every server connection**. All new DDL **must** use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`. Seeding **must** use `INSERT OR IGNORE`. Bare `CREATE TABLE` would crash on the second server start.

Do NOT modify the existing `users` table or its indexes. Append the new DDL after the existing content.

### Complete SQL for `lib/db/schema.sql` (append after existing content)

```sql
-- ============================================================
-- Epic 2: Model Upload & Publishing Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  layer_height_mm REAL,
  infill_percent INTEGER,
  supports_required INTEGER,    -- NULL=not set, 0=false, 1=true (no BOOLEAN in SQLite)
  filament_type TEXT,
  license TEXT NOT NULL DEFAULT 'free',
  is_published INTEGER NOT NULL DEFAULT 0,
  is_draft INTEGER NOT NULL DEFAULT 1,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,  -- Unix timestamp (seconds)
  published_at INTEGER          -- NULL until published
);

CREATE TABLE IF NOT EXISTS model_files (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS model_photos (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,  -- 0 = primary/thumbnail photo
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,   -- drives /categories/[slug] URL routing
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  is_predefined INTEGER NOT NULL DEFAULT 0  -- 1=platform chip, 0=user custom tag
);

CREATE TABLE IF NOT EXISTS model_tags (
  model_id TEXT NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (model_id, tag_id)
);

-- Required indexes (from AC)
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_is_published ON models(is_published);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at);

-- Supporting indexes (for Epic 2+ queries)
CREATE INDEX IF NOT EXISTS idx_model_files_model_id ON model_files(model_id);
CREATE INDEX IF NOT EXISTS idx_model_photos_model_id ON model_photos(model_id);
CREATE INDEX IF NOT EXISTS idx_model_photos_model_display_order ON model_photos(model_id, display_order);
CREATE INDEX IF NOT EXISTS idx_model_tags_model_id ON model_tags(model_id);
CREATE INDEX IF NOT EXISTS idx_model_tags_tag_id ON model_tags(tag_id);

-- ============================================================
-- Category seed (idempotent — INSERT OR IGNORE)
-- These drive /categories/[slug] pages (FR18)
-- ============================================================

INSERT OR IGNORE INTO categories (id, name, slug, created_at) VALUES
  ('cat-001', 'Home & Organization', 'home-organization', 1746403200),
  ('cat-002', 'Workshop & Tools',    'workshop-tools',    1746403200),
  ('cat-003', 'Art & Decoration',    'art-decoration',    1746403200),
  ('cat-004', 'Hobby & Gaming',      'hobby-gaming',      1746403200),
  ('cat-005', 'Electronics & Tech',  'electronics-tech',  1746403200),
  ('cat-006', 'Fashion & Jewelry',   'fashion-jewelry',   1746403200),
  ('cat-007', 'Outdoor & Garden',    'outdoor-garden',    1746403200),
  ('cat-008', 'Toys & Miniatures',   'toys-miniatures',   1746403200),
  ('cat-009', 'Education',           'education',         1746403200),
  ('cat-010', 'Automotive',          'automotive',        1746403200),
  ('cat-011', 'Other',               'other',             1746403200);

-- ============================================================
-- Predefined tag seed (idempotent — INSERT OR IGNORE)
-- These appear as chip buttons in wizard Step 4 TagSelector
-- is_predefined=1 means shown as chips; custom tags use is_predefined=0
-- ============================================================

INSERT OR IGNORE INTO tags (id, name, is_predefined) VALUES
  ('tag-001', 'functional',   1),
  ('tag-002', 'decorative',   1),
  ('tag-003', 'workshop',     1),
  ('tag-004', 'tools',        1),
  ('tag-005', 'miniature',    1),
  ('tag-006', 'home',         1),
  ('tag-007', 'garden',       1),
  ('tag-008', 'gaming',       1),
  ('tag-009', 'jewelry',      1),
  ('tag-010', 'educational',  1),
  ('tag-011', 'organizer',    1),
  ('tag-012', 'holder',       1),
  ('tag-013', 'mount',        1),
  ('tag-014', 'enclosure',    1),
  ('tag-015', 'no-supports',  1);
```

**Note on category/tag lists:** These lists are not explicitly defined in any planning document — they are reasonable defaults for a 3D printing platform. If Romko wants different categories or tags, update both the SQL seeds and any future UI constants that reference them.

**Note on the `tags` UNIQUE constraint:** Custom tags added by creators are stored in the same `tags` table with `is_predefined = 0`. If a user types a custom tag matching a predefined name, `INSERT OR IGNORE` uses the existing tag. Stories 2.3/2.4 handle the upsert logic for custom tags.

### `types/model.ts` — complete implementation

```typescript
export interface PrintMetadata {
  layerHeightMm: number | null
  infillPercent: number | null
  supportsRequired: boolean | null
  filamentType: string | null
}

export interface Model {
  id: string
  userId: string
  title: string
  description: string | null
  layerHeightMm: number | null
  infillPercent: number | null
  supportsRequired: boolean | null  // converted from SQLite INTEGER (0/1/NULL)
  filamentType: string | null
  license: string
  isPublished: boolean              // converted from SQLite INTEGER
  isDraft: boolean                  // converted from SQLite INTEGER
  downloadCount: number
  createdAt: string                 // ISO 8601
  publishedAt: string | null        // ISO 8601 or null
}

export type DraftModel = Model      // same shape; isDraft is always true at creation

export interface ModelFile {
  id: string
  modelId: string
  filename: string
  fileSizeBytes: number
  originalName: string
  createdAt: string  // ISO 8601
}

export interface ModelPhoto {
  id: string
  modelId: string
  filename: string
  altText: string | null
  displayOrder: number
  createdAt: string  // ISO 8601
}
```

### `lib/db/models.ts` — complete implementation

```typescript
import type { Model, DraftModel } from '@/types/model'
import { db } from './index'

interface DbModelRow {
  id: string
  user_id: string
  title: string
  description: string | null
  layer_height_mm: number | null
  infill_percent: number | null
  supports_required: number | null   // 0, 1, or NULL
  filament_type: string | null
  license: string
  is_published: number               // 0 or 1
  is_draft: number                   // 0 or 1
  download_count: number
  created_at: number                 // Unix seconds
  published_at: number | null
}

function mapRowToModel(row: DbModelRow): Model {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    layerHeightMm: row.layer_height_mm,
    infillPercent: row.infill_percent,
    supportsRequired: row.supports_required !== null ? Boolean(row.supports_required) : null,
    filamentType: row.filament_type,
    license: row.license,
    isPublished: Boolean(row.is_published),
    isDraft: Boolean(row.is_draft),
    downloadCount: row.download_count,
    createdAt: new Date(row.created_at * 1000).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at * 1000).toISOString() : null,
  }
}

interface UpdateDraftModelInput {
  title?: string
  description?: string
  layerHeightMm?: number | null
  infillPercent?: number | null
  supportsRequired?: boolean | null
  filamentType?: string | null
}

export function createDraftModel(userId: string, data: { title: string }): DraftModel {
  const id = crypto.randomUUID()
  const createdAt = Math.floor(Date.now() / 1000)
  db.prepare(
    `INSERT INTO models (id, user_id, title, is_draft, is_published, download_count, created_at, license)
     VALUES (?, ?, ?, 1, 0, 0, ?, 'free')`
  ).run(id, userId, data.title, createdAt)
  return getModelById(id) as DraftModel
}

export function updateDraftModel(id: string, data: UpdateDraftModelInput): Model {
  type ColVal = { col: string; val: string | number | null }
  const fields: ColVal[] = []

  if ('title' in data)           fields.push({ col: 'title',            val: data.title ?? null })
  if ('description' in data)     fields.push({ col: 'description',      val: data.description ?? null })
  if ('layerHeightMm' in data)   fields.push({ col: 'layer_height_mm',  val: data.layerHeightMm ?? null })
  if ('infillPercent' in data)   fields.push({ col: 'infill_percent',   val: data.infillPercent ?? null })
  if ('filamentType' in data)    fields.push({ col: 'filament_type',    val: data.filamentType ?? null })
  if ('supportsRequired' in data) fields.push({
    col: 'supports_required',
    val: data.supportsRequired !== null && data.supportsRequired !== undefined
      ? (data.supportsRequired ? 1 : 0)
      : null,
  })

  if (fields.length > 0) {
    const setClause = fields.map(f => `${f.col} = ?`).join(', ')
    const params = [...fields.map(f => f.val), id]
    db.prepare(`UPDATE models SET ${setClause} WHERE id = ?`).run(...params)
  }

  return getModelById(id) as Model
}

export function publishModel(id: string): Model {
  const publishedAt = Math.floor(Date.now() / 1000)
  db.prepare(
    `UPDATE models SET is_published = 1, is_draft = 0, published_at = ? WHERE id = ?`
  ).run(publishedAt, id)
  return getModelById(id) as Model
}

export function getModelById(id: string): Model | null {
  const row = db
    .prepare('SELECT * FROM models WHERE id = ?')
    .get(id) as DbModelRow | undefined
  return row ? mapRowToModel(row) : null
}

export function listModelsByUser(userId: string): Model[] {
  const rows = db
    .prepare('SELECT * FROM models WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as DbModelRow[]
  return rows.map(mapRowToModel)
}
```

### Key Pattern Details

**`mapRowToModel` boolean conversion:**
- `is_published` and `is_draft`: always 0 or 1 → `Boolean(row.is_published)` (no null check needed; NOT NULL columns)
- `supports_required`: can be NULL (user hasn't selected yes/no yet) → `row.supports_required !== null ? Boolean(row.supports_required) : null`

**`updateDraftModel` dynamic SQL is safe:**
Column names come from a fixed hardcoded list, not user input. Only values are parameterized. No SQL injection risk.

**`createDraftModel` + `getModelById` pattern:**
Same as `createUser` in `users.ts` — INSERT, then read back via SELECT to return the full typed object. Avoids manually reconstructing the object with defaults.

**`db.prepare(...).run(...params)` spread:**
better-sqlite3's `run()` accepts individual positional arguments. Spreading `params` array works. TypeScript may flag `unknown[]` spread — cast `params` to `(string | number | null)[]` if needed.

### What Must NOT Change

- `lib/db/index.ts` — no changes; schema.sql loads automatically
- `lib/db/users.ts` — no changes
- `lib/db/schema.sql` existing content (users table + indexes) — append only
- `types/user.ts`, `types/api.ts` — no changes
- All auth and component files

### File Summary

| File | Action | Notes |
|------|--------|-------|
| `lib/db/schema.sql` | MODIFY | Append-only — 6 new tables, 9 new indexes, category + tag seeds |
| `types/model.ts` | CREATE | 5 exports: Model, DraftModel, ModelFile, ModelPhoto, PrintMetadata |
| `lib/db/models.ts` | CREATE | 5 function exports; follows `users.ts` pattern exactly |

### Project Structure Notes

- `lib/db/models.ts` goes directly in `lib/db/` — same level as `users.ts`
- `types/model.ts` goes directly in `types/` — same level as `user.ts`
- No new packages required — `better-sqlite3` already installed (Story 1.2)
- `crypto.randomUUID()` is a global in Node.js 14.17+ / Next.js 13+ — no import required
- `ModelFile` and `ModelPhoto` CRUD functions (addModelFile, addModelPhoto, etc.) are NOT part of this story — they come in Story 2.2 when file upload is implemented

### References

- Users repository pattern: [`lib/db/users.ts`] — follow exactly
- DB connection singleton behavior: [`lib/db/index.ts`] — schema runs via `db.exec(schema)` at startup
- Type shape precedent: [`types/user.ts`] — camelCase, ISO 8601 strings
- Schema idempotency requirement: [`_bmad-output/implementation-artifacts/deferred-work.md` — Story 1.2 deferred items]
- Naming conventions (snake_case DB, camelCase TS): [`_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#Naming Patterns`]
- Project directory layout: [`_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#Structure Patterns`]
- Story 2.1 AC: [`_bmad-output/planning-artifacts/epics/epic-2-model-upload-publishing.md#Story 2.1`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No blockers encountered.

### Completion Notes List

- Appended 6 new `CREATE TABLE IF NOT EXISTS` statements to `lib/db/schema.sql` (models, model_files, model_photos, categories, tags, model_tags); existing users table and its indexes untouched
- Appended 8 new `CREATE INDEX IF NOT EXISTS` indexes (3 required by AC + 5 supporting)
- Seeded 11 predefined categories and 15 predefined tags via `INSERT OR IGNORE` (idempotent)
- Created `types/model.ts` with 5 exports: `PrintMetadata`, `Model`, `DraftModel` (type alias), `ModelFile`, `ModelPhoto`; SQLite 0/1 integers typed as `boolean | null`, timestamps typed as ISO 8601 strings
- Created `lib/db/models.ts` with 5 exported repository functions following the `users.ts` pattern exactly; `updateDraftModel` uses dynamic SET clause with fixed column-name list (no injection risk); `createDraftModel` returns via `getModelById` to avoid manually reconstructing defaults
- TypeScript: 0 errors; Production build: successful; ESLint: 0 errors/warnings
- Schema correctness verified via Node.js `better-sqlite3` script: all 7 tables present, all 11 categories seeded, all 15 predefined tags seeded, all 10 indexes present

### Change Log

- 2026-05-05: Story 2.1 implemented — model schema, types, and repository layer

### File List

- `lib/db/schema.sql` (modified — appended Epic 2 tables, indexes, and seeds)
- `types/model.ts` (created)
- `lib/db/models.ts` (created)
