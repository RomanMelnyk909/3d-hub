# Component Strategy

## Design System Components

shadcn/ui components used directly (no custom implementation needed):

| Component | Used for |
|---|---|
| `Button` | Download, Publish, Upload, Log in, Sign up CTAs |
| `Input` | Search bar, registration form fields, metadata text fields |
| `Textarea` | Model description in upload wizard Step 3 |
| `Select` | Filament type dropdown in metadata step |
| `Dialog` | Registration/login modal base, confirmation dialogs |
| `Badge` | Tag chips on cards and model page |
| `Progress` | File upload progress bar |
| `Toast` | "Your model is live!", error notifications, download confirmation |
| `Card` | Base structure for ModelCard (extended) |
| `Tabs` | Profile page Published / Library tabs |
| `Label` | All form field labels in upload wizard |
| `Checkbox` | License consent (Step 5), filter checkboxes |
| `Skeleton` | Loading state for card grid |
| `Alert` | Inline form errors, wizard step block messages |
| `Tooltip` | Metadata field explanations (e.g. "What is infill %?") |

## Custom Components

### ModelCard
**Purpose:** Primary unit of the browse experience — photo-dominant card representing one published model.
**Anatomy:** Photo area (75% card height, Next.js `<Image>` optimized) → Title (h3, max 2 lines truncated) → Stat line (download count + primary tag chip)
**States:** Default · Hover (subtle shadow lift, sage green border tint) · Loading (Skeleton)
**Variants:** Standard (grid view) · Compact (search results row)
**Accessibility:** `role="article"`, `aria-label="{model title}"`, photo uses creator-provided alt text
**Interaction:** Entire card is clickable → navigates to model page

### PrintMetadataBlock
**Purpose:** Structured display of print settings — the core consumer confidence element on the model page.
**Anatomy:** 2×2 grid of key/value pairs: Layer Height · Infill % · Supports Required · Filament Type. Each pair: muted label (12px) + value (14px, medium weight)
**States:** Complete (all 4 fields present) · Partial (missing fields show "—" in muted style)
**Accessibility:** Rendered as `<dl>` description list with `<dt>` labels and `<dd>` values

### PhotoGallery
**Purpose:** Multi-angle printed photo viewer on model page — primary trust signal.
**Anatomy:** Large primary photo → thumbnail strip below → photo count indicator
**States:** Single photo · Multiple photos (prev/next navigation) · Lightbox (full-screen overlay)
**Accessibility:** Arrow key navigation between photos, `aria-label="Photo {n} of {total}"`, Escape closes lightbox

### UploadWizard
**Purpose:** 5-step shell managing step navigation, state persistence, and validation gating.
**Anatomy:** WizardStepIndicator (top) → current step content area → Back / Continue button row
**States per step:** Upcoming · Active · Completed · Blocked (validation failed, Continue disabled)
**Behavior:** Continue disabled until current step validates; Back always enabled; draft auto-saved on each step advance

### WizardStepIndicator
**Purpose:** Visual progress through the 5 upload steps — always visible, shows creator where they are.
**Anatomy:** 5 numbered circles connected by lines → step label below each
**States per step:** Upcoming (gray) · Active (sage green) · Completed (green with checkmark)
**Accessibility:** `aria-current="step"` on active step; completed steps announced to screen readers

### FileUploadZone
**Purpose:** Drag-and-drop zone for STL/3MF file upload in wizard Step 1.
**Anatomy:** Dashed border area with icon + "Drop files here or browse" → file list with name, size, and remove button per file
**States:** Idle · Drag-over (green border, mint fill) · Uploading (progress per file) · Error (red border, specific message per file) · Success (checkmarks)
**Validation:** File type and size checked immediately on drop/select; specific error message per rejected file

### PhotoUploadZone
**Purpose:** Drag-and-drop photo upload in wizard Step 2 with thumbnail previews.
**Anatomy:** Upload area → thumbnail grid of uploaded photos (each with remove ×) → "At least 1 photo required" step-lock indicator
**States:** Empty (Continue blocked, reason visible) · Has photos (Continue unlocked) · Uploading
**Copy:** Positive framing — "Show off your printed result" — not "Upload required"

### SearchBar
**Purpose:** Persistent search input with live suggestion dropdown, accessible from all pages.
**Anatomy:** Input with search icon → dropdown: model name matches · tag matches · creator matches
**States:** Idle · Focused (sage green border) · Has suggestions · No results ("No models found — try a different term")
**Behavior:** Suggestions appear after 2+ characters typed; full keyboard navigation through suggestions; Enter goes to results page

### TagSelector
**Purpose:** Hybrid tag input in wizard Step 4 — predefined platform chips plus unlimited custom tags.
**Anatomy:** Predefined chip button row (toggle on/off) → custom tag text input → selected custom tags shown as removable chips
**States:** Chip unselected · Chip selected (sage green fill) · Custom tag: typing · added (chip with × remove)
**Accessibility:** Chips are `role="checkbox"`; custom tag additions announced to screen readers

### DownloadButton
**Purpose:** Single CTA that handles authentication state — the conversion-critical button.
**Anatomy:** Full-width primary Button with download icon + "Download" label
**States:** Authenticated (click → immediate download) · Unauthenticated (click → RegistrationModal opens) · Downloading (brief loading indicator) · Done ("Downloading…" label, auto-resets)
**Behavior:** Never navigates away from the model page — download or modal, always in context

### RegistrationModal
**Purpose:** Auth gate that converts visitors to registered users at the exact moment of download intent.
**Anatomy:** Extends shadcn/ui Dialog — model thumbnail visible in header area → Register / Log In tab switcher → minimal form (email + password) → submit CTA
**States:** Register view · Login view · Submitting · Field errors (inline)
**Behavior:** After successful registration or login, modal closes and download begins automatically — zero extra steps

## Component Implementation Strategy

- All custom components consume Tailwind CSS v4 design tokens for colors, spacing, and typography — no hardcoded values
- Custom components are built on top of shadcn/ui primitives where applicable (e.g. RegistrationModal extends Dialog, ModelCard extends Card)
- Components are co-located with their page usage in the Next.js `components/` directory
- Each component handles its own loading and error states — no parent-managed loading flags

## Implementation Roadmap

**Phase 1 — Consumer download path (launch-blocking):**
`ModelCard` → `ModelCardGrid` with Skeleton → `PrintMetadataBlock` → `SearchBar` → `DownloadButton` → `RegistrationModal`

**Phase 2 — Creator upload path (launch-blocking):**
`FileUploadZone` → `PhotoUploadZone` → `WizardStepIndicator` → `UploadWizard` shell → `TagSelector`

**Phase 3 — Polish and enhancement (post-launch):**
`PhotoGallery` lightbox → category filter pill bar → bookmark button → user avatar with profile link
