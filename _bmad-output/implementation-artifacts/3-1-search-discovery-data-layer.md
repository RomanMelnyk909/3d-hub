# Story 3.1: Search & Discovery Data Layer

Status: done

## Story

As a developer,
I want the model list queries, category data, and FTS5 full-text search table in place,
so that the homepage grid, category pages, and search features have a typed data layer to build against.

## Acceptance Criteria

1. **Given** `lib/db/schema.sql` already contains the `models` and related tables from Story 2.1
   **When** the schema update is applied
   **Then** a `models_fts` FTS5 virtual table exists that indexes `title`, `description`, and concatenated tag values from `models` and `model_tags`
   **And** a `download_events` table exists with columns: `id`, `model_id` (FK), `user_id` (FK), `downloaded_at INTEGER`
   **And** `categories` table is populated with the platform's predefined category slugs and display names

2. **Given** `lib/db/models.ts` is updated
   **When** list and search functions are called
   **Then** it exports: `listPublishedModels({ page, limit, category?, sort? }): PaginatedResponse<Model>`, `getFeaturedModels(limit): Model[]`
   **And** `sort` defaults to `download_count DESC`; also supports `created_at DESC`
   **And** responses follow the `{ items, total, page, limit, hasMore }` shape

3. **Given** `lib/db/search.ts` is implemented
   **When** search functions are called
   **Then** it exports: `searchModels(query, filters): PaginatedResponse<Model>`, `getSearchSuggestions(query): SearchSuggestion[]`
   **And** `searchModels` queries `models_fts` for full-text matches and applies exact-match filtering for category slug and uploader username
   **And** `getSearchSuggestions` returns up to 5 results grouped by type: Models, Tags, Creators
   **And** `types/search.ts` defines `SearchQuery`, `SearchResult`, `SearchSuggestion` types

## Tasks / Subtasks

