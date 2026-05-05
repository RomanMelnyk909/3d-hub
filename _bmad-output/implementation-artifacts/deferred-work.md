# Deferred Work

## Deferred from: code review of 1-1-project-setup-design-system-foundation (2026-05-04)

- `@types/*` packages in `dependencies` instead of `devDependencies` — story spec directed `npm i` without `-D`; acceptable but worth fixing when dependency audit runs
- `next-auth@^5.0.0-beta.31` in production `dependencies` — project-level beta dependency; pin to a stable release when v5 goes GA
- Mobile menu has no focus trap or Escape key handler (`Navbar.tsx`) — story scoped it as "simple toggle for now"; address in Story 1.5 when Navbar becomes session-aware
- Mobile menu stays open when viewport resizes to ≥640px (`Navbar.tsx`) — polish item; add `useEffect` resize listener if UX requires it
- Mobile menu not closed on browser back/forward navigation (`Navbar.tsx`) — polish item; add `popstate` listener or use Next.js router events
- Footer copyright year frozen at build time — acceptable for v1; add client-side hydration if year-boundary accuracy becomes required
- `ALLOWED_MODEL_EXTENSIONS` is case-sensitive; `.STL`/`.3MF` won't match without normalization — upload handler must call `.toLowerCase()` before `includes()` check (Story 2.2)
- `DATABASE_PATH`/`UPLOAD_DIR` relative paths are CWD-dependent — acceptable for local deployment; revisit when deploying to VPS
- `NEXTAUTH_SECRET` placeholder string accepted by NextAuth without error — add startup validation (e.g., check length ≥ 32) in a future hardening pass
- `lang="en"` hardcoded on `<html>` — v1 is English only; update if i18n is added post-launch

## Deferred from: code review of 1-2-database-schema-user-data-layer (2026-05-04)

- Schema (`schema.sql`) re-executed on every connection — intentional `IF NOT EXISTS` design for v1; establish a migration strategy (e.g., numbered migration files or a tool like `node-sqlite-migrations`) before adding any non-idempotent `ALTER TABLE` or `INSERT` statements
- `createUser` throws raw `SqliteError` on UNIQUE constraint violation — Story 1.4 registration route must catch `SQLITE_CONSTRAINT_UNIQUE` and return a typed conflict response (HTTP 409)
- `SELECT *` with `as DbUserRow` unsafe cast in `getUserByEmail`/`getUserByUsername` — acceptable while schema is fully controlled; switch to explicit column list if query complexity or column count grows
- Module-scope DB singleton (`export const db = global.__db ?? createConnection()`) executes at import time — acceptable for local/VPS targets; add lazy initialization or a startup hook before deploying to serverless (Vercel) or multi-worker Docker environments
- `token.userId as string` cast without null guard in NextAuth session callback (`lib/auth.ts`) — add `token.userId ?? ''` or a proper guard before Story 1.5 when session persistence is hardened
- No `toPublicUser`/`toSessionUser` conversion helper in `lib/db/users.ts` — add when Story 1.4 first needs to return safe user data in an API response, to enforce the passwordHash exclusion at the type level

## Deferred from: code review of 1-3-authentication-infrastructure-route-protection (2026-05-04)

- `getUserByEmail` called without `await` inside `async authorize` — correct today with synchronous better-sqlite3; if the function is ever made async the `if (!user)` guard would pass a Promise (always truthy), bypassing auth; add a JSDoc `// synchronous — better-sqlite3` comment to make intent explicit
- `AUTH_SECRET` vs `NEXTAUTH_SECRET` env var name — `next-auth@5.0.0-beta.31` supports `NEXTAUTH_SECRET`; verify the correct name and update `.env.example` and `.env.local` when upgrading to next-auth GA (v5 stable reads `AUTH_SECRET` by default)
- `Session.user` TypeScript augmentation merges with rather than replaces the base NextAuth `{ name?, email?, image? }` type — `session.user.name` and `session.user.image` remain type-valid (both `undefined` at runtime); fix in a type-hardening pass using `Omit` or an explicit re-declaration that drops the base fields
- `authorized` callback in `lib/auth.config.ts` returns an HTML 302 redirect to `/login` for unauthenticated API requests — intentional per AC2 which targets browser navigation; if non-browser API clients are added (Story 2.2+), add a content-type check and return `Response.json({ error: 'Unauthorized' }, { status: 401 })` for `application/json` requests

## Deferred from: code review of 1-4-user-registration (2026-05-05)

- No rate limiting on `POST /api/auth/register` — endpoint enables email enumeration via 409 responses and bcrypt CPU exhaustion under parallel load; address with a rate-limiting middleware or edge-function guard before production launch
- Check-then-insert race condition for email/username uniqueness — no database transaction wraps the lookup + insert; SQLite UNIQUE constraint is the actual guard (throws, caught as 500); story explicitly accepts this as an extremely rare edge case; revisit with a wrapping transaction if the DB layer moves to PostgreSQL

## Deferred from: code review of 1-5-user-login-session-persistence (2026-05-05)

- Empty-string `userId` guard (`?? ''`) in `lib/auth.ts` creates a phantom session risk — if `user.id` or `token.userId` is ever null/undefined, a session with blank userId is issued rather than rejecting the auth; this is the intended minimal fix per the deferred-work note from Story 1.2; proper fix is narrowing the NextAuth `User.id` type to non-nullable or adding an explicit null return in the jwt callback
- Mobile drawer has no focus trap (`NavbarActions.tsx`) — keyboard users can tab into content behind the open drawer; a full WCAG 2.1 §2.1.2 compliant implementation would require a focus trap; story scope was limited to the Escape key handler
- `setState('idle')` before `router.push` in `LoginForm.tsx` allows a sub-frame window where the submit button re-enables — negligible in practice due to React batching; revisit if UX testing reveals a perceived double-submit issue
- `signIn` CredentialsSignin error code not server-side logged — error is intentionally collapsed to a generic message to prevent email enumeration; structured logging (e.g., Pino) deferred to V2 per architecture decisions
- Derived username collision loop runs only once in `app/api/auth/register/route.ts` — pre-existing from Story 1.4; a second collision throws a SQLite UNIQUE constraint error surfaced as 500; add a retry loop or deterministic suffix when the DB layer approaches scale
