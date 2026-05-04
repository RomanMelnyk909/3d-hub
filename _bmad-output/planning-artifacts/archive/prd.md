---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish"]
releaseMode: phased
classification:
  projectType: web_app
  domain: general
  complexity: medium
  projectContext: greenfield
  note: "3D viewer/rendering may be deferred post-MVP if complexity is too high"
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-3d-hub.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-05-03-1200.md"
briefCount: 1
researchCount: 0
brainstormingCount: 1
projectDocsCount: 0
workflowType: 'prd'
---

# Product Requirements Document - 3D Hub

**Author:** Romko
**Date:** 2026-05-03

## Executive Summary

3D Hub is a browser-based platform for uploading, discovering, and downloading 3D-printable models — built for a community whose previous home, Thingiverse, is functionally broken. The platform serves two interlinked personas: creators who design and share models, and consumers (makers/hobbyists) who find and download them. Many users are both.

The 3D model sharing market is growing fast: $1.29B in 2024, projected $3.02B by 2033, driven by 22.6% CAGR in consumer 3D printer adoption. The demand is established. What's missing is a neutral, printer-agnostic platform with reliable quality signals. Existing alternatives are brand-captured (MakerWorld → Bambu Lab, Printables → Prusa) or drifting out of the space (Sketchfab merging into Epic's Fab marketplace).

The V1 MVP establishes the core loop: a guided 5-step upload wizard ensures every published model carries a real-world printed photo, structured print metadata (layer height, infill %, supports, filament type), and proper categorization. Consumers browse a clean model card grid, filter by category or tag, and download in one click (registration required). The printed photo is the non-negotiable quality gate — if it hasn't been printed, it isn't published. An interactive 3D model viewer is explicitly deferred to V1.5, after the community loop is validated.

Built by a solo developer on Next.js with local SQLite and filesystem storage — pragmatic for V1, with Postgres and cloud storage migration planned for subsequent phases.

### What Makes This Special

Every model on 3D Hub has been printed. That's the rule. Not a community rating, not an optional badge, not an honor system — a hard upload requirement. A real-world photo of the printed result must accompany every model before it goes live. No other major platform enforces this at scale.

Beyond quality: printer-agnosticism. No hardware ecosystem allegiance, no brand lock-in. The platform serves every printer and every maker equally.

Execution advantage: a solo developer building exactly the platform they'd want to use — no committee decisions, no ecosystem obligations, no UX compromises for hardware partner interests.

The experience should feel like a design gallery, not a file archive — browseable for pleasure, not just utilitarian. The bar is Pinterest for 3D printing, not another file repository.

## Project Classification

- **Project Type:** Web application (Next.js, browser-based)
- **Domain:** Community content platform — no regulated industry constraints
- **Complexity:** Medium — auth, file uploads, SQLite, structured metadata; 3D viewer deferred post-MVP
- **Project Context:** Greenfield

## Success Criteria

### User Success

- A first-time visitor can find and download a model in under 2 minutes
- A consumer can evaluate a model's print quality from photos and structured print metadata before downloading — no viewer required
- A first-time uploader can publish their first model in under 5 minutes
- Guided upload wizard completion rate ≥70%
- 80%+ of published models carry a real-world printed photo and full print metadata (layer height, infill %, supports, filament type)

### Business Success

- Registered user base growing month-over-month after public launch
- Return visit rate above 40% (users return to browse, not only for one-time downloads)
- Zero broken or inaccessible models on the platform at any time

### Technical Success

- No hard technical launch blockers identified; standard web performance applies
- File uploads handle STL and 3MF files up to 25MB reliably without errors
- Authentication (registration and login) functions without errors across supported browsers

### Measurable Outcomes

- 50+ quality-seeded models published before public launch (no category spread required — quality over distribution)
- Time-to-first-download for a new visitor: under 2 minutes
- Time-to-first-publish for a new creator: under 5 minutes

## Product Scope

### MVP — Minimum Viable Product

