---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: '3D model sharing platform'
session_goals: 'Enable users to upload 3D model files with photos and descriptions; allow users to browse, discover, and download models'
selected_approach: 'user-selected'
techniques_used: ['Trait Transfer', 'Six Thinking Hats', 'Decision Tree Mapping', 'Solution Matrix']
ideas_generated: [60]
context_file: ''
status: 'paused - ready for organization'
---

# Brainstorming Session Results

**Facilitator:** Romko
**Date:** 2026-05-03

## Session Overview

**Topic:** 3D model sharing platform
**Goals:**
- Users can upload 3D model files + photos + descriptions
- Users can browse the platform and discover models
- Users can download models they find interesting (registered users only)

### Session Setup

Web application focused on storing and sharing 3D models. The platform serves both creators (uploaders) and consumers (browsers/downloaders). Core value: a community hub where 3D model creators can share their work and others can find and use those models.

Inspiration platforms: Thingiverse (simplicity), Sketchfab (visualization), MyMiniFactory (quality/curation).
Platform DNA: Interactive 3D viewer + clean presentation + no-frills UX focused entirely on models.

## Technique Selection

**Approach:** User-Selected Techniques (Structured Thinking category)

**Selected Techniques:**
- **Trait Transfer:** Borrows winning patterns from Thingiverse, Sketchfab, MyMiniFactory
- **Six Thinking Hats:** Balanced consideration of facts, risks, emotions, and creative opportunities
- **Decision Tree Mapping:** Maps user journeys — reveals gaps in upload/browse/download experience
- **Solution Matrix:** Grids user types against actions — surfaces missing feature combinations

---

## Technique Execution Results

### Trait Transfer — Ideas #1–20

