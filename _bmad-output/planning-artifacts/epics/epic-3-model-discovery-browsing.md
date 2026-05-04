# Epic 3: Model Discovery & Browsing

Visitors can browse a grid of published models on the homepage, navigate by category, and search by name, tag, category, or uploader.

## Story 3.1: Search & Discovery Data Layer

As a developer,
I want the model list queries, category data, and FTS5 full-text search table in place,
So that the homepage grid, category pages, and search features have a typed data layer to build against.

**Acceptance Criteria:**

**Given** `lib/db/schema.sql` already contains the `models` and related tables from Story 2.1
**When** the schema update is applied
**Then** a `models_fts` FTS5 virtual table exists that indexes `title`, `description`, and concatenated tag values from `models` and `model_tags`
**And** a `download_events` table exists with columns: `id`, `model_id` (FK), `user_id` (FK), `downloaded_at INTEGER`
**And** `categories` table is populated with the platform's predefined category slugs and display names

**Given** `lib/db/models.ts` is updated
**When** list and search functions are called
**Then** it exports: `listPublishedModels({ page, limit, category?, sort? }): PaginatedResponse<Model>`, `getFeaturedModels(limit): Model[]`
**And** `sort` defaults to `download_count DESC`; also supports `created_at DESC`
**And** responses follow the `{ items, total, page, limit, hasMore }` shape

**Given** `lib/db/search.ts` is implemented
**When** search functions are called
**Then** it exports: `searchModels(query, filters): PaginatedResponse<Model>`, `getSearchSuggestions(query): SearchSuggestion[]`
**And** `searchModels` queries `models_fts` for full-text matches and applies `LIKE` for category/uploader filtering
**And** `getSearchSuggestions` returns up to 5 results grouped by type: Models, Tags, Creators
**And** `types/search.ts` defines `SearchQuery`, `SearchResult`, `SearchSuggestion` types

---

## Story 3.2: Model Card Component & Homepage Grid

As a visitor,
I want to browse a photo-dominant grid of published models on the homepage with a featured section,
So that I can quickly evaluate models by their real printed photos and find something worth downloading.

**Acceptance Criteria:**

**Given** the homepage at `/` is loaded
**When** the Server Component fetches data via `listPublishedModels` and `getFeaturedModels`
**Then** the page renders server-side (SSR) with a featured/trending row and a paginated model card grid below
**And** the initial page load completes in under 2 seconds on a standard broadband connection

**Given** the `ModelCard` component is implemented
**When** it renders a published model
**Then** the photo area occupies ~75% of the card height using `<Image>` with the `sizes` attribute for optimized delivery
**And** below the photo: model title (h3, max 2 lines truncated), download count, and one primary tag chip (sage green Badge)
**And** on hover: a subtle shadow lift and sage green border tint are applied
**And** the entire card surface is a clickable link to `/models/[id]`
**And** `role="article"` and `aria-label="{model title}"` are set; photo uses creator-provided alt text

**Given** the `ModelCardGrid` component is implemented
**When** it renders a list of models
**Then** the grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6` responsive classes
**And** while data is loading, Skeleton cards matching the exact ModelCard dimensions are shown (no layout shift)
**And** the grid is identical in layout whether rendered on the homepage, category pages, search results, or profile pages

**Given** the homepage loads with no published models
**When** the grid renders
**Then** a neutral empty state message appears — no broken layout or JavaScript errors

---

## Story 3.3: Category Pages & Navigation

As a visitor,
I want to filter models by category from the homepage navigation and browse dedicated category pages,
So that I can find models relevant to a specific topic without searching.

**Acceptance Criteria:**

**Given** categories are seeded in the database
**When** the homepage and Navbar render
**Then** category filter pills are visible below the Navbar on the homepage (horizontally scrollable on mobile, no wrapping)
**And** the Navbar contains a visible path to category browsing accessible on all pages

**Given** I click a category pill on the homepage
**When** the filter is applied
**Then** the URL updates to reflect the selected category (e.g., `/?category=tools`) without a full page reload
**And** the model card grid refreshes to show only models in that category
**And** the selected pill shows sage green fill and white text; clicking it again clears the filter

**Given** I navigate to `/categories/[slug]`
**When** the Server Component fetches models for that category
**Then** the page is server-rendered and crawlable by search engines (no client-only rendering)
**And** the page title and meta description reflect the category name
**And** the same `ModelCardGrid` component renders with the category's models
**And** pagination works the same as the homepage grid

**Given** a category slug in the URL does not match any seeded category
**When** the page is requested
**Then** a `404` response is returned

---

## Story 3.4: Search Bar, Filters & Empty States

As a visitor,
I want to search for models by name, tag, category, or uploader from any page, and filter results by category,
So that I can find exactly what I'm looking for without browsing the entire grid.

**Acceptance Criteria:**

**Given** the `SearchBar` component is rendered in the Navbar (visible on all pages)
**When** I type 2 or more characters
**Then** a suggestion dropdown appears with results grouped: Models, Tags, Creators
**And** an inline spinner shows while suggestions are fetching
**And** full keyboard navigation works through suggestions (arrow keys to select, Enter to navigate, Escape to close)
**And** the input has sage green border on focus and `aria-live="polite"` on the suggestion list

**Given** I submit a search (press Enter or select a suggestion)
**When** the search results page renders
**Then** results are fetched via `GET /api/search?q=...` using the FTS5 `searchModels` function
**And** results default to sort by download count (Most Downloaded)
**And** a result count is displayed: e.g., "24 results for 'cable organizer'"
**And** the `ModelCardGrid` renders the results using the same consistent card component

**Given** search results are showing
**When** I interact with the `SearchFilters` component
**Then** a sort dropdown is visible: Most Downloaded (default), Newest, A–Z
**And** category filter pills allow single-select filtering (selecting one deselects the previous)
**And** all filter state is reflected in the URL (e.g., `?q=tools&category=workshop&sort=newest`)
**And** changing a filter updates results without a full page reload
**And** the URL is shareable and browser-back-safe

**Given** my search returns no results
**When** the empty state renders
**Then** the message "No models found for '[query]'" appears
**And** a "Clear filters" link and a "Browse all models" link are both visible
**And** no dead-end state is reachable — there is always a path forward

**Given** the mobile viewport (< 640px)
**When** the Navbar renders
**Then** a hamburger menu icon is visible; tapping it opens a drawer containing auth links and the Upload action
**And** the SearchBar is visible below the logo row (stacked layout, full width)
**And** category pills on the homepage scroll horizontally without wrapping

---