- User registration and authentication (NextAuth.js, email/password)
- Guided 5-step upload wizard: files → photos → title/description/print metadata → tags/category → preview & publish
- STL and 3MF file support; 25MB per-file limit; multi-file model listings
- Hybrid tag system: predefined platform tags + unlimited custom tags; both equally searchable
- Upload license consent (free-to-download, original work confirmation)
- Save as draft; post-publish redirect to live model page
- Homepage: model card grid, featured/trending section, category navigation, persistent search
- Search by name, tag, category, uploader; default sort by download count; filters by category
- Model page: printed photos, description, print metadata, download button
- User profile: public creator portfolio, private download library
- Upload nudge banner for non-uploaders
- Local filesystem storage (photos + model files); better-sqlite3 database
- Basic upload security: file type validation, size enforcement, no executables

### Growth Features (Post-MVP)

- Interactive 3D model viewer on model page (V1.5 — deferred pending community loop validation)
- Auto-generated 3D preview on upload (V1.5 — deferred with viewer)
- User ratings system: rate photos and printed results (V2)
- Reviews and comments (V2)
- Follow/follower system and notification feed (V2)
- Creator stats dashboard (V2)
- File version history: creators can update model files; previous versions preserved and existing downloaders notified of new version availability (V2)
- 360° printed turntable: creators can upload a turntable video or photo sequence of their printed model as an enhanced real-world preview (V2)

### Vision (Future)

- Paid/premium model listings and creator monetization
- Model customizer / parametric adjustment tool
- Moderation admin panel
- Social login (Google, GitHub)
- Cloud storage + Postgres migration (scale trigger)
- Trusted creator badges and verification
- Events, contests, and community challenges

## User Journeys

### Journey 1: Maya — The Hobbyist Maker (Consumer Happy Path)

Maya is a high school teacher who bought a Creality printer six months ago. She's been printing basic stuff from Thingiverse, but the platform keeps timing out and half the models she clicks lead to error pages. Tonight she wants to print a cable organizer for her desk. She types "cable organizer" into a search engine and lands on 3D Hub.

The homepage greets her with a clean grid of model cards. Each card has a real photo of a printed object — not a render, not a 3D preview, an actual printed thing sitting on someone's desk. She finds three cable organizer options. She clicks the most promising one.

The model page shows two printed photos from different angles. The metadata tells her: printed at 0.2mm layer height, 20% infill, no supports needed, PLA filament. Her printer can do all of that. She's never been this confident before downloading a model. One click — download. The file is in her slicer in under 30 seconds.

She prints it the next morning. It works first time.

**What this journey requires:** Search with filters, model card grid with photo thumbnail, model page with photos + structured print metadata, one-click authenticated download, fast file delivery.

---

### Journey 2: Tomas — The Designer/Maker (Creator Happy Path)

Tomas is a mechanical engineering student who's been designing functional parts for his workshop and posting photos on Reddit. People keep asking where to download his files. He's been emailing them individually. He finds 3D Hub and decides to upload his most popular design — a magnetic tool holder.

He registers with email and password. The upload wizard opens. Step 1: he drops in his STL file. Step 2: he uploads two photos — one of the finished holder mounted on the wall, one close-up of the magnetic insert. The wizard won't let him skip the photo step; there's a clear explanation of why. He doesn't mind — he's proud of how it turned out.

Step 3: title, description, print settings. He fills in layer height, infill, filament type. He adds a note about the magnet size needed. Step 4: tags. He picks "workshop," "tools," "magnetic" from predefined chips, then adds "neodymium" as a custom tag. Step 5: preview and publish. He sees exactly how the model card will look. He hits publish.

He's redirected to his live model page. He copies the URL and posts it on Reddit. Within an hour, twelve people have downloaded it.

**What this journey requires:** Registration flow, 5-step upload wizard with photo enforcement, predefined + custom tag system, license consent, draft save, post-publish redirect to model page, public profile page.

---

### Journey 3: Maya — Edge Case (Incomplete Model, Abandoned Experience)

Maya is back, looking for a phone stand this time. She finds a model that looks promising from the card thumbnail — but when she opens the model page, she sees only one photo that's blurry and taken from far away. No print metadata. The description says "it's cool." The tags are vague.

