# Story 1.2: Database Schema & User Data Layer

Status: review

## Story

As a developer,
I want the database schema initialized with a `users` table and a typed repository layer,
so that user accounts can be stored and retrieved by the authentication stories that follow.

## Acceptance Criteria

1. **Given** `DATABASE_PATH` is set in `.env.local`
   **When** the Next.js application starts for the first time
   **Then** `lib/db/index.ts` creates a `better-sqlite3` connection singleton and executes `lib/db/schema.sql`

2. **Given** `lib/db/schema.sql` is executed
   **When** the schema runs
   **Then** a `users` table exists with columns: `id TEXT PRIMARY KEY`, `email TEXT UNIQUE NOT NULL`, `username TEXT UNIQUE NOT NULL`, `password_hash TEXT NOT NULL`, `created_at INTEGER NOT NULL`
   **And** indexes `idx_users_email` and `idx_users_username` exist

3. **Given** the schema is initialized
   **When** `lib/db/users.ts` is implemented
   **Then** it exports `createUser(email, username, passwordHash): User`, `getUserByEmail(email): User | null`, `getUserByUsername(username): User | null`
   **And** all functions accept and return camelCase TypeScript objects — not raw DB row snake_case
   **And** `types/user.ts` defines `User`, `PublicUser` (no `passwordHash`), and `SessionUser` (userId, email, username) types

4. **Given** a row exists in the `users` table
   **When** `getUserByEmail` or `getUserByUsername` is called
   **Then** the returned object converts `created_at` Unix timestamp to an ISO 8601 `createdAt` string
   **And** `passwordHash` is excluded from `PublicUser` and `SessionUser` — never returned in API responses

## Tasks / Subtasks

