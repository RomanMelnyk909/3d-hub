# Epic 6: SEO, Sitemap & Pre-Launch Readiness

The platform is crawlable by search engines, has a sitemap, and contains 50+ quality-seeded models before public launch.

## Story 6.1: Sitemap, Robots & SEO Metadata Completeness

As a visitor arriving from a search engine,
I want every public model, category, and page to be discoverable and correctly described in search results,
So that I can find 3D Hub content through Google and other search engines without knowing the platform exists.

**Acceptance Criteria:**

**Given** `app/sitemap.ts` is implemented
**When** a search engine crawler requests `/sitemap.xml`
**Then** the sitemap includes URLs for: all published model pages (`/models/[id]`), all category pages (`/categories/[slug]`), the homepage (`/`), and any other public static pages
**And** the sitemap is dynamically generated — newly published models appear without a redeploy

**Given** `app/robots.ts` is implemented
**When** a crawler requests `/robots.txt`
**Then** it permits crawling of all public pages (`/`, `/models/*`, `/categories/*`, `/users/*`)
**And** it disallows crawling of `/upload`, `/api/*`, and auth pages

**Given** each public `page.tsx` has `generateMetadata()` implemented
**When** any public page is loaded in a browser or crawled
**Then** a unique `<title>` and `<meta name="description">` are present (not the Next.js default)
**And** `og:title`, `og:description`, and `og:image` Open Graph tags are present on model pages
**And** category pages have their own unique title and description (e.g., "Workshop Models — 3D Hub")
**And** the homepage has a descriptive title and meta description reflecting the platform's purpose

**Given** `app/api/files/[...path]/route.ts` is implemented
**When** a request is made for a stored photo or model file
**Then** the file is served from `lib/storage/` with correct `Content-Type` headers
**And** the filesystem path is never exposed in the URL or response body

---

## Story 6.2: Pre-Launch Quality Verification & Model Seeding

As the platform developer,
I want to seed the platform with 50+ quality models and verify all critical flows before opening to the public,
So that the first real visitor encounters a credible, fully populated platform with no blocking defects.

**Acceptance Criteria:**

**Given** the upload wizard (Epic 2) is fully functional
**When** the developer seeds models through the wizard
**Then** at least 50 models are published with: a real printed photo, a complete title and description, all four print metadata fields filled, at least one tag, and a valid category
**And** the homepage grid appears populated and credible — no empty or sparse sections visible on first load

**Given** a Lighthouse accessibility audit is run on the homepage, a model page, and the upload wizard
**When** the audit completes
**Then** the accessibility score is 90 or above on all three pages
**And** any score below 90 is treated as a launch blocker and fixed before proceeding

**Given** a keyboard-only navigation walkthrough is performed
**When** a tester completes both critical flows using only Tab, Enter, Escape, and arrow keys
**Then** the full consumer download flow is completable: homepage → model page → RegistrationModal → download
**And** the full creator upload flow is completable: `/upload` → wizard Steps 1–5 → publish
**And** no interactive element is unreachable by keyboard

**Given** the platform is tested across the supported browser matrix
**When** Chrome, Firefox, Safari, and Edge (latest 2 versions each) are tested on the homepage and model page
**Then** layout, photos, and core interactions render correctly in all four browsers
**And** mobile Chrome and Safari are tested on at least one real device (Android + iOS)
**And** any rendering defect is fixed before launch

**Given** all pre-launch checks are complete
**When** the developer reviews the platform
**Then** zero published models have missing photos, incomplete metadata, or broken file links
**And** server error logs show no recurring upload or download failures during seeding