She can't tell what filament to use. She can't tell if it needs supports. She doesn't know if the dimensions will fit her phone. She closes the tab and finds a different model with complete information.

The incomplete upload was allowed through anyway — which means the platform's upload enforcement has a gap, or the creator found a workaround. Maya never downloads from that creator again.

**What this journey requires:** Photo quality cannot be validated automatically — the wizard enforces *a* photo, not a *good* photo. Print metadata fields must be required (not optional) to prevent empty model pages. This reveals a gap: metadata completeness enforcement in the wizard is as important as photo enforcement.

---

### Journey 4: Dev/Admin — Pre-launch Seeding & Post-launch Monitoring

Before public launch, the solo developer needs to seed the platform with 50+ quality models. They create a creator account and run through the upload wizard 50+ times — or in batches. This stress-tests the wizard flow, validates file storage, and confirms the homepage grid looks populated and credible before real users arrive.

Post-launch, there's no admin panel (V1 out of scope). Monitoring happens at the database and filesystem level: checking SQLite directly for flagged anomalies, watching server logs for upload errors or storage issues, reviewing the model grid manually for anything that slipped through quality gates. If a model needs to be removed, it's a direct database operation.

This exposes a constraint: without a moderation panel, any takedown or quality issue requires dev intervention. Acceptable for V1 with a small, hand-seeded model set — unsustainable at scale.

**What this journey requires:** Reliable upload wizard for batch use, SQLite accessible for direct queries, filesystem organized for manual inspection. Confirms admin panel as a genuine V2 priority, not optional polish.

---

### Journey Requirements Summary

| Capability | Revealed By |
|------------|-------------|
| Search + filters (name, tag, category) | Maya J1 |
| Model card grid with printed photo thumbnail | Maya J1 |
| Model page: photos, structured print metadata, download | Maya J1 |
| One-click authenticated download | Maya J1 |
| Email/password registration and login | Tomas J2 |
| 5-step upload wizard with photo enforcement | Tomas J2 |
| Required print metadata fields (not optional) | Maya J3 |
| Predefined + custom tag system | Tomas J2 |
| License consent, save as draft, post-publish redirect | Tomas J2 |
| Public creator profile page | Tomas J2 |
| SQLite + filesystem accessible for manual ops | Admin J4 |
| Admin/moderation panel | Admin J4 (V2 priority) |

## Domain-Specific Requirements

Community content platform with low regulatory burden. The following constraints apply:

### Compliance & Regulatory

- **Data privacy:** User email addresses and account data are stored. Passwords must be hashed (never plain text). User data must not be exposed in public API responses. A basic privacy policy is required before public launch.
- **User-generated content / copyright:** Users upload files they may or may not own. The upload license consent step (creator confirms original work and free-to-download license) is the primary mitigation. A DMCA takedown path must exist at launch — at minimum, a published contact email for takedown requests. No automated tooling required in V1.
- **No payment processing in V1:** PCI-DSS does not apply. Creator monetization is Future scope.

### Technical Constraints

- **Upload security:** File type validation (STL and 3MF only), size enforcement (25MB per file), rejection of executables. These are non-negotiable at launch.
- **Authentication:** NextAuth.js with email/password. Sessions must be handled securely; no sensitive data in client-accessible storage.

### Risk Mitigations

- **Malicious file uploads:** Enforced at file type and size level in V1. Content scanning (virus/malware) is not in V1 scope but noted as a future hardening item.
- **Copyright infringement:** License consent at upload + DMCA contact path. Manual takedown via direct database operation in V1.
- **Data loss:** Local SQLite + filesystem in V1 — no automated backup. Solo dev is responsible for manual backup before any schema changes.

## Web App Specific Requirements

### Project-Type Overview

3D Hub is a Next.js web application using SSR/SSG for public-facing pages (homepage, model pages, category pages) and client-side rendering for interactive flows (upload wizard, user profile editing). No real-time features in V1. Modern browsers only.

### Browser Matrix

| Browser | Support |
|---------|---------|
| Chrome (latest 2 versions) | ✅ Primary |
| Firefox (latest 2 versions) | ✅ Supported |
| Safari (latest 2 versions) | ✅ Supported |
| Edge (latest 2 versions) | ✅ Supported |
| Internet Explorer | ❌ Not supported |
| Mobile browsers (Chrome/Safari) | ✅ Supported |

