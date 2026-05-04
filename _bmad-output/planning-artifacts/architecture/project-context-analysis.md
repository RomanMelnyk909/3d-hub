# Project Context Analysis

## Requirements Overview

**Functional Requirements: 42 FRs across 8 capability areas**

| Area | FRs | Architectural Weight |
|------|-----|----------------------|
| User Account Management | FR1–FR4 | Auth layer, session management |
| Model Upload & Publishing | FR5–FR15 | File pipeline, wizard, storage, validation |
| Model Discovery & Search | FR16–FR22 | SSR pages, search API, URL state, filters |
| Model Consumption | FR23–FR26 | Model page SSR, download handler, auth gate |
| Creator Portfolio & Profile | FR27–FR29 | Public profile SSR, private library CSR |
| Platform Safety & Trust | FR30–FR34 | Server-side validation, password hashing, DMCA page |
| Content Presentation & SEO | FR35–FR39 | Metadata generation, sitemap, responsive layout |
| Bookmarks & Collections | FR41–FR42 | Bookmark API, consistent grid component |

**Non-Functional Requirements: 20 NFRs**

- **Performance (NFR1–NFR6):** 2s page load, 1s download initiation, 500ms wizard transitions, optimized photo thumbnails. Drives SSR for public pages and lazy-loading strategy.
- **Security (NFR7–NFR12):** bcrypt password hashing, httpOnly cookies, server-side file validation before disk write, no PII in public API responses, HTTPS enforced, NextAuth best practices.
- **Scalability (NFR13–NFR16):** V1 scoped to SQLite + local filesystem. Migration to Postgres + S3 is planned — data model and API layer must be migration-ready; no SQLite-specific patterns.
- **Reliability (NFR17–NFR20):** No formal SLA. Server-side error logging required; no silent failures on upload or download. Manual backup responsibility.

## Scale & Complexity

- **Primary domain:** Full-stack web application (Next.js)
- **Complexity level:** Medium — file handling pipeline, auth gates, SSR/CSR split, migration-readiness constraint
- **No real-time requirements** in V1 — no WebSockets, no live collaboration
- **No payment processing** — PCI-DSS out of scope
- **Lightweight compliance** — DMCA contact path + privacy policy (static pages sufficient)
- **Solo developer** — infrastructure decisions must minimize operational overhead

## Technical Constraints & Dependencies

- **Framework:** Next.js + TypeScript (already initialized)
- **Styling:** Tailwind CSS v4 (already installed) + shadcn/ui component layer
- **Auth:** NextAuth.js (email/password only in V1)
- **Database:** better-sqlite3 (temporary; migration to Postgres planned)
- **File storage:** Local filesystem (temporary; migration to S3-compatible storage planned)
- **3D viewer:** Deferred to V1.5 — not in V1 scope
- **Browser support:** Chrome, Firefox, Safari, Edge (latest 2 versions); mobile Chrome/Safari supported
- **Rendering:** SSR/SSG for public pages; CSR for interactive flows

## Cross-Cutting Concerns Identified

1. **Authentication & Authorization** — Login gates on download, bookmark, upload initiation. Read-only access without auth. NextAuth session must be accessible server-side (SSR pages) and client-side (interactive flows).
2. **File Upload & Serving Pipeline** — Server-side validation (type, size, executable check) before disk write. Storage abstraction layer required for future S3 migration. File serving through API route (not direct filesystem URL exposure).
3. **SSR/CSR Rendering Strategy** — Public pages (homepage, model pages, categories, tags, profiles) server-rendered. Upload wizard and profile editing client-rendered. Consistent data-fetching patterns needed.
4. **Storage Abstraction** — All database queries and file I/O must go through abstraction interfaces that can be swapped for Postgres + S3 without rewriting API routes.
5. **Error Handling & Logging** — Server-side logging for all upload/download failures. No silent errors. Client-side error states must be specific and actionable per UX spec.
6. **SEO Metadata Layer** — Unique `<title>`, `<meta description>`, Open Graph tags generated server-side per model, category, and tag page. Sitemap generation for all public pages.
7. **Image Optimization** — All model photos served through Next.js `<Image>` with appropriate `sizes` attribute. Thumbnail vs. full-size distinction maintained throughout.
8. **Search & URL State** — Live suggestions, category filters, and sort order reflected in URL for shareability and browser-back safety. Filter changes update results without full page reload.
