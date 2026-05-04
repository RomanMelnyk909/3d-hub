# Epic 5: Creator Profiles & User Collections

Registered users have a public creator profile, a private download history, and can bookmark models for later.

## Story 5.1: Public Creator Profile Page

As a registered user,
I want a public profile page that showcases all the models I've published,
So that people who discover my work can browse everything I've shared and follow the link to download.

**Acceptance Criteria:**

**Given** I navigate to `/users/[username]`
**When** the Server Component fetches the user's published models via `listModelsByUser(userId, { publishedOnly: true })`
**Then** the page renders server-side with the creator's username, join date, and a `ModelCardGrid` of their published models
**And** the grid uses the same consistent `ModelCard` component as the homepage and category pages

**Given** the profile belongs to a creator who has published at least one model
**When** the page renders
**Then** all their published models appear in the grid in reverse-chronological order
**And** each card links to the model's detail page

**Given** I am viewing my own profile and have not uploaded anything
**When** the grid is empty
**Then** an empty state renders: "You haven't uploaded any models yet" with a prominent "Upload your first model" CTA button

**Given** I am viewing another user's profile and they have no published models
**When** the grid is empty
**Then** a neutral empty state renders: "No published models yet" — no upload CTA is shown

**Given** I am authenticated and viewing my own profile with zero published models
**When** a banner check runs server-side
**Then** an upload nudge banner renders above the grid: "Share your prints with the community — upload your first model" with an Upload CTA
**And** the banner does not appear for users who have at least one published model

**Given** I navigate to `/users/[username]` for a username that does not exist
**When** the Server Component queries the DB
**Then** a `404` page is returned

---

## Story 5.2: Download History Library

As an authenticated user,
I want to view all the models I've previously downloaded in a private library tab on my profile,
So that I can find and re-download files I've used before without searching again.

**Acceptance Criteria:**

**Given** I am authenticated and visit my own profile at `/users/[username]`
**When** the page renders
**Then** a `Tabs` component appears with two tabs: "Published" (default) and "Library"
**And** the "Library" tab is only visible to me — it does not appear when others view my profile

**Given** I click the "Library" tab
**When** the download history is fetched via `getDownloadHistory(userId)`
**Then** a grid of model cards renders showing every model I have downloaded, sorted by most recently downloaded
**And** each card links to the model's current detail page

**Given** I have not downloaded any models yet
**When** the Library tab renders
**Then** an empty state renders: "No downloads yet — browse models to find something to print" with a "Browse models" CTA

**Given** `lib/db/downloads.ts` is implemented
**When** it is imported
**Then** it exports: `incrementDownloadCount(modelId, userId): void`, `getDownloadHistory(userId): Model[]`
**And** `incrementDownloadCount` inserts a row into `download_events` and updates `models.download_count` atomically in a single transaction

---

## Story 5.3: Model Bookmarks

As a registered user,
I want to bookmark models I'm interested in so I can save them for later without downloading,
So that I can build a personal shortlist of models to print in future sessions.

**Acceptance Criteria:**

**Given** I am authenticated and viewing a model page
**When** I click the bookmark button
**Then** `POST /api/bookmarks` is called with `{ modelId }`
**And** a row is inserted into `user_bookmarks` via `lib/db/bookmarks.ts`
**And** the bookmark button visually toggles to a filled/active state
**And** a quiet toast appears: "Saved to Library"

**Given** I have already bookmarked a model and click the bookmark button again
**When** `DELETE /api/bookmarks?modelId=[id]` is called
**Then** the bookmark row is removed from `user_bookmarks`
**And** the button toggles back to the unfilled/inactive state
**And** a quiet toast appears: "Removed from Library"

**Given** I am unauthenticated and click the bookmark button on a model page
**When** the click is handled client-side
**Then** the `RegistrationModal` opens — reusing the same component from Epic 4
**And** after successful registration or login, the bookmark action completes automatically

**Given** `lib/db/bookmarks.ts` is implemented
**When** it is imported
**Then** it exports: `addBookmark(userId, modelId): void`, `removeBookmark(userId, modelId): void`, `getBookmarksByUser(userId): Model[]`, `isBookmarked(userId, modelId): boolean`
**And** `user_bookmarks` table schema: `user_id TEXT`, `model_id TEXT`, `created_at INTEGER`, PRIMARY KEY `(user_id, model_id)`

**Given** I visit my own Library tab (from Story 5.2)
**When** the page renders
**Then** bookmarked models appear in the same Library grid alongside downloaded models
**And** each bookmarked card is visually distinguishable (e.g., a bookmark chip or indicator)

---
