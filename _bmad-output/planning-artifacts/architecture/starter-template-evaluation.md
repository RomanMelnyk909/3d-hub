# Starter Template Evaluation

## Primary Technology Domain

Full-stack web application (Next.js App Router) — greenfield project already initialized.

## Project Foundation

**Already initialized:** `create-next-app` with App Router, TypeScript, Tailwind CSS v4, ESLint 9.

**Initialization command used:**

```bash
npx create-next-app@latest 3d-hub --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript 5.x — strict typing throughout; all components, API routes, and utilities typed
- Node.js runtime — Next.js App Router runs on Node.js by default (not Edge Runtime)

**Styling Solution:**
- Tailwind CSS v4 + PostCSS — already configured; utility-first, mobile-first
- shadcn/ui added via `npx shadcn@latest init` — component layer on top of Radix UI primitives (to be run as first setup story)

**Build Tooling:**
- Next.js built-in compiler (SWC) — fast TypeScript/JSX compilation
- Turbopack available via `next dev --turbo` for faster local development

**Code Organization:**
- App Router: `app/` directory at project root (no `src/` wrapper)
- Route-based file colocation: page, layout, loading, error files per route segment
- API routes: `app/api/[...]/route.ts` convention

**Development Experience:**
- Hot reload with Next.js dev server
- ESLint 9 + eslint-config-next for Next.js-specific rules
- TypeScript strict mode enabled via tsconfig.json

## Additional Packages Required

| Package | Version | Purpose | Install |
|---------|---------|---------|---------|
| `next-auth` | v5 (Auth.js) | Auth + session management | `npm i next-auth@beta` |
| `better-sqlite3` | 12.9.0 | SQLite database (V1) | `npm i better-sqlite3 @types/better-sqlite3` |
| `bcryptjs` | 3.0.3 | Password hashing | `npm i bcryptjs @types/bcryptjs` |
| `busboy` | 1.6.0 | File upload stream parsing | `npm i busboy @types/busboy` |

**bcryptjs rationale:** Pure JavaScript implementation; no native bindings that break in Next.js serverless/edge contexts. Functionally identical to `bcrypt` for V1 scale.

**busboy rationale:** Streaming multipart parser with no Express dependency; works directly with Next.js App Router `Request` objects in Route Handlers.

**Note:** Project foundation is in place. Package installation and shadcn/ui initialization should be the first implementation story.