### Responsive Design

- Mobile-first layout required — hobbyist users browse from phones
- Model card grid adapts from 1 column (mobile) to 2–4 columns (desktop)
- Upload wizard optimized for desktop (primary upload use case); functional on mobile
- Model page photo gallery responsive; download button prominent on all screen sizes

### Performance Targets

See Non-Functional Requirements → Performance for timing targets. Rendering approach: SSR for public pages ensures fast initial paint; client-side hydration for interactive flows. No performance budget for 3D viewer in V1 (deferred to V1.5).

### SEO Strategy

- Model pages server-rendered with unique `<title>`, `<meta description>`, and Open Graph tags per model
- Category and tag pages server-rendered and crawlable
- Homepage server-rendered with featured/trending model content
- Clean URL structure: `/models/[slug]`, `/categories/[category]`, `/users/[username]`
- Sitemap generated for all public model and category pages
- No SSR required for: upload wizard, draft management, user settings

### Implementation Considerations

- Next.js API routes used for all backend operations (auth, file upload, model CRUD, search)
- Static generation (SSG) for category pages; ISR or SSR for model pages (download count updates)
- Image optimization via Next.js `<Image>` component for printed photos
- File uploads handled server-side via API route — not direct browser-to-disk

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — prove the core loop (upload → browse → download) with real quality controls before adding any community or visualization features.

**Resource Requirements:** Solo developer. Every scope decision must be survivable by one person. Features that require ongoing moderation, complex infrastructure, or high maintenance surface area are explicitly deferred.

### MVP Feature Set (Phase 1 — V1)

**Core User Journeys Supported:** Maya J1 (consumer happy path), Tomas J2 (creator happy path), Admin J4 (pre-launch seeding).

**Must-Have Capabilities:** See Product Scope → MVP section.

**Pre-launch gate:** 50+ quality-seeded models published before public launch. Platform does not go live with an empty grid.

### Post-MVP Features

**Phase 2 — V1.5 (3D Viewer):**
Interactive 3D model viewer on model page + auto-generated 3D preview on upload. Triggered after core community loop is validated — not on a fixed timeline.

**Phase 3 — V2 (Community Layer):**
User ratings, reviews, comments, follow/follower system, creator stats dashboard, notification feed.

**Phase 4 — Future:**
Paid/premium models, model customizer, moderation admin panel, social login, cloud storage + Postgres migration, creator badges, events and contests.

### Risk Mitigation Strategy

**Technical Risks:**
- *Biggest risk:* SQLite + local filesystem is not production-grade at scale. Mitigation: explicitly scoped as temporary; data model designed for migration from day one. Acceptable for V1 solo-dev scale.
- *Second risk:* STL/3MF file handling edge cases (corrupt files, oversized uploads). Mitigation: server-side validation before storage; size enforcement at API layer.

**Market Risks:**
- *Cold-start problem:* Empty platform repels first visitors. Mitigation: 50-model seed before public launch — non-negotiable pre-launch gate.
- *Creator adoption:* Makers may resist the photo requirement. Mitigation: upload wizard explains the why clearly; photo requirement is the differentiator, not a barrier.

**Resource Risks:**
- Solo developer means any scope expansion directly delays launch. Mitigation: strict V1 boundary enforced — anything not in the MVP list waits for V1.5 regardless of how appealing it seems during build.

## Functional Requirements

### User Account Management

- **FR1:** Visitors can register for an account using email and password
- **FR2:** Registered users can log in with their email and password
- **FR3:** Authenticated users can log out
- **FR4:** The system maintains authenticated sessions across page navigation

### Model Upload & Publishing

