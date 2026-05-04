# Epic 4: Model Evaluation & Download

Visitors can evaluate a model from printed photos and structured print metadata; authenticated users download in one click; unauthenticated visitors are converted via a registration modal.

## Story 4.1: Model Detail Page

As a visitor,
I want to open a model page and see its printed photos, description, and structured print metadata above the fold,
So that I can confidently decide whether the model will work for my printer and settings before downloading.

**Acceptance Criteria:**

**Given** I click a model card or navigate directly to `/models/[id]`
**When** the Server Component fetches model data via `getModelById`
**Then** the page renders server-side with the model's photos, title, description, print metadata, and tags
**And** the page load completes in under 2 seconds
**And** photos below the first one lazy-load as I scroll

**Given** the `PrintMetadataBlock` component renders
**When** all four metadata fields are present
**Then** it displays a 2×2 grid as a `<dl>` description list: Layer Height (mm) · Infill % · Supports Required · Filament Type
**And** labels use the muted `label` text style (12px/500); values use `small` weight (14px/medium)
**And** any missing field shows "—" in muted style rather than an empty gap

**Given** the `PhotoGallery` component renders
**When** the model has multiple photos
**Then** a large primary photo is displayed with a thumbnail strip below and a photo count indicator (e.g., "1 / 3")
**And** prev/next navigation buttons appear when there are multiple photos
**And** clicking a photo opens a lightbox overlay (full-screen)
**And** in the lightbox: Escape key closes it, arrow keys navigate between photos, `aria-label="Photo {n} of {total}"` is set

**Given** I am on a desktop viewport (≥ 1024px)
**When** the model page renders
**Then** a two-column layout is used: large photo gallery on the left, print metadata block + Download CTA in the right sidebar
**And** the Download button is prominently positioned in the sidebar above the fold

**Given** I am on a mobile viewport (< 640px)
**When** the model page renders
**Then** the Download button is sticky at the bottom of the viewport (`position: sticky; bottom: 0`)
**And** photos and metadata are stacked full-width above it

**Given** `generateMetadata()` is implemented for the model page
**When** the page is crawled by a search engine or shared on social media
**Then** a unique `<title>`, `<meta name="description">`, `og:title`, `og:description`, and `og:image` (first model photo) are present per model
**And** no two model pages share identical metadata

**Given** I navigate to `/models/[id]` for a model ID that does not exist
**When** the Server Component cannot find the model
**Then** a `404` page is returned — no blank or error-thrown page

---

## Story 4.2: Download Flow & Registration Gate

As a visitor,
I want to download a model file in one click — and if I'm not yet registered, be prompted to create an account with minimal friction before the download proceeds automatically,
So that I get the file I came for without unnecessary steps.

**Acceptance Criteria:**

**Given** I am authenticated and click the `DownloadButton` on a model page
**When** `GET /api/download/[modelId]` is called
**Then** the server validates my session, increments `download_count` in the `models` table via `lib/db/downloads.ts`, and streams the model file with appropriate `Content-Disposition` headers
**And** the file download begins in under 1 second after the button click
**And** the button briefly shows a loading indicator during streaming; it never navigates away from the model page

**Given** I am unauthenticated and click the `DownloadButton`
**When** the click is handled client-side
**Then** the `RegistrationModal` opens over the current page — the model page remains visible behind the modal
**And** the modal header shows the model thumbnail and title so I know what I'm about to get
**And** a Register tab (default) and a Log In tab are both visible

**Given** I complete registration in the `RegistrationModal`
**When** account creation succeeds
**Then** the modal closes automatically and the download begins without any additional click
**And** a brief "Download started" toast appears
**And** `download_count` is incremented for this model

**Given** I switch to the Log In tab in the `RegistrationModal` and enter valid credentials
**When** sign-in succeeds
**Then** the modal closes and the download begins automatically — same behaviour as registration

**Given** I submit the registration form with an email already in use
**When** the API responds with `409`
**Then** an inline error appears below the Email field: "Email already in use — log in instead"
**And** a link switches me to the Log In tab without closing or reloading the modal

**Given** the `RegistrationModal` is open
**When** I press Escape or click the backdrop
**Then** the modal closes and I am returned to the model page — focus returns to the `DownloadButton`

**Given** the download Route Handler encounters an error
**When** the catch block runs
**Then** `console.error({ path, userId, modelId, error })` is logged before any response is returned
**And** the client receives `{ "error": "Download failed", "code": "INTERNAL_ERROR" }` with HTTP 500

---
