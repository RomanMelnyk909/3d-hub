# Visual Design Foundation

## Color System

Brand direction: light green tones. Green frames UI chrome (header, buttons, accents, tags) while card and page backgrounds stay white or near-white so printed model photos remain the visual star. Green on backgrounds is used as a subtle warmth, never as a dominant fill that competes with photography.

| Role | Name | Value | Usage |
|---|---|---|---|
| **Brand Primary** | Sage Green | `#4A7C59` | Buttons, active states, key actions, links |
| **Primary Hover** | Deep Sage | `#3A6347` | Hover and pressed states |
| **Primary Light** | Soft Mint | `#D4EDDA` | Tag chips, badges, subtle highlights, hover backgrounds |
| **Background** | Warm Off-White | `#F8FAF8` | Page background — slight green warmth, never competes with photos |
| **Card Background** | Pure White | `#FFFFFF` | Model cards — photos pop best on pure white |
| **Border** | Light Gray-Green | `#E2EBE4` | Card borders, dividers, input borders |
| **Text Primary** | Near-Black | `#111827` | Headings, body text, model titles |
| **Text Muted** | Cool Gray | `#6B7280` | Metadata labels, secondary text, timestamps |
| **Success** | Sage Green | `#4A7C59` | Published state, download confirmed — reuses brand primary |
| **Error** | Warm Red | `#DC2626` | Upload errors, validation failures, required field alerts |
| **Warning** | Amber | `#D97706` | Draft status, incomplete upload fields |

**Accessibility compliance:**
- Brand Primary `#4A7C59` on white: ~4.8:1 contrast ratio — passes WCAG AA ✓
- Text Primary `#111827` on background `#F8FAF8`: ~18:1 — passes WCAG AAA ✓
- Error `#DC2626` on white: ~5.9:1 — passes WCAG AA ✓
- Focus rings: `#4A7C59` outline, 2px offset — visible on all backgrounds

## Typography System

- **Primary font:** Inter (Google Fonts) — clean, highly legible at small sizes, ideal for metadata-heavy content
- **Fallback stack:** system-ui → -apple-system → sans-serif
- **Tone:** Modern and neutral; typography steps back so model photography leads

| Level | Size | Weight | Usage |
|---|---|---|---|
| `h1` | 2.25rem / 36px | 700 | Page titles, hero text |
| `h2` | 1.5rem / 24px | 600 | Section headings |
| `h3` | 1.125rem / 18px | 600 | Card titles, model names |
| `body` | 1rem / 16px | 400 | Descriptions, body content |
| `small` | 0.875rem / 14px | 400 | Metadata values, tags, stat lines |
| `label` | 0.75rem / 12px | 500 | Form labels, metadata field keys |

## Spacing & Layout Foundation

- **Base unit:** 8px — all spacing is multiples of 8 (8, 16, 24, 32, 48, 64px)
- **Card grid:** 4 columns desktop → 3 tablet (lg) → 2 small tablet (sm) → 1 mobile
- **Card gap:** 24px — generous breathing room consistent with gallery aesthetic
- **Section padding:** 48–64px vertical; 24px horizontal on mobile
- **Max content width:** 1280px centered with auto margins
- **Card border radius:** 10px — modern without being playful
- **Button border radius:** 8px — consistent with card family

**Layout principles:**
- Breathing room over density — 3D Hub's gallery feel depends on generous whitespace
- Photo area is always the largest element in any card or page layout
- Metadata and actions are subordinate to the visual content, never competing

## Accessibility Considerations

- All interactive elements meet WCAG AA contrast minimums (4.5:1 for normal text, 3:1 for large text)
- Focus states use brand green outline with 2px offset — visible on all backgrounds including card white and page off-white
- Form fields in upload wizard include visible labels (not placeholder-only) to maintain accessibility when field has content
- Error messages are specific and actionable, not generic — screen readers can communicate what went wrong and what to do
- Image alt text required for all uploaded model photos (creator-provided during upload)