**[Trait #1]:** Clean Viewer First
_Concept:_ The model page is dominated by the 3D viewer — fullscreen by default, with metadata (title, description, tags) collapsed or secondary. The model IS the hero, not the page chrome.
_Novelty:_ Most platforms treat the viewer as one section among many. Here the viewer takes 70–80% of the screen.

**[Trait #2]:** One-Click Inspect
_Concept:_ No download required to evaluate a model — users can rotate, zoom, and inspect every angle directly in browser before deciding to download.
_Novelty:_ Thingiverse's viewer is weak; users often download just to see what they're getting.

**[Trait #3]:** Presentation-Grade Defaults
_Concept:_ Every uploaded model automatically gets neutral lighting, clean background, and shadow rendering — no extra effort from the uploader.
_Novelty:_ On Sketchfab, good presentation requires manual setup. Here it's automatic.

**[Trait #4]:** Guided Upload Wizard
_Concept:_ Multi-step upload flow: (1) Upload model file, (2) Upload photos/cover image, (3) Add title + description, (4) Add tags + category, (5) Preview & publish. Each step is focused — one thing at a time.
_Novelty:_ Forces completeness without overwhelming — users can't publish a bare model with no context.

**[Trait #5]:** Auto-Generated 3D Preview on Upload
_Concept:_ As soon as the model file is uploaded in step 1, the platform immediately renders a 3D preview so the creator can see exactly how it will look to others — before finishing the upload flow.
_Novelty:_ Instant feedback loop for the creator; reduces the chance of publishing a broken or poorly oriented model.

**[Trait #6]:** Photo + Model Pairing
_Concept:_ Each model requires at least one real-world photo (printed/rendered result) alongside the 3D file. The photo is shown first in browse view; the 3D viewer opens on click.
_Novelty:_ Bridges the gap between "what it looks like as a file" and "what it looks like in real life."

**[Trait #7]:** Model Card Grid
_Concept:_ Homepage is a clean responsive grid of model cards — each card shows the real-world photo, title, and uploader name. Hover reveals a quick 3D preview thumbnail spin.
_Novelty:_ Hover-to-spin gives a taste of the 3D viewer without leaving the browse page.

**[Trait #8]:** Category Navigation Bar
_Concept:_ Horizontal category strip just below the header — always visible, one click filters the entire grid.
_Novelty:_ Thingiverse's categories are buried. Yours are the primary navigation.

**[Trait #9]:** Featured / Curated Section
_Concept:_ A dedicated "Staff Picks" or "Trending This Week" row at the top of the homepage — manually curated or algorithm-driven.
_Novelty:_ Signals to new users "this platform has standards" — builds trust immediately.

**[Trait #10]:** Persistent Search Bar
_Concept:_ Search bar always in the header. Supports searching by name, tag, category, and uploader — with live suggestions as you type.
_Novelty:_ Fast, accurate search is a core differentiator.

**[Trait #11]:** Creator Portfolio Profile
_Concept:_ Each user has a public profile page showcasing uploaded models in a visual grid. Includes bio, join date, total downloads, and model count.
_Novelty:_ Elevates uploaders to "creators" — gives them a reason to invest in the platform long-term.

**[Trait #12]:** Personal Library (Download History)
_Concept:_ Every downloaded model is saved to the user's private "Library" — a personal collection they can revisit, organize into folders, and re-download anytime.
_Novelty:_ Turns one-time downloads into a persistent personal collection — increases return visits.

**[Trait #13]:** Follow System
_Concept:_ Users can follow creators and get notified when they publish new models. A "Following Feed" shows latest uploads from followed creators.
_Novelty:_ Creates a loyalty loop — popular creators build audiences, audiences motivate creators to keep uploading.

**[Trait #14]:** Creator Stats Dashboard
_Concept:_ Private dashboard showing total downloads, views, likes, and follower growth over time per model.
_Novelty:_ Gives creators feedback on what resonates — incentivizes quality uploads.

**[Trait #15]:** 3D Printing Format Focus
_Concept:_ Platform supports STL and 3MF natively. 3MF files preserve color, scale, and print settings — displayed as metadata on the model page.
_Novelty:_ Supporting 3MF properly signals to advanced users that this platform understands 3D printing deeply.

**[Trait #16]:** Print-Ready Metadata
_Concept:_ Each model page shows structured print fields — recommended layer height, infill %, supports needed, estimated print time, filament type. Filled in during guided upload.
_Novelty:_ Thingiverse buries this in free-text. Structured fields make it scannable and searchable.

**[Trait #17]:** File Version History
_Concept:_ When a creator updates a model file, the previous version is kept. Users who already downloaded can see "v2 available" and re-download. Changelog field per version.
_Novelty:_ Model files get improved over time — versioning prevents users from being stuck on broken early releases.

**[Trait #18]:** ~~Anonymous One-Click Download~~ *(Superseded by #43)*

**[Trait #19]:** Format Selector on Multi-Variant Models
_Concept:_ If a creator uploads multiple variants (STL + 3MF, different sizes), a clean dropdown appears on the download button. One extra click, still frictionless.
_Novelty:_ Keeps single-button simplicity for most models while gracefully handling complexity.

**[Trait #20]:** Download Counter
_Concept:_ Each model shows a public download count. Logged-in users get the model added to their Library automatically on download.
_Novelty:_ Download count is social proof — popular models surface naturally.

---

### Six Thinking Hats — Ideas #21–40

**[White Hat #21]:** Dual User Type Platform
_Concept:_ Platform serves two distinct personas — Creators (upload, manage, build audience) and Consumers (browse, download, collect). UI and features serve each role distinctly.
_Novelty:_ Designing explicitly for both means each group gets a tailored experience.

**[White Hat #22]:** Broad Audience, Single Common Need
_Concept:_ Despite varied backgrounds (students, volunteers, hobbyists, professionals), all consumers share one need: find a reliable, print-ready model quickly.
_Novelty:_ Anchors every design decision to this universal need — avoids feature creep.

**[White Hat #23]:** Mandatory Quality Rating
_Concept:_ Every model requires a quality rating from downloaders — 1–5 stars focused on print quality. Rating prompted after download with a time delay.
_Novelty:_ Rating is print-quality specific — separates "looks good in viewer" from "actually prints well." *(Deferred to V2)*

**[White Hat #24]:** Model Reviews
_Concept:_ Logged-in users can leave text reviews sharing print settings, issues, and tips. Visible on the model page below the viewer.
_Novelty:_ Turns individual download experience into collective knowledge. *(Deferred to V2)*

**[White Hat #25]:** Trust Score Composite
_Concept:_ Each model displays a composite trust indicator combining star rating + review count + download count.
_Novelty:_ Single glanceable signal that answers "can I trust this model?" *(Deferred to V2)*

**[Red Hat #26]:** First Impression Wow
_Concept:_ Homepage opens with a visually rich, high-quality model grid — diverse categories visible immediately, best/trending models front and center. Feels like a design gallery, not a file repository.
_Novelty:_ The emotional bar is "gallery," not "database."

**[Red Hat #27]:** Print Confidence Signal
_Concept:_ Every model page prominently displays a "Print Confidence" badge — based on community ratings, successful print reports, and quality score.
_Novelty:_ Directly addresses the #1 anxiety of 3D printing consumers: "will this actually work?" *(Deferred to V2)*

**[Red Hat #28]:** Creator Pride Moment
_Concept:_ When a creator's model receives its first download, they get a notification — "Someone just downloaded your model!"
_Novelty:_ Turns an invisible event into a tangible dopamine hit — motivates creators to upload more.

**[Yellow Hat #29]:** The "Just Works" Promise
_Concept:_ Every interaction — finding, viewing, downloading — requires zero learning curve. A 60-year-old volunteer and a 15-year-old student both succeed on their first visit.
_Novelty:_ Accessibility is a design commitment, not an afterthought.

**[Yellow Hat #30]:** Passive Discovery Loop
_Concept:_ The platform is designed to be browsed for pleasure — interesting cards, smooth infinite scroll, unexpected categories make it easy to spend 20 minutes "just looking."
_Novelty:_ Like Pinterest for 3D printing — enjoyable, not just utilitarian.

**[Yellow Hat #31]:** Low Barrier to First Upload
_Concept:_ A new creator can go from zero to published model in under 5 minutes. Guided flow simple enough for someone sharing their first-ever model.
_Novelty:_ Grows the content library by lowering the bar for creators.

**[Black Hat #32]:** Printed Photo Requirement
_Concept:_ Uploaders must include at least one photo of the physically printed model. Enforced during guided upload — models without a real print photo cannot be published.
_Novelty:_ Single most effective quality gate — if you can't show a printed result, the model isn't ready.

**[Black Hat #33]:** Creator Reputation Score
_Concept:_ Every user has a public reputation score built from average ratings, successful print reports, and review sentiment. Displayed on profile and model cards.
_Novelty:_ "Downloaded from a 4.9-rated creator" is a stronger trust signal than any single model rating. *(Deferred to V2)*

**[Black Hat #34]:** Upload License Consent
_Concept:_ During upload, creators explicitly agree their model is free to download. Simple checkbox: "I confirm this is my original work and allow others to download and print it for free."
_Novelty:_ Sets clear expectations from day one — protects the platform legally and builds community trust.

**[Black Hat #35]:** Paid Models Section *(Future)*
_Concept:_ A dedicated "Premium" section where creators list models at a price they set. Platform takes a small commission per sale. File added to buyer's Library permanently.
_Novelty:_ Creates a monetization path for serious creators — attracts higher-quality content over time.

**[Green Hat #36]:** Realistic Print Preview
_Concept:_ The 3D viewer offers a "Print Mode" toggle — switches to material simulation showing the model as if printed in PLA/resin. User can pick filament color.
_Novelty:_ Bridges the gap between "digital file" and "physical object." *(Future)*

**[Green Hat #37]:** 360° Printed Turntable
_Concept:_ Creators can upload a short turntable video or photo sequence of the printed model rotating — displayed as a "real world preview" tab alongside the 3D viewer.
_Novelty:_ Combines trust of a real printed photo with the immersion of video.

**[Green Hat #38]:** Model Customizer *(Future)*
_Concept:_ For parametric models, a web UI lets users adjust dimensions and download a customized version instantly — no CAD software needed.
_Novelty:_ Transforms passive consumers into active participants.

**[Blue Hat #39]:** MVP Core Loop
_Concept:_ V1 has exactly two jobs — let creators upload models (photo + description + file), and let registered users download them. Everything else is secondary.
_Novelty:_ Ruthless scope discipline. A working upload/download loop with good presentation beats a feature-rich platform that's half-broken.

**[Blue Hat #40]:** Seed Content Strategy
_Concept:_ Before public launch, populate the platform with curated models so the first visitor lands on a rich, interesting grid — not an empty page.
_Novelty:_ Solves the "empty platform problem."

---

### Decision Tree Mapping — Ideas #41–52

**[Tree #41]:** Search Results Default Sort
_Concept:_ Search results sorted by highest rating by default. Secondary options: Most Downloaded, Newest, Most Reviewed.
_Novelty:_ Defaulting to rating rewards quality over recency — aligns with trust-first values.

**[Tree #42]:** Community Print Settings Section
_Concept:_ Below reviews, a structured "What Worked" section shows print settings submitted by successful users — layer height, infill %, supports, filament type, printer model.
_Novelty:_ Turns the model page into a living print guide. *(Deferred to V2)*

**[Tree #43]:** Registration Required to Download
_Concept:_ Users must create a free account to download. Anonymous visitors can browse, view 3D models, and read reviews — but download requires login.
_Novelty:_ Builds a real user base from day one — every downloader is a known community member.

**[Tree #44]:** Registration Required to Rate & Review
_Concept:_ Only registered users can submit ratings, reviews, and print settings. Anonymous visitors can read but not contribute.
_Novelty:_ Every rating comes from a real account — makes trust score meaningful and harder to game. *(Deferred to V2)*

**[Tree #45]:** Browse-First, Gate-on-Action
_Concept:_ Anonymous users get full read-only access — homepage, search, model pages, 3D viewer. Registration prompt appears precisely when they try to download or rate.
_Novelty:_ Users are invested in a specific model when they register — signup feels worthwhile, not annoying.

**[Tree #46]:** Consistent Grid Across All Pages
_Concept:_ Homepage, category pages, search results, and user profiles all use the same model card grid layout.
_Novelty:_ Visual consistency = perceived simplicity. Users learn one pattern and it works everywhere.

**[Tree #47]:** Optional Subcategories
_Concept:_ Top-level categories can optionally have subcategories — shown as a horizontal filter strip. Only added when there's enough content to justify them.
_Novelty:_ Avoids empty subcategory pages during early growth — categories gain depth organically.

**[Tree #48]:** Multi-File Model Upload
_Concept:_ A single model listing can contain multiple files — e.g., a chess set with 16 pieces, or supported vs. support-free variants. Files downloaded together or individually.
_Novelty:_ Matches how creators actually work — prevents duplicate listings cluttering the platform.

**[Tree #49]:** 25MB Per File Upload Limit
_Concept:_ Each individual file capped at 25MB in V1. Clear error message if exceeded. Limit raised in future versions as infrastructure scales.
_Novelty:_ Keeps storage costs predictable while covering the vast majority of typical STL/3MF files.

**[Tree #50]:** Hybrid Tag System
_Concept:_ During upload, creators see predefined platform tags as clickable chips, plus can add unlimited custom tags. Both tag types indexed and searchable equally.
_Novelty:_ Predefined tags ensure consistent discovery; custom tags handle niche models. No second-class tags.

**[Tree #51]:** Save as Draft
_Concept:_ At any upload wizard step, creators can save progress as a draft and return later. Drafts accessible from profile dashboard under "My Drafts." Never visible to others until published.
_Novelty:_ Respects creator workflow — complex uploads take time. No lost progress.

**[Tree #52]:** Post-Publish Landing on Model Page
_Concept:_ After publishing, creator is immediately redirected to their live model page — exactly as any visitor sees it.
_Novelty:_ The model page IS the success screen — seeing your work live is more satisfying than a generic success message.

---

### Solution Matrix — Ideas #53–58

**[Matrix #53]:** Registered-Only Bookmarks
_Concept:_ Only logged-in users can bookmark/save models to their Library. Anonymous visitors see a "Save" button that triggers a registration prompt.
_Novelty:_ Bookmark action becomes a natural, non-pushy registration trigger.

**[Matrix #54]:** Equal Browse Experience for All Registered Users
_Concept:_ All registered users — consumer or creator — see the same browsing experience. No special rankings or exclusive views based on role.
_Novelty:_ Simplicity over complexity — one experience, everyone included.

**[Matrix #55]:** Upload Nudge Banner for Non-Creators
_Concept:_ Registered users who have never uploaded see a soft banner on their profile — "Have a model to share? Upload it and contribute to the community." Disappears after first publish.
_Novelty:_ Targets exactly the right moment — after the user is already engaged as a consumer.

**[Matrix #56]:** Creator Review Responses *(Future)*
_Concept:_ Creators can reply to reviews on their models — clarifying print settings, acknowledging issues, thanking users. Threaded under original review.
_Novelty:_ Turns static reviews into dialogue — creator engagement signals an active, caring community.

**[Matrix #57]:** Reviews & Comments Deferred to V2
_Concept:_ V1 ships without reviews, ratings, or comments. Core loop is upload + browse + download. Community features planned for V2 once content foundation is established.
_Novelty:_ Avoids building social infrastructure for an empty platform.

**[Matrix #58]:** Moderation System *(Future)*
_Concept:_ Admin panel to delete models and ban/remove users. "Report" button on model pages for community flagging. Reports queue for manual admin review.
_Novelty:_ Community self-policing through reports reduces admin workload significantly.

---

### Trait Transfer (MyMiniFactory) — Ideas #59–60

**[Trait #59]:** Trusted Creator Badge *(Future)*
_Concept:_ Creators who consistently maintain high ratings and verified printed photos earn a "Trusted Creator" badge displayed on profile and model cards.
_Novelty:_ Signals quality at a glance — consumers know whose models are reliably printable without reading every review.

**[Trait #60]:** Community Events & Contests *(Future)*
_Concept:_ Themed monthly design contests and featured categories to drive content creation. Simple V1 version: "Theme of the Month" homepage banner.
_Novelty:_ Creates recurring reasons to visit — content spikes around events grow the library fast.

---

## Session Summary

**Total Ideas Generated:** 60
**Session Status:** Paused — ready for organization

### V1 Core (Must Have)
Ideas: #1–7, #8–10, #11–12, #26, #29–32, #34, #39–40, #43, #45–52, #53–55

### V2 Community Layer
Ideas: #13–14, #23–25, #27–28, #33, #42, #44, #56–57

### Future / Long-term
Ideas: #35–36, #38, #58–60

### Key Platform Decisions Made
- Format support: STL + 3MF only
- Download: Registered users only (not anonymous)
- Upload: Guided 5-step wizard with photo requirement
- File size: 25MB per file limit
- Tags: Hybrid (predefined + custom)
- Reviews/ratings: Deferred to V2
- Paid models: Future feature
