# UX Consistency Patterns

## Button Hierarchy

| Variant | Appearance | Usage | Rule |
|---|---|---|---|
| **Primary** | Sage green fill (`#4A7C59`), white text | Download, Publish, Sign up, Upload | Maximum one primary action per page section |
| **Secondary** | White fill, sage green border | Save Draft, Log in, Back (wizard) | Supporting actions alongside a primary |
| **Ghost** | No border, muted text | Cancel, Dismiss, secondary nav links | Low-emphasis actions that should not compete with primary |
| **Destructive** | Red fill, white text — on confirmation only | Delete model, Remove uploaded file | Always preceded by a confirmation step; never fires on first click |
| **Icon-only** | Icon button, no visible label | Remove × on tag chips, clear search | Only where context makes action unambiguous; always has `aria-label` |

## Feedback Patterns

**Success — Toast notification** (bottom-right, sage green accent, auto-dismiss 4 seconds):
- "Your model is live!" — includes link to model page
- "Download started" — brief, auto-dismisses
- "Draft saved" — quiet, auto-dismisses

**Error — Two levels:**
- *Field-level:* Inline below the field, red text, specific message ("File must be STL or 3MF format") — never generic
- *System-level:* Toast with red accent for unexpected failures ("Upload failed — please try again")

**Warning — Amber inline banner** for recoverable or informational states:
- Draft model preview: "This is a draft — only you can see it"

**Progress:**
- Per-file progress bar during STL and photo uploads
- Wizard step indicator always visible during the entire upload flow

## Form Patterns

- **Labels:** Always visible above the field — never placeholder-only (placeholders disappear on input and break accessibility)
- **Required vs. optional:** All wizard fields are required by default; rare optional fields are labeled "(optional)" — no asterisk system
- **Validation timing:** Validate on Continue/Submit attempt, not on field blur — reduces premature error anxiety during input
- **Error placement:** Specific message directly below the offending field; field border turns red
- **Disabled Continue:** Continue button is visually muted and disabled when the current wizard step has unmet requirements; tooltip on hover explains what is missing
- **Helper text:** Short explanatory text below fields where expectation is not obvious (e.g. "Layer height in mm, e.g. 0.2")

## Navigation Patterns

- **Persistent nav:** Logo (→ homepage), search bar, auth CTAs visible on every page without exception
- **Active states:** Category pill → sage green fill and white text; tab nav → sage green underline and text color
- **Back navigation:** Browser back always works with no state loss; wizard has an explicit Back button that preserves all entered data
- **No breadcrumbs:** Navigation hierarchy is shallow enough (homepage → model page) that breadcrumbs add noise without value in V1
- **Post-action redirects:** Publish → live model page; registration → modal closes and download begins; login → returns to previous context

## Modal & Overlay Patterns

- **Registration modal:** Triggered by any auth-required action (Download, Bookmark) from an unauthenticated visitor; always shows what the user is about to get before the form fields
- **Dismissal:** All modals dismissible via Escape key or backdrop click; no accidental dismissal during active file upload
- **Focus trap:** Focus remains inside open modals; Tab cycles through interactive elements within the modal only
- **No stacking:** Never open a modal from inside another modal

## Empty States & Loading States

**Empty states:**
- *No search results:* "No models found for '[query]'" → suggestion to try different terms → "Browse all models" link
- *Empty creator profile (own):* "You haven't uploaded any models yet" + Upload CTA
- *Empty creator profile (others'):* Neutral empty state message, no CTA
- *Empty download library:* "No downloads yet" + Browse CTA
- *Homepage:* Never empty — 50 seeded models at launch is a hard pre-launch gate; grid must look populated and credible on day one

**Loading states:**
- *Card grid:* Skeleton cards matching exact ModelCard dimensions — prevents cumulative layout shift on load
- *Model page:* Skeleton for photo area and metadata block during SSR hydration
- *Search suggestions:* Inline spinner in dropdown after 2-character threshold while fetching
- *File upload:* Per-file progress bar; wizard Continue button reflects overall upload state

## Search & Filtering Patterns

- **Search entry:** 2-character minimum before suggestions appear; suggestions grouped by type (Models · Tags · Creators)
- **Search results:** Sort dropdown (Most Downloaded default · Newest · A–Z); category filter pills; result count always shown
- **Category filtering:** Single-select pill chips — selecting a new category deselects the previous one
- **Filter application:** URL updates with filter state (shareable and browser-back-safe); content updates without full page reload
- **No results recovery:** Always offer a path forward — "Clear filters" link or "Browse all models" CTA; never a dead end with no escape
