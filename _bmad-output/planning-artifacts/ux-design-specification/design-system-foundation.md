# Design System Foundation

## Design System Choice

**Tailwind CSS v4 + shadcn/ui**

Tailwind CSS v4 is already installed in the project. shadcn/ui is the dominant component layer for Next.js + TypeScript projects as of 2025–2026 — not a traditional library but a collection of copy-paste components built on Radix UI primitives. Components live in the codebase, not as a locked dependency.

## Rationale for Selection

- **Already installed:** Tailwind CSS v4 is in `package.json` — zero additional setup for the foundation
- **Ecosystem fit:** shadcn/ui is the de facto standard in the Next.js + TypeScript ecosystem; strong community, excellent documentation
- **Visual freedom:** No opinionated design language (no Material Design, no Bootstrap chrome) — full control to achieve the gallery aesthetic
- **Accessibility included:** Radix UI primitives provide keyboard navigation and screen reader support without extra implementation work
- **Solo developer efficiency:** Pre-built primitives (Card, Button, Dialog, Input, Badge, Select, Progress, Toast) eliminate days of component groundwork, freeing time for product-specific features
- **Code ownership:** Components are copied into the project — no version-lock, no fighting library defaults when customization is needed

## Implementation Approach

**Foundation layer — Tailwind CSS v4:**
All utility styling, design tokens (colors, spacing, typography scale, border radius), and responsive breakpoints defined here.

**Component layer — shadcn/ui primitives used in V1:**
- `Card` — model cards, profile sections
- `Button` — download, publish, upload actions
- `Input`, `Textarea`, `Select` — upload wizard form fields
- `Dialog` — registration gate, confirmation modals
- `Badge` — tags, category chips
- `Progress` — upload wizard step indicator, file upload progress
- `Toast` — success/error feedback

**Custom components built on top:**
- `ModelCard` — photo-dominant card with stat line (download count, tag chips)
- `PrintMetadataBlock` — structured display of layer height, infill %, supports, filament type
- `PhotoGallery` — multi-angle photo viewer on model page
- `UploadWizard` — 5-step wizard shell with step navigation and progress
- `SearchBar` — persistent search input with live suggestions

## Customization Strategy

- **Color palette:** Dark-neutral or near-white base that reads "design gallery" rather than "SaaS dashboard"; high-contrast photo thumbnails pop against a restrained background
- **Typography:** Inter (or system-ui fallback) for all UI text — clean, readable, no personality interference with model photography
- **Border radius:** Slightly rounded cards (8–12px) for a modern gallery feel; avoid sharp corners (clinical) and excessive rounding (playful)
- **Spacing:** Generous — 3D Hub's aesthetic depends on breathing room between cards and content sections
- **shadcn/ui overrides:** Minimal — adapt color tokens, card radius, and button variants to match brand feel; avoid fighting the component defaults
