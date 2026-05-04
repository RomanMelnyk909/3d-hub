---
title: "Product Brief: 3D Hub"
status: "reviewed"
created: "2026-05-03"
updated: "2026-05-03"
inputs:
  - "_bmad-output/brainstorming/brainstorming-session-2026-05-03-1200.md"
  - "web research: 3D printing platform competitive landscape 2024-2026"
---

# Product Brief: 3D Hub

## Executive Summary

The 3D printing hobbyist community has outgrown its infrastructure. Thingiverse — the platform that defined the space — is functionally broken: searches time out, half its models are inaccessible, and its owner has abandoned it. Competing alternatives are either locked to specific printer brands (MakerWorld to Bambu Lab, Printables to Prusa) or drifting away from 3D printing entirely (Sketchfab merging into Epic's Fab marketplace). The result: millions of makers have no neutral, trustworthy home for finding and sharing print-ready models.

3D Hub is a clean, printer-agnostic platform for uploading, discovering, and downloading 3D models — built around the belief that the model itself should be the star. Every page centers a high-quality interactive 3D viewer. Every upload requires a real-world photo of the printed result. Every download is one click. The experience should feel like a design gallery, not a file archive.

The MVP establishes the core loop: creators upload models with guided quality controls, consumers browse and download them. Built on Next.js with a Three.js viewer, it is designed by a solo developer as both a personal tool and a community resource — pragmatic in its first-version scope, with a clear path to community features and creator monetization in subsequent releases.

---

## The Problem

Thingiverse hosts 6.8 million models but only 45% are currently accessible. Pages take minutes to load. Its Customizer tool has been broken for years. Spam bots raid the platform unchecked. Users report months of unanswered support emails. The platform is coasting on legacy SEO while its community migrates elsewhere.

The alternatives carry their own limitations. Printables is excellent but positioned as Prusa's ecosystem play — users with Bambu, Creality, or other printers feel like second-class citizens. MakerWorld is the fastest-growing platform (10M monthly users in 2025) but is explicitly a Bambu Lab product. MyMiniFactory has strong quality standards but serves primarily the tabletop miniatures niche.

Meanwhile, the underlying market is growing fast: the 3D model sharing segment was valued at $1.29B in 2024 and is projected to reach $3.02B by 2033. Consumer 3D printer adoption is accelerating at 22.6% CAGR. The community is larger than ever — and underserved by the current platform landscape.

The core user frustration is simple: *I don't know if this model will actually print.* Bad meshes, missing support structures, and undocumented print settings waste hours of print time and meters of filament. No major platform has solved this at scale.

---

## The Solution

3D Hub is a web platform where creators upload 3D models and consumers discover and download them — with quality and presentation as first-class design constraints.

**The core experience:**

- **For consumers:** Land on a beautiful grid of model cards. Each card shows a real-world photo of the printed model. Click to open an interactive 3D viewer — rotate, zoom, inspect every angle before downloading. Register for free to download. One click.

- **For creators:** A guided 5-step upload wizard ensures every published model has a real photo, a description, file metadata (print settings, format), and proper tags. Auto-generated 3D preview on file upload shows creators exactly how their model will appear before publishing. Save-as-draft lets complex uploads happen across multiple sessions.

**Quality by design:** The printed photo requirement is the single most effective quality gate — a model without a printed result isn't ready to share. Combined with structured print metadata (layer height, infill %, supports needed, filament type), consumers can evaluate a model without downloading it.

**Discovery:** Persistent search bar with live suggestions, prominent category navigation, and default sort-by-download-count ensure the most popular models surface first — not the newest. (Rating-based sort arrives in V2 with the ratings system.)

---

## What Makes This Different

| Dimension | 3D Hub | Thingiverse | Printables | MakerWorld |
|-----------|--------|-------------|------------|------------|
| Printer-agnostic | ✅ | ✅ | ⚠️ Prusa-branded | ❌ Bambu-locked |
| Quality gate | ✅ Photo required | ❌ None | ⚠️ Community rating | ⚠️ Community rating |
| 3D viewer quality | ✅ Three.js, dominant | ❌ Weak | ⚠️ Basic | ⚠️ Basic |
| UX simplicity | ✅ Gallery-first | ❌ Cluttered/broken | ✅ Clean | ✅ Clean |
| Creator monetization | 🔜 V2+ | ❌ None | ⚠️ Points only | ⚠️ Points + crowdfund |

The unfair advantage is **execution speed and focus**: a solo developer who is also the target user, building exactly the platform they'd want to use — without committee decisions, brand obligations, or hardware ecosystem constraints.

---

## Who This Serves

**Primary — The Consumer (Maker/Hobbyist)**
Students, volunteers, home enthusiasts, and professionals who own a 3D printer and want to find reliable, print-ready models. Their core anxiety: *will this actually print?* Their ideal experience: find a model, see it from every angle, read what settings worked, download in one click.

**Primary — The Creator (Designer/Maker)**
Anyone who builds 3D models and wants to share them with the community — from first-time uploaders to experienced designers building a portfolio. Their core need: a platform that presents their work beautifully and makes sharing frictionless.

Both personas are served by the same platform — many users are both. The design explicitly caters to each role without forcing users into rigid buckets.

---

## Success Criteria

**For consumers (quality of experience):**
- A first-time visitor can find, evaluate, and download a model in under 2 minutes
- 80%+ of models have a printed photo and structured print metadata
- 3D viewer loads and is interactive within 3 seconds

**For creators (quality of contribution):**
- A first-time uploader can publish their first model in under 5 minutes
- Average guided upload wizard completion rate above 70%

**For platform health:**
- Registered user base growing month-over-month
- Return visit rate above 40% (users come back to browse, not just download once)
- Zero broken/inaccessible models (photo requirement enforces a minimum bar)
- Minimum 50 quality-seeded models published before public launch (solves cold-start empty grid problem)

---

## Scope

### V1 — MVP (This Build)

**In scope:**
- User registration and authentication (NextAuth.js — email/password)
- Guided 5-step upload wizard: file(s) → photo(s) → title/description/print metadata → tags/category → preview & publish
- STL and 3MF file support; 25MB per-file limit; multi-file model listings
- Hybrid tag system: predefined platform tags (clickable chips) + unlimited custom tags; both equally searchable
- Auto-generated 3D preview on file upload (Three.js)
- Interactive 3D viewer on model page (dominant layout, rotation/zoom/inspect)
- Homepage: model card grid, featured/trending section, category navigation, persistent search
- Search: by name, tag, category, uploader; default sort by download count; filters by category
- Model page: viewer, printed photos, description, print metadata, download button
- User profile: public creator portfolio, private download library
- Upload license consent (free-to-download, original work confirmation)
- Save as draft
- Post-publish redirect to live model page
- Upload nudge banner for non-uploaders
- Local file storage (photos + model files on disk)
- better-sqlite3 database (local, V1 only)
- Basic upload security: file type validation (STL/3MF only), size enforcement, no executable files accepted

**Explicitly out of scope for V1:**
- Ratings, reviews, comments (V2)
- Follow/follower system and notification feed (V2)
- Creator stats dashboard (V2)
- Paid/premium models (Future)
- Model customizer / parametric adjustment (Future)
- Moderation admin panel (Future)
- Social login (Future)
- External cloud storage/database migration (Future)

### V2 — Community Layer (Next Phase)
Ratings, reviews, follow system, creator stats, print settings community section, creator notifications.

### Future
Paid models, model customizer, trusted creator badges, moderation tools, events/contests, cloud storage migration.

---

## Technical Foundation (V1)

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js | Full-stack, API routes for backend |
| 3D Viewer | Three.js | Browser-based, no download required |
| Auth | NextAuth.js | Email + password, V1 only |
| Database | better-sqlite3 | Local SQLite, temporary — migrate in V2+ |
| File Storage | Local filesystem | Photos and model files on disk, temporary |
| Language | TypeScript | Assumed for Next.js project |

> **Migration note:** Both the database and file storage are intentionally temporary. The data model and API layer should be designed with future migration to Postgres + S3-compatible storage in mind.

---

## Vision

If 3D Hub succeeds, it becomes the printer-agnostic community standard for 3D model sharing — the platform that replaced Thingiverse without becoming anyone's hardware ecosystem. In 2-3 years: a thriving creator economy with a mix of free and paid models, version-controlled model updates, a follow/notification system that brings creators and their audiences together, and cloud infrastructure that scales with the community.

The long-term ambition is simple: the platform you'd actually recommend to someone buying their first 3D printer.