- **FR5:** Authenticated users can initiate a new model listing via a guided multi-step upload wizard
- **FR6:** Creators can upload one or more STL or 3MF model files per listing
- **FR7:** Creators can upload one or more real-world printed photos per listing
- **FR8:** The system requires at least one printed photo before a model can be published
- **FR9:** Creators can enter a title, description, and structured print metadata (layer height, infill %, support requirements, filament type) per listing
- **FR10:** Creators can assign predefined platform tags and unlimited custom tags to a listing
- **FR11:** Creators can preview how their model listing will appear before publishing
- **FR12:** Creators can save an in-progress upload as a draft and resume it later
- **FR13:** Creators must confirm a license declaration (free-to-download, original work) before publishing
- **FR14:** After publishing, creators are redirected to the live model page
- **FR15:** The system enforces a maximum file size limit of 25MB per uploaded file

### Model Discovery & Search

- **FR16:** Visitors can browse a paginated grid of published model cards on the homepage
- **FR17:** The homepage displays a featured/trending section of models
- **FR18:** Visitors can navigate models by category
- **FR19:** Visitors can search models by name, tag, category, or uploader
- **FR20:** Search results default to sorting by download count
- **FR21:** Visitors can filter search results by category
- **FR22:** A persistent search input is accessible from all pages

### Model Consumption

- **FR23:** Visitors can view a model page showing printed photos, description, and print metadata
- **FR24:** Authenticated users can download model files in one click
- **FR25:** Unauthenticated visitors are prompted to register before downloading
- **FR26:** The system records a download count increment for each completed download

### Creator Portfolio & User Profile

- **FR27:** Each registered user has a public profile page displaying their published models
- **FR28:** Authenticated users can view their private download history
- **FR29:** Non-uploading users see a contextual prompt encouraging them to upload a model

### Platform Safety & Trust

- **FR30:** The system accepts only STL and 3MF file formats for model uploads
- **FR31:** The system rejects uploaded files exceeding the per-file size limit
- **FR32:** The system rejects files with executable characteristics regardless of extension
- **FR33:** A published DMCA takedown contact path is accessible to all users
- **FR34:** User passwords are stored using secure hashing — never plain text

### Content Presentation & SEO

- **FR35:** Each model page has unique title, meta description, and Open Graph tags
- **FR36:** Category and tag pages are server-rendered and indexable by search engines
- **FR37:** A sitemap is generated covering all public model and category pages
- **FR38:** Model card thumbnails display a real printed photo
- **FR39:** The platform layout is responsive and usable on mobile browsers
- **FR40:** The homepage grid contains at least 50 seeded models at public launch

### Bookmarks & Collection

- **FR41:** Registered users can bookmark a model to their Library without downloading it; unauthenticated visitors who attempt to bookmark are prompted to register
- **FR42:** The model card grid layout is consistent across homepage, category pages, search results, and user profile pages

## Non-Functional Requirements

### Performance

- Homepage initial page load: under 2 seconds on a standard broadband connection
- Model page load: under 2 seconds; printed photos lazy-load below the fold
- File download initiation: under 1 second after the download button is clicked
- Upload wizard step transitions: under 500ms
- File upload: progress indicator displayed for any upload taking longer than 2 seconds
- Printed photo thumbnails on model cards: served at optimized resolution; full-size photos available on model page

### Security

- User passwords stored using bcrypt or equivalent secure one-way hashing — never plain text
- Authentication sessions use secure, httpOnly cookies; no auth tokens in localStorage or sessionStorage
- File uploads validated server-side before writing to disk: file type, file size, and executable rejection enforced at API layer
- No personally identifiable information (email, hashed password) exposed in public API responses or client-accessible URLs
- HTTPS required in all production environments
- NextAuth.js session configuration must follow library security best practices

### Scalability

- V1 is explicitly designed for solo-developer scale: SQLite and local filesystem are the expected storage layer
- No concurrent user targets or uptime SLA defined for V1
- The data model and API layer must be designed with future migration to Postgres + S3-compatible object storage in mind — no SQLite-specific query patterns that cannot be ported
- Migration is triggered by scale, not by a fixed timeline; V1 architecture must not block it

### Reliability

- No formal uptime SLA for V1 — solo-hosted, no 24/7 ops
- Database backup is a manual developer responsibility; required before any schema changes
- File storage backup is a manual developer responsibility; no automated backup in V1
- Application errors must be logged server-side; no silent failures on file upload or download