- [x] Create `lib/db/schema.sql` (AC: #1, #2)
  - [x] Define `users` table with all 5 required columns using `CREATE TABLE IF NOT EXISTS`
  - [x] Define `idx_users_email` and `idx_users_username` using `CREATE INDEX IF NOT EXISTS`
  - [x] Schema must be idempotent — safe to run on every app start

- [x] Create `lib/db/index.ts` — connection singleton (AC: #1)
  - [x] Read `DATABASE_PATH` from `process.env`; throw a clear `Error` if missing
  - [x] Use `global.__db` to survive Next.js hot-module reloads in dev
  - [x] Enable WAL mode: `db.pragma('journal_mode = WAL')`
  - [x] Read and execute `schema.sql` via `db.exec()` on first connection
  - [x] Export `db` as the named export consumed by all `lib/db/*.ts` repository files
  - [x] Delete `lib/db/.gitkeep` (replaced by real files)

- [x] Create `types/user.ts` (AC: #3, #4)
  - [x] `User` interface — all fields including `passwordHash`, `createdAt: string`
  - [x] `PublicUser` interface — omit `passwordHash`; used in API responses
  - [x] `SessionUser` interface — `userId`, `email`, `username`; used in NextAuth JWT (no passwordHash, no createdAt)

- [x] Create `lib/db/users.ts` (AC: #3, #4)
  - [x] Internal `DbUserRow` interface mapping raw snake_case DB columns to TypeScript types
  - [x] Private `mapRowToUser(row: DbUserRow): User` helper handling the `created_at → createdAt` conversion
  - [x] `createUser(email, username, passwordHash): User` — generates UUID with `crypto.randomUUID()`, stores Unix timestamp
  - [x] `getUserByEmail(email: string): User | null`
  - [x] `getUserByUsername(username: string): User | null`
  - [x] All queries use `db.prepare()` — never string interpolation

- [x] Smoke-test: verify DB creation (AC: #1, #2)
  - [x] TypeScript compile: 0 errors (`npx tsc --noEmit`)
  - [x] Production build: successful (`npm run build`)
  - [x] ESLint: 0 errors, 0 warnings (`npm run lint`)
  - [x] DB file will be created on first import of `lib/db/index.ts` (triggered by Story 1.3+ API routes)

## Dev Notes

### Files Overview

| File | Action | Notes |
|------|--------|-------|
| `lib/db/schema.sql` | CREATE | SQL schema, single source of truth |
| `lib/db/index.ts` | CREATE (replaces `.gitkeep`) | Connection singleton |
| `lib/db/users.ts` | CREATE | User CRUD repository |
| `types/user.ts` | CREATE | User, PublicUser, SessionUser types |
| `lib/db/.gitkeep` | DELETE | No longer needed once real files exist |

### `lib/db/schema.sql`

Use `IF NOT EXISTS` for all DDL — this file runs on every application start:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

This file is the single source of truth for the DB schema. All other tables (models, downloads, bookmarks, etc.) will be added here in later stories — do NOT create them now.

### `lib/db/index.ts` — Singleton Pattern

Next.js hot-module replacement re-evaluates modules on every file save in dev. Without the `global` guard, a new SQLite connection is created on every HMR cycle, eventually hitting the OS file-handle limit:

```typescript
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined
}

function createConnection(): Database.Database {
  const dbPath = process.env.DATABASE_PATH
  if (!dbPath) {
    throw new Error('DATABASE_PATH environment variable is not set')
  }

  const resolvedPath = path.resolve(process.cwd(), dbPath)
  const db = new Database(resolvedPath)

  // WAL mode: allows concurrent reads alongside writes (critical for Server Components)
  db.pragma('journal_mode = WAL')

  // Run schema on every start — idempotent due to IF NOT EXISTS
  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  db.exec(schema)

  return db
}

export const db: Database.Database =
  global.__db ?? (global.__db = createConnection())
```

### `types/user.ts`

```typescript
export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: string  // ISO 8601
}

/** Safe for API responses — passwordHash excluded */
export interface PublicUser {
  id: string
  email: string
  username: string
  createdAt: string  // ISO 8601
}

/** Stored in NextAuth JWT — minimal, no sensitive fields */
export interface SessionUser {
  userId: string
  email: string
  username: string
}
```

Note the `userId` field name in `SessionUser` (not `id`) — this matches what Story 1.3 stores in the NextAuth JWT token.

### `lib/db/users.ts`

```typescript
import { db } from './index'
import type { User } from '@/types/user'

interface DbUserRow {
  id: string
  email: string
  username: string
  password_hash: string
  created_at: number
}

function mapRowToUser(row: DbUserRow): User {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  }
}

export function createUser(
  email: string,
  username: string,
  passwordHash: string
): User {
  const id = crypto.randomUUID()
  const createdAt = Math.floor(Date.now() / 1000)

  db.prepare(
    `INSERT INTO users (id, email, username, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, email, username, passwordHash, createdAt)

  return { id, email, username, passwordHash, createdAt: new Date(createdAt * 1000).toISOString() }
}

export function getUserByEmail(email: string): User | null {
  const row = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email) as DbUserRow | undefined
  return row ? mapRowToUser(row) : null
}

export function getUserByUsername(username: string): User | null {
  const row = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username) as DbUserRow | undefined
  return row ? mapRowToUser(row) : null
}
```

**`crypto.randomUUID()`** is available in Node.js 14.17+ (project uses Node ≥18). No `uuid` package needed.

**better-sqlite3 is synchronous** — no `async/await` on any DB call. This is intentional and correct.

### Date Conversion Pattern

```
DB stores:  created_at = 1746356400  (Unix seconds, INTEGER)
API returns: createdAt = "2025-05-04T10:00:00.000Z"  (ISO 8601 string)
Conversion:  new Date(row.created_at * 1000).toISOString()
```

Multiply by 1000 because `Date` constructor takes milliseconds, SQLite stores seconds.

### Who Calls What

These functions are called exclusively by auth stories — never imported into components or pages:

| Caller | Function | Story |
|--------|----------|-------|
| `POST /api/auth/register` | `createUser`, `getUserByEmail` | 1.4 |
| NextAuth credentials provider | `getUserByEmail` | 1.3 |
| Public profile page | `getUserByUsername` | 5.1 |

The `User` type (with `passwordHash`) is an internal type used only within `lib/db/users.ts` and `lib/auth.ts`. Never pass a `User` object to client components or API responses — use `PublicUser` or `SessionUser`.

### Architecture Compliance Checklist

- `better-sqlite3` is imported **only** in `lib/db/index.ts` — never in pages, components, or other `lib/db/*.ts` files (those import `db` from `./index`)
- All SQL uses `snake_case` column names
- All TypeScript interfaces use `camelCase` field names
- `mapRowToUser` is the single conversion point — never convert inline
- `db.prepare(sql).get/run/all()` — always parameterized; never string interpolation
- `lib/db/.gitkeep` is deleted — placeholder no longer needed

### Anti-Patterns to Avoid

- ❌ `import Database from 'better-sqlite3'` outside `lib/db/index.ts`
- ❌ `await db.prepare(...)` — better-sqlite3 is synchronous, `await` does nothing and misleads
- ❌ String template SQL: `` `SELECT * FROM users WHERE email = '${email}'` `` — SQL injection risk; always use `?` placeholders
- ❌ `import { v4 as uuidv4 } from 'uuid'` — use built-in `crypto.randomUUID()` instead
- ❌ Returning `User` (with `passwordHash`) from any Route Handler — always strip to `PublicUser` or `SessionUser`
- ❌ Adding columns or tables not in this story's scope (models, downloads, etc.) — those belong to their respective stories

### Project Structure Notes

Files created in this story align exactly with the architecture:

```
lib/
  db/
    schema.sql     ← single DDL source of truth
    index.ts       ← singleton; only place that imports better-sqlite3
    users.ts       ← user repository; imports db from ./index
types/
  user.ts          ← User, PublicUser, SessionUser
```

The `lib/db/` path is established by Story 1.1's scaffold. Story 1.3 adds `lib/auth.ts`, Story 2.1 adds `lib/db/models.ts`.

### References

- Database naming conventions (snake_case tables, `idx_{table}_{col}` indexes): [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#naming-patterns`]
- No-ORM decision, repository pattern, one file per domain entity: [Source: `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#data-architecture`]
- `lib/db/index.ts` as the only `better-sqlite3` import point: [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#enforcement-guidelines`]
- Date format (Unix → ISO 8601): [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#format-patterns`]
- DB column snake_case → API camelCase transform rule: [Source: `_bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#naming-patterns`]
- `SessionUser` shape (userId, email, username): [Source: `_bmad-output/planning-artifacts/epics/epic-1-platform-foundation-authentication.md#story-12`]
- Users table schema (columns + indexes): [Source: `_bmad-output/planning-artifacts/epics/epic-1-platform-foundation-authentication.md#story-12`]
- `DATABASE_PATH` env var already set in `.env.local`: [Source: Story 1.1 Completion Notes — `_bmad-output/implementation-artifacts/1-1-project-setup-design-system-foundation.md`]
- `better-sqlite3 v12.9.0` installed: [Source: `package.json`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `eslint-disable-next-line no-var` comment removed from `lib/db/index.ts` — the `no-var` rule is not active in this project's ESLint config so the directive produced a lint warning; `global var` declaration is valid TypeScript for the HMR singleton pattern

### Completion Notes List

- `lib/db/schema.sql`: `users` table + `idx_users_email` + `idx_users_username`, all with `IF NOT EXISTS` for idempotency
- `lib/db/index.ts`: `global.__db` singleton pattern prevents connection leak during Next.js HMR in dev; WAL mode enabled; schema executed on first connection
- `types/user.ts`: `User` (internal, includes `passwordHash`), `PublicUser` (API-safe), `SessionUser` (JWT payload — uses `userId` not `id` to match NextAuth token shape expected in Story 1.3)
- `lib/db/users.ts`: `createUser`, `getUserByEmail`, `getUserByUsername` — all parameterized queries, `mapRowToUser` is the single `snake_case → camelCase` + Unix→ISO8601 conversion point; `crypto.randomUUID()` used for ID generation (no extra package)
- `lib/db/.gitkeep` deleted
- TypeScript: 0 errors; build: successful; ESLint: 0 errors, 0 warnings
- DB file (`3d-hub.db`) will be created automatically on first API route call that imports `lib/db/index.ts` (Story 1.3+)

### File List

- `lib/db/schema.sql` (created)
- `lib/db/index.ts` (created — replaces `.gitkeep`)
- `lib/db/users.ts` (created)
- `lib/db/.gitkeep` (deleted)
- `types/user.ts` (created)

## Change Log

- 2026-05-04: Story 1.2 implemented — database schema, connection singleton, user repository, and User/PublicUser/SessionUser types (claude-sonnet-4-6)