- [x] Update `lib/db/schema.sql` — add new schema elements (AC: #1)
  - [x] Add `ALTER TABLE models ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES categories(id);` (idempotent via SQLite 3.37+ `IF NOT EXISTS`)
  - [x] Add `CREATE INDEX IF NOT EXISTS idx_models_category_id ON models(category_id);`
  - [x] Add `CREATE VIRTUAL TABLE IF NOT EXISTS models_fts USING fts5(model_id UNINDEXED, title, description, tags);`
  - [x] Add `CREATE TABLE IF NOT EXISTS download_events (id TEXT PRIMARY KEY, model_id TEXT NOT NULL REFERENCES models(id), user_id TEXT NOT NULL REFERENCES users(id), downloaded_at INTEGER NOT NULL);`
  - [x] Add `CREATE INDEX IF NOT EXISTS idx_download_events_model_id ON download_events(model_id);`
  - [x] Add `CREATE INDEX IF NOT EXISTS idx_download_events_user_id ON download_events(user_id);`
  - [x] Verify `categories` table seed already present (it is — cat-001 through cat-011 seeded in Epic 2 schema)

- [x] Update `types/model.ts` — add `categoryId` to `Model` interface (AC: #2)
  - [x] Add `categoryId: string | null` field to `Model` interface

- [x] Update `lib/db/models.ts` — add list functions and FTS5 population (AC: #2)
  - [x] Add `category_id: string | null` to `DbModelRow` interface
  - [x] Add `categoryId: row.category_id ?? null` mapping in `mapRowToModel`
  - [x] Add `listPublishedModels({ page, limit, category?, sort? }: ListPublishedModelsOptions): PaginatedResponse<Model>` — see Dev Notes for SQL pattern
  - [x] Add `getFeaturedModels(limit: number): Model[]` — `SELECT * FROM models WHERE is_published = 1 ORDER BY download_count DESC LIMIT ?`
  - [x] Update `publishModel` to populate `models_fts` after publishing — see Dev Notes for FTS5 insert pattern
  - [x] Export `ListPublishedModelsOptions` interface: `{ page?: number; limit?: number; category?: string; sort?: 'downloads' | 'newest' }`

- [x] Create `types/search.ts` — define search types (AC: #3)
  - [x] `SearchQuery` interface — see Dev Notes for fields
  - [x] `SearchResult` type alias: `export type SearchResult = Model`
  - [x] `SearchSuggestion` interface — see Dev Notes for fields

- [x] Create `lib/db/search.ts` — implement FTS5 search (AC: #3)
  - [x] `searchModels(query: SearchQuery): PaginatedResponse<Model>` — FTS5 MATCH + optional filters, see Dev Notes
  - [x] `getSearchSuggestions(query: string): SearchSuggestion[]` — up to 5 results: 2 models, 2 tags, 1 creator, see Dev Notes
  - [x] Wrap FTS5 MATCH in try/catch to handle malformed query strings safely

- [x] Verify (AC: all)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors (`npm run lint`)

## Dev Notes

### CRITICAL: Schema Migration Strategy

This project has no migration system — `lib/db/index.ts` runs the entire `schema.sql` via `db.exec()` on every startup. All DDL must be **idempotent**.

- `CREATE TABLE IF NOT EXISTS` and `CREATE VIRTUAL TABLE IF NOT EXISTS` are already idempotent.
- `CREATE INDEX IF NOT EXISTS` is idempotent.
- Adding a column to the existing `models` table uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` which requires **SQLite ≥ 3.37.0** (Nov 2021). The project uses `better-sqlite3` v9+, which bundles SQLite 3.45+, so this is safe.

```sql
-- Add to schema.sql (idempotent — safe to run multiple times)
ALTER TABLE models ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES categories(id);
CREATE INDEX IF NOT EXISTS idx_models_category_id ON models(category_id);
```

**Note:** Existing rows in `models` will have `category_id = NULL`. The upload wizard (Story 2.4) does not include a category selector — that gap is expected and not in scope for this story. The column is added here so the data layer is ready for Story 3.3 (category browsing).

### FTS5 Virtual Table Schema

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS models_fts USING fts5(
  model_id UNINDEXED,
  title,
  description,
  tags
);
```

- `model_id UNINDEXED`: stored for joining back to `models`, not FTS-indexed.
- `tags`: space-separated concatenation of tag names (populated at publish time, not via trigger).
- There is **no automatic sync** — the FTS5 table must be populated explicitly in `publishModel`.

### FTS5 Population in `publishModel`

After updating the model row to `is_published = 1`, collect the model's tags and insert into `models_fts`:

```typescript
export function publishModel(id: string, userId: string): Model {
  const publishedAt = Math.floor(Date.now() / 1000)
  const result = db.prepare(
    `UPDATE models SET is_published = 1, is_draft = 0, published_at = ? WHERE id = ? AND is_draft = 1 AND user_id = ?`
  ).run(publishedAt, id, userId)
  if (result.changes === 0) throw new Error(`Model not found or not a draft: ${id}`)

  const model = getModelById(id)
  if (!model) throw new Error(`Model not found after publish: ${id}`)

  // Populate FTS5 — delete any existing entry first (idempotent re-publish)
  const tags = db.prepare(
    `SELECT t.name FROM tags t JOIN model_tags mt ON t.id = mt.tag_id WHERE mt.model_id = ?`
  ).all(id) as { name: string }[]
  const tagString = tags.map(t => t.name).join(' ')

  db.prepare('DELETE FROM models_fts WHERE model_id = ?').run(id)
  db.prepare(
    'INSERT INTO models_fts(model_id, title, description, tags) VALUES (?, ?, ?, ?)'
  ).run(id, model.title, model.description ?? '', tagString)

  return model
}
```

### `listPublishedModels` — Dynamic SQL Pattern

```typescript
interface ListPublishedModelsOptions {
  page?: number
  limit?: number
  category?: string  // category slug, e.g. 'workshop-tools'
  sort?: 'downloads' | 'newest'
}

export function listPublishedModels(opts: ListPublishedModelsOptions = {}): PaginatedResponse<Model> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? PAGE_SIZE))
  const offset = (page - 1) * limit
  const orderBy = opts.sort === 'newest' ? 'created_at DESC' : 'download_count DESC'

  let whereClause = 'WHERE m.is_published = 1'
  const params: (string | number)[] = []

  if (opts.category) {
    whereClause += ' AND m.category_id = (SELECT id FROM categories WHERE slug = ?)'
    params.push(opts.category)
  }

  const total = (db.prepare(
    `SELECT COUNT(*) as count FROM models m ${whereClause}`
  ).get(...params) as { count: number }).count

  const rows = db.prepare(
    `SELECT m.* FROM models m ${whereClause} ORDER BY m.${orderBy} LIMIT ? OFFSET ?`
  ).all(...params, limit, offset) as DbModelRow[]

  return {
    items: rows.map(mapRowToModel),
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
  }
}
```

**Import `PAGE_SIZE` from `@/lib/constants`** — it's already defined as `24`.

### `types/search.ts` — Types

```typescript
import type { Model } from '@/types/model'

export interface SearchQuery {
  q: string
  category?: string   // category slug
  uploader?: string   // username
  sort?: 'downloads' | 'newest' | 'az'
  page?: number
  limit?: number
}

export type SearchResult = Model

export interface SearchSuggestion {
  type: 'model' | 'tag' | 'creator'
  id: string
  label: string
  url: string    // navigation target: '/models/[id]', '/?tag=[name]', '/users/[username]'
}
```

### `lib/db/search.ts` — FTS5 Query Pattern

```typescript
import { db } from './index'
import type { Model } from '@/types/model'
import type { SearchQuery, SearchSuggestion } from '@/types/search'
import type { PaginatedResponse } from '@/types/api'
import { PAGE_SIZE } from '@/lib/constants'
import { mapRowToModel, type DbModelRow } from './models'  // see note below

export function searchModels(query: SearchQuery): PaginatedResponse<Model> {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(100, Math.max(1, query.limit ?? PAGE_SIZE))
  const offset = (page - 1) * limit

  // Sanitize FTS5 query — wrap in quotes to prevent parse errors on special chars
  const ftsQuery = `"${query.q.replace(/"/g, '')}"`

  const joinClause = `
    FROM models_fts fts
    JOIN models m ON m.id = fts.model_id
    WHERE fts MATCH ? AND m.is_published = 1
  `
  const baseParams: (string | number)[] = [ftsQuery]

  let filterClause = ''
  const filterParams: (string | number)[] = []

  if (query.category) {
    filterClause += ' AND m.category_id = (SELECT id FROM categories WHERE slug = ?)'
    filterParams.push(query.category)
  }
  if (query.uploader) {
    filterClause += ' AND m.user_id = (SELECT id FROM users WHERE username = ?)'
    filterParams.push(query.uploader)
  }

  const orderBy = query.sort === 'newest'
    ? 'ORDER BY m.created_at DESC'
    : query.sort === 'az'
      ? 'ORDER BY m.title ASC'
      : 'ORDER BY rank'  // FTS5 BM25 relevance (default)

  const allParams = [...baseParams, ...filterParams]

  try {
    const total = (db.prepare(
      `SELECT COUNT(*) as count ${joinClause}${filterClause}`
    ).get(...allParams) as { count: number }).count

    const rows = db.prepare(
      `SELECT m.* ${joinClause}${filterClause} ${orderBy} LIMIT ? OFFSET ?`
    ).all(...allParams, limit, offset) as DbModelRow[]

    return {
      items: rows.map(mapRowToModel),
      total,
      page,
      limit,
      hasMore: offset + rows.length < total,
    }
  } catch {
    // FTS5 throws on malformed query syntax — return empty instead of 500
    return { items: [], total: 0, page, limit, hasMore: false }
  }
}

export function getSearchSuggestions(query: string): SearchSuggestion[] {
  if (query.length < 2) return []
  const suggestions: SearchSuggestion[] = []
  const ftsQuery = `"${query.replace(/"/g, '')}*"`  // prefix match

  // Up to 2 model title suggestions
  try {
    const models = db.prepare(
      `SELECT m.id, m.title FROM models_fts fts
       JOIN models m ON m.id = fts.model_id
       WHERE fts MATCH ? AND m.is_published = 1
       ORDER BY rank LIMIT 2`
    ).all(ftsQuery) as { id: string; title: string }[]
    for (const m of models) {
      suggestions.push({ type: 'model', id: m.id, label: m.title, url: `/models/${m.id}` })
    }
  } catch { /* malformed query */ }

  // Up to 2 tag suggestions
  const tags = db.prepare(
    `SELECT id, name FROM tags WHERE name LIKE ? LIMIT 2`
  ).all(`%${query}%`) as { id: string; name: string }[]
  for (const t of tags) {
    suggestions.push({ type: 'tag', id: t.id, label: t.name, url: `/?tag=${encodeURIComponent(t.name)}` })
  }

  // Up to 1 creator suggestion
  const creators = db.prepare(
    `SELECT id, username FROM users WHERE username LIKE ? LIMIT 1`
  ).all(`%${query}%`) as { id: string; username: string }[]
  for (const c of creators) {
    suggestions.push({ type: 'creator', id: c.id, label: c.username, url: `/users/${c.username}` })
  }

  return suggestions.slice(0, 5)
}
```

### CRITICAL: `mapRowToModel` and `DbModelRow` Export

`lib/db/search.ts` needs to call `mapRowToModel` and use `DbModelRow` from `lib/db/models.ts`. These are currently private (not exported). You must **export both** from `models.ts`:

```typescript
// lib/db/models.ts — change from non-exported to exported
export interface DbModelRow { ... }   // add export keyword
export function mapRowToModel(row: DbModelRow): Model { ... }  // add export keyword
```

This allows `search.ts` to reuse the exact same row mapping without duplicating it.

### FTS5 MATCH Query Safety

FTS5 throws a SQLite error if the query string contains invalid FTS5 syntax (e.g., bare `+`, `-`, `OR` without operands). Always sanitize before passing to MATCH:
- Strip double-quote characters: `query.replace(/"/g, '')`
- Wrap in double quotes: `"${sanitized}"` — treats the whole phrase as a quoted string
- For suggestions (prefix search): append `*`: `"${sanitized}*"`

Always wrap FTS5 queries in try/catch and return empty results on error — never let malformed search input cause a 500.

### `PaginatedResponse<T>` — Already in `types/api.ts`

The `{ items, total, page, limit, hasMore }` shape is already defined:
```typescript
// types/api.ts:15
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```
Import from `@/types/api`, do NOT redefine.

### `PAGE_SIZE` — Already in `lib/constants.ts`

```typescript
// lib/constants.ts:3
export const PAGE_SIZE = 24;
```
Import from `@/lib/constants`, do NOT redeclare.

### categories Table — Already Seeded

The `categories` table was seeded in Story 2.1 (lib/db/schema.sql lines 86–97) with 11 categories:
`cat-001` (Home & Organization) through `cat-011` (Other). AC #1 "categories table is populated" is already satisfied — no additional seed work needed.

### File Structure

| File | Action | Notes |
|------|--------|-------|
| `lib/db/schema.sql` | MODIFY | Add ALTER TABLE category_id, FTS5 table, download_events, indexes |
| `types/model.ts` | MODIFY | Add `categoryId: string \| null` to Model interface |
| `lib/db/models.ts` | MODIFY | Export DbModelRow + mapRowToModel; add listPublishedModels, getFeaturedModels; update publishModel for FTS5 |
| `types/search.ts` | CREATE | SearchQuery, SearchResult, SearchSuggestion |
| `lib/db/search.ts` | CREATE | searchModels, getSearchSuggestions |

**Do NOT create any API route handlers in this story** — `app/api/search/route.ts` is deferred to Story 3.4.

### Project Structure Notes

- `lib/db/search.ts` belongs in `lib/db/` per the architecture directory layout — confirmed in [`_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#Directory Layout`]
- `types/search.ts` is pre-allocated in the project structure — confirmed in [`_bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#types/`]
- All new DB functions follow the repository pattern: pure TypeScript, return camelCase objects, no direct `better-sqlite3` import outside `lib/db/`
- `listPublishedModels` and `getFeaturedModels` return `Model[]` not a separate DTO — consistent with existing `listModelsByUser` pattern in `lib/db/models.ts`

### References

- FTS5 virtual table syntax: [SQLite FTS5 Extension](https://www.sqlite.org/fts5.html) — `CREATE VIRTUAL TABLE ... USING fts5(...)`
- `ALTER TABLE ADD COLUMN IF NOT EXISTS`: [SQLite 3.37.0 changelog](https://www.sqlite.org/releaselog/3_37_0.html) — safe with better-sqlite3 v9+
- `PaginatedResponse<T>` type: [`types/api.ts:15`]
- `PAGE_SIZE` constant: [`lib/constants.ts:3`]
- Categories seed (already done): [`lib/db/schema.sql:86-97`]
- Tags seed (for getSearchSuggestions): [`lib/db/schema.sql:103-118`]
- `mapRowToModel` + `DbModelRow` (to export): [`lib/db/models.ts:5-39`]
- `publishModel` (to extend with FTS5 insert): [`lib/db/models.ts:110-119`]
- Auth pattern (not needed this story — data layer only): N/A
- API error standard `{ error, code }`: not needed this story (no Route Handlers)
- `db` singleton: [`lib/db/index.ts:29`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` is not valid SQLite syntax (story dev notes were incorrect). Fixed by moving the column addition to `lib/db/index.ts` with try/catch for idempotency; `CREATE INDEX IF NOT EXISTS` runs after and is always idempotent.

### Completion Notes List

- Schema: added `models_fts` FTS5 virtual table, `download_events` table, all required indexes. `category_id` column added via try/catch in `lib/db/index.ts` (not schema.sql) because SQLite does not support `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- `types/model.ts`: added `categoryId: string | null` to `Model` interface.
- `lib/db/models.ts`: exported `DbModelRow` and `mapRowToModel`; added `category_id` to row mapping; added `listPublishedModels`, `getFeaturedModels`, `ListPublishedModelsOptions`; updated `publishModel` to populate `models_fts`.
- `types/search.ts`: created with `SearchQuery`, `SearchResult`, `SearchSuggestion` types.
- `lib/db/search.ts`: created with `searchModels` (FTS5 MATCH + filters, try/catch on malformed queries) and `getSearchSuggestions` (prefix FTS5 + LIKE for tags/creators, ≤5 results).
- All ACs satisfied. TypeScript: 0 errors. Build: successful. ESLint: 0 errors (2 pre-existing warnings unrelated to this story).

### File List

- `lib/db/schema.sql` — modified (FTS5 table, download_events, indexes)
- `lib/db/index.ts` — modified (try/catch ALTER TABLE + CREATE INDEX for category_id)
- `types/model.ts` — modified (categoryId field)
- `lib/db/models.ts` — modified (export DbModelRow + mapRowToModel, categoryId mapping, listPublishedModels, getFeaturedModels, publishModel FTS5 population, imports)
- `types/search.ts` — created
- `lib/db/search.ts` — created

## Change Log

- 2026-05-06: Implemented story 3.1 — search & discovery data layer. Added FTS5 virtual table, download_events table, category_id column migration, listPublishedModels/getFeaturedModels functions, searchModels/getSearchSuggestions functions, and all supporting types. Discovered that SQLite does not support `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`; resolved by moving migration to db initialization with try/catch.

### Review Findings

- [x] [Review][Patch] Add `category_id TEXT REFERENCES categories(id)` to CREATE TABLE models in schema.sql so fresh-DB deployments don't rely solely on ALTER TABLE path [lib/db/schema.sql]
- [x] [Review][Patch] Add FTS backfill in `lib/db/index.ts` — INSERT OR IGNORE into models_fts for all existing is_published=1 models after the ALTER TABLE block [lib/db/index.ts]
- [x] [Review][Patch] Add `console.error` inside `searchModels` catch block so database failures are visible in server logs [lib/db/search.ts]

- [x] [Review][Patch] `orderBy` string interpolated into SQL without allowlist — SQL injection if TypeScript type coerced at runtime [lib/db/models.ts:listPublishedModels]
- [x] [Review][Patch] `getSearchSuggestions` FTS prefix query `"term*"` is invalid FTS5 syntax — all model suggestions silently fail; correct form is `term*` (no surrounding quotes) [lib/db/search.ts:~66]
- [x] [Review][Patch] `getSearchSuggestions` tag/creator LIKE queries not in try/catch — asymmetric error handling; DB error in LIKE queries throws while FTS errors are swallowed [lib/db/search.ts:~80-93]
- [x] [Review][Patch] `getSearchSuggestions` LIKE `%`/`_` metacharacters not escaped — user-supplied `%` causes full-table scan [lib/db/search.ts:~82,89]
- [x] [Review][Patch] `getSearchSuggestions` tag LIKE query lacks `is_published` filter — tag names from unpublished/draft models exposed to any caller [lib/db/search.ts:~80-84]
- [x] [Review][Patch] `publishModel` FTS DELETE + INSERT not in a transaction — crash between ops leaves model published but permanently unsearchable [lib/db/models.ts:~129-132]
- [x] [Review][Patch] `ALTER TABLE` catch too broad — swallows all errors not just "column already exists"; silent schema corruption possible [lib/db/index.ts:~27-29]
- [x] [Review][Patch] `getFeaturedModels` limit unclamped — caller can load entire table into memory; no `Math.min` guard unlike `listPublishedModels` [lib/db/models.ts:getFeaturedModels]
- [x] [Review][Patch] `download_events` missing ON DELETE CASCADE — FK constraint will block model/user deletion silently [lib/db/schema.sql:~93-98]
- [x] [Review][Patch] `searchModels` `ORDER BY rank` ambiguous in JOIN — should be `ORDER BY fts.rank` to explicitly reference FTS5 rank column [lib/db/search.ts:~36]
- [x] [Review][Patch] `query.q` not null-guarded before `.replace()` — runtime TypeError silently swallowed by catch, returning empty [lib/db/search.ts:~13]

- [x] [Review][Defer] `models_fts` orphan rows on model deletion — FTS5 tables don't support FK cascades; must add explicit DELETE in any future delete function [lib/db/schema.sql] — deferred, pre-existing
- [x] [Review][Defer] TOCTOU gap between `db.exec(schema)` and ALTER TABLE in `createConnection` — concurrent cold-starts could race; SQLite file lock prevents corruption but error is silently caught [lib/db/index.ts:~24-30] — deferred, pre-existing
- [x] [Review][Defer] Creator username enumeration via unauthenticated suggestions — inherent to a public platform's creator discovery feature; acceptable for V1 [lib/db/search.ts:~89-93] — deferred, pre-existing
