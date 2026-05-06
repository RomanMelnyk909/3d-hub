# Story Stub: File-Serving Cache-Control & Access Hardening

**Priority:** Pre-launch (must complete before VPS/CDN deployment)
**Raised during:** Code review of Story 2-2 (2026-05-05)

## Problem

`GET /api/files/[...path]` returns `Cache-Control: public, max-age=31536000, immutable` for all
uploaded files, including pre-publish drafts. There is also no authentication on this route. For V1
local development this is acceptable, but before deploying behind a CDN or shared proxy:

- Draft/unpublished model files are permanently CDN-cached and publicly accessible by UUID
- A 1-year immutable TTL means a deleted or reassigned file URL stays live in caches indefinitely
- There is no mechanism to revoke access to a file once its URL is known

## Proposed Scope (to be refined into a full story)

1. Add authentication to `GET /api/files/[...path]` for non-public files (e.g., require session for
   STL/3MF downloads; allow unauthenticated access only for published-model photos)
2. OR implement short-lived signed URLs for draft/pre-publish assets
3. Change `Cache-Control` for draft content to `private, max-age=0, must-revalidate`
4. Add a `published_at` / ownership check in the file-serving route once Story 2-3 links uploads to models

## References

- `app/api/files/[...path]/route.ts` — serving route
- `lib/storage/index.ts` — `readStoredFile`
- `_bmad-output/implementation-artifacts/deferred-work.md` — deferred entries for this and related issues
